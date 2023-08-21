// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use diesel::sqlite::SqliteConnection;
use futures::executor;
use specta::collect_types;
use specta::specta;
use tauri::api::process::{Command, CommandEvent};
use tauri_specta::ts;
use tauri_utils::platform;

use std::env;

use std::sync::Mutex;
mod models;
mod schema;
mod setup;

struct ZammDatabase(Mutex<Option<SqliteConnection>>);

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

trait SidecarExecutor {
    fn execute<I, S>(command: &str, args: I) -> Result<String>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>;
}

struct SidecarExecutorImpl;

impl SidecarExecutor for SidecarExecutorImpl {
    fn execute<I, S>(command: &str, args: I) -> Result<String>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
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

#[tauri::command]
#[specta]
fn greet(name: &str) -> String {
    let result = SidecarExecutorImpl::execute("zamm-python", vec![name]).unwrap();
    format!("{result} via Rust")
}

fn main() {
    #[cfg(debug_assertions)]
    ts::export(collect_types![greet], "../src-svelte/src/lib/bindings.ts").unwrap();

    let possible_db = setup::get_db();

    tauri::Builder::default()
        .manage(ZammDatabase(Mutex::new(possible_db)))
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::greet;

    #[test]
    fn test_greet_name() {
        let result = greet("Test");
        assert_eq!(
            result,
            "Hello, Test! You have been greeted from Python via Rust"
        );
    }
}
