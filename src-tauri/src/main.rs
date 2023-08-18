// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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

#[tauri::command]
#[specta]
fn greet(name: &str) -> String {
    let expected_binary_path = relative_command_path("zamm-python".to_string())
        .expect("Failed to get expected binary path");
    let (mut rx, mut _child) = Command::new_sidecar("zamm-python")
        .expect("failed to create `zamm-python` binary command")
        .args(vec![name])
        .spawn()
        .unwrap_or_else(|err| {
            panic!(
                "Failed to spawn sidecar at {}: {}",
                expected_binary_path, err
            )
        });

    // https://stackoverflow.com/a/52521592
    let result = executor::block_on(tauri::async_runtime::spawn(async move {
        let mut last_line = "No output".to_string();
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                last_line = format!("{} via Rust", line);
            }
        }
        last_line
    }));
    result.unwrap_or("Failed to get output".to_string())
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
