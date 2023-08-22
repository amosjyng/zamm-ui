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
    use super::{greet_helper, MockSidecarExecutor};

    #[test]
    fn test_greet_name() {
        let mut mock = MockSidecarExecutor::new();
        mock.expect_execute()
            .withf(|cmd, args| {
                assert_eq!(cmd, "zamm-python");
                assert_eq!(args, &vec!["{\"name\":\"Test\"}"]);
                true
            })
            .returning(|_, _| {
                Ok(
                    "{\"greeting\":\"Hello, Test! You have been greeted from Python\"}"
                        .to_string(),
                )
            });

        let result = greet_helper(&mock, "Test");
        assert_eq!(
            result,
            "Hello, Test! You have been greeted from Python via Rust"
        );
    }
}
