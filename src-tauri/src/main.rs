// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::executor;

use oxigraph::store::StorageError;
use oxigraph::store::Store;

use std::sync::Mutex;
use tauri::api::process::{Command, CommandEvent};

const DB_NAME: &str = "zamm.db";

struct GraphDB(Mutex<Store>);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    // `new_sidecar()` expects just the filename, NOT the whole path like in JavaScript
    let (mut rx, mut _child) = Command::new_sidecar("zamm-python")
        .expect("failed to create `zamm-python` binary command")
        .args(vec![name])
        .spawn()
        .expect("Failed to spawn sidecar");

    // https://stackoverflow.com/a/52521592
    let result = executor::block_on(tauri::async_runtime::spawn(async move {
        let mut last_line = "No output".to_string();
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                last_line = format!("{} via Rust!", line);
            }
        }
        last_line
    }));
    result.unwrap_or("Failed to get output".to_string())
}

fn main() -> Result<(), StorageError> {
    let store = Store::open(DB_NAME)?;

    tauri::Builder::default()
        .manage(GraphDB(Mutex::new(store)))
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
