use anyhow::Result;

use futures::executor;

use crate::python_api::{GreetArgs, GreetResponse};
use serde::{Deserialize, Serialize};
use specta::specta;
use tauri::api::process::{Command, CommandEvent};

use tauri_utils::platform;

use mockall::automock;

fn relative_command_path(command: String) -> tauri::Result<String> {
    match platform::current_exe()?.parent() {
        #[cfg(windows)]
        Some(exe_dir) => Ok(format!("{}\\{command}.exe", exe_dir.display())),
        #[cfg(not(windows))]
        Some(exe_dir) => Ok(format!("{}/{command}", exe_dir.display())),
        None => Err(tauri::api::Error::Command(
            "Could not evaluate executable dir".to_string(),
        )
        .into()),
    }
}

#[derive(thiserror::Error, Debug)]
enum Error {
    #[error("Failed to spawn sidecar at {expected_path}: {tauri_error}")]
    SidecarSpawnError {
        expected_path: String,
        tauri_error: tauri::api::Error,
    },
}

#[automock]
trait SidecarExecutor {
    #[allow(clippy::needless_lifetimes)]
    fn execute<'a>(&self, command: &str, args: &[&'a str]) -> Result<String>;
}

struct SidecarExecutorImpl;

impl SidecarExecutor for SidecarExecutorImpl {
    fn execute(&self, command: &str, args: &[&str]) -> Result<String> {
        let expected_binary_path = relative_command_path(command.into())?;
        let (mut rx, mut _child) =
            match Command::new_sidecar(command)?.args(args).spawn() {
                Ok((rx, child)) => (rx, child),
                Err(err) => {
                    return Err(Error::SidecarSpawnError {
                        expected_path: expected_binary_path,
                        tauri_error: err,
                    }
                    .into())
                }
            };

        // https://stackoverflow.com/a/52521592
        let stdout = executor::block_on(tauri::async_runtime::spawn(async move {
            let mut output = String::new();
            while let Some(event) = rx.recv().await {
                if let CommandEvent::Stdout(line) = event {
                    output.push_str(&line);
                } else if let CommandEvent::Error(line) = event {
                    output.push_str(&line);
                }
            }
            output
        }))?;

        Ok(stdout)
    }
}

fn process<T: Serialize, U: for<'de> Deserialize<'de>>(
    s: &impl SidecarExecutor,
    command: &str,
    input: &T,
) -> Result<U> {
    let input_json = serde_json::to_string(input)?;
    let result_json = s.execute(command, &[&input_json])?;
    let response: U = serde_json::from_str(&result_json)?;

    Ok(response)
}

fn greet_helper<T: SidecarExecutor>(t: &T, name: &str) -> String {
    let result = process::<GreetArgs, GreetResponse>(
        t,
        "zamm-python",
        &GreetArgs { name: name.into() },
    )
    .unwrap();
    let greeting = result.greeting;
    format!("{greeting} via Rust")
}

#[tauri::command]
#[specta]
pub fn greet(name: &str) -> String {
    greet_helper(&SidecarExecutorImpl {}, name)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn parse_greet(args_str: &str) -> GreetArgs {
        serde_json::from_str(args_str).unwrap()
    }

    fn read_file(file_prefix: &str, suffix: &str) -> String {
        let expected_path = format!("{file_prefix}{suffix}");
        fs::read_to_string(&expected_path)
            .unwrap_or_else(|_| panic!("No file found at {expected_path}"))
    }

    fn check_greet_sample(file_prefix: &str, rust_input: &str, rust_result: &str) {
        let greet_args_str = read_file(file_prefix, "_args.json");
        let greet_response_str = read_file(file_prefix, "_response.json");

        let mut mock = MockSidecarExecutor::new();
        mock.expect_execute()
            .withf(move |cmd, args| {
                assert_eq!(cmd, "zamm-python");

                let actual_args = parse_greet(args[0]);
                let expected_args = parse_greet(&greet_args_str);
                assert_eq!(actual_args, expected_args);

                true
            })
            .return_once(move |_, _| Ok(greet_response_str));

        let result = greet_helper(&mock, rust_input);
        assert_eq!(result, rust_result);
    }

    #[test]
    fn test_greet_name() {
        check_greet_sample(
            "../src-python/api/sample-calls/greet",
            "Test",
            "Hello, Test! You have been greeted from Python via Rust",
        );
    }

    #[test]
    fn test_greet_empty_name() {
        check_greet_sample(
            "../src-python/api/sample-calls/greet_empty",
            "",
            "Hello, ! You have been greeted from Python via Rust",
        );
    }
}
