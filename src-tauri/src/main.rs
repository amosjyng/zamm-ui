// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::executor;

use directories::ProjectDirs;
use oxigraph::store::StorageError;
use oxigraph::store::Store;

use std::env;

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
    let db_path = if let Some(zamm_dirs) = ProjectDirs::from("dev", "zamm", "ZAMM") {
        zamm_dirs.data_dir().join(DB_NAME)
    } else {
        eprintln!("Cannot find user home directory, defaulting to current dir.");
        env::current_dir()?.as_path().join(DB_NAME)
    };
    let store = Store::open(db_path.as_path())?;
    let db_path_display = db_path.display();
    println!("Graph database opened at {db_path_display}");

    tauri::Builder::default()
        .manage(GraphDB(Mutex::new(store)))
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
