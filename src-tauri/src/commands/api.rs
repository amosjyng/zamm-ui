use futures::executor;

use serde::{Deserialize, Serialize};

use tauri::api::process::{Command, CommandEvent};

use crate::commands::errors::{Error, SidecarResponseError, ZammResult};
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

#[automock]
pub trait SidecarExecutor {
    #[allow(clippy::needless_lifetimes)]
    fn execute<'a>(&self, command: &str, args: &[&'a str]) -> ZammResult<String>;
}

pub struct SidecarExecutorImpl;

impl SidecarExecutor for SidecarExecutorImpl {
    fn execute(&self, command: &str, args: &[&str]) -> ZammResult<String> {
        let expected_binary_path = relative_command_path(command.into())?;
        let (mut rx, mut _child) =
            match Command::new_sidecar(command)?.args(args).spawn() {
                Ok((rx, child)) => (rx, child),
                Err(err) => {
                    return Err(Error::SidecarSpawn {
                        expected_path: expected_binary_path,
                        tauri_error: err,
                    })
                }
            };

        executor::block_on(tauri::async_runtime::spawn(async move {
            let mut output = String::new();
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        output.push_str(&line);
                        output.push('\n');
                    }
                    CommandEvent::Stderr(line) => {
                        output.push_str(&line);
                        output.push('\n');
                    }
                    CommandEvent::Error(line) => {
                        return Err(Error::SidecarCommandErr { line })
                    }
                    CommandEvent::Terminated(_) => break,
                    _ => return Err(Error::SidecarUnexpectedCommandEvent),
                }
            }
            Ok(output)
        }))?
    }
}

pub fn process<T: Serialize, U: for<'de> Deserialize<'de>>(
    s: &impl SidecarExecutor,
    binary: &str,
    command: &str,
    input: &T,
) -> ZammResult<U> {
    let input_json = serde_json::to_string(input)?;
    let result_json = s.execute(binary, &[command, &input_json])?;
    let response: U = match serde_json::from_str(&result_json) {
        Ok(response) => response,
        Err(err) => {
            let binary_path = relative_command_path(binary.into())?;
            return Err(SidecarResponseError {
                request: vec![binary_path, command.into(), input_json],
                response: result_json,
                source: err,
            }
            .into());
        }
    };

    Ok(response)
}
