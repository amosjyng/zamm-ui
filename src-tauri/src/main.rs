// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use directories::ProjectDirs;
use oxigraph::store::StorageError;
use oxigraph::store::Store;

use std::env;

use std::sync::Mutex;

const DB_NAME: &str = "zamm.db";

struct GraphDB(Mutex<Store>);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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

#[cfg(test)]
mod tests {
    use super::greet;

    #[test]
    fn test_greet_name() {
        let result = greet("Test");
        assert_eq!(result, "Hello, Test! You've been greeted from Rust!");
    }
}
