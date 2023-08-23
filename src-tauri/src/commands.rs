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
    binary: &str,
    command: &str,
    input: &T,
) -> Result<U> {
    let input_json = serde_json::to_string(input)?;
    let result_json = s.execute(binary, &[command, &input_json])?;
    let response: U = serde_json::from_str(&result_json)?;

    Ok(response)
}

fn greet_helper<T: SidecarExecutor>(t: &T, name: &str) -> String {
    let result = process::<GreetArgs, GreetResponse>(
        t,
        "zamm-python",
        "greet",
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
    use crate::sample_call::SampleCall;

    use std::fs;

    fn parse_greet(args_str: &str) -> GreetArgs {
        serde_json::from_str(args_str).unwrap()
    }

    fn read_sample(filename: &str) -> SampleCall {
        let sample_str = fs::read_to_string(filename)
            .unwrap_or_else(|_| panic!("No file found at {filename}"));
        serde_yaml::from_str(&sample_str).unwrap()
    }

    fn check_greet_sample(file_prefix: &str, rust_input: &str, rust_result: &str) {
        let greet_sample = read_sample(file_prefix);

        let mut mock = MockSidecarExecutor::new();
        mock.expect_execute()
            .withf(move |cmd, actual_cmd_args| {
                assert_eq!(cmd, "zamm-python");

                let expected_cmd_args = &greet_sample.request;
                assert_eq!(actual_cmd_args.len(), expected_cmd_args.len());
                assert_eq!(actual_cmd_args[0], expected_cmd_args[0]);

                let actual_greet_args = parse_greet(actual_cmd_args[1]);
                let expected_greet_args = parse_greet(&expected_cmd_args[1]);
                assert_eq!(actual_greet_args, expected_greet_args);

                true
            })
            .return_once(move |_, _| Ok(greet_sample.response));

        let result = greet_helper(&mock, rust_input);
        assert_eq!(result, rust_result);
    }

    #[test]
    fn test_greet_name() {
        check_greet_sample(
            "../src-python/api/sample-calls/greet.yaml",
            "Test",
            "Hello, Test! You have been greeted from Python via Rust",
        );
    }

    #[test]
    fn test_greet_empty_name() {
        check_greet_sample(
            "../src-python/api/sample-calls/greet_empty.yaml",
            "",
            "Hello, ! You have been greeted from Python via Rust",
        );
    }
}
