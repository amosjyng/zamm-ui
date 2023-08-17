// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use diesel::sqlite::SqliteConnection;

use std::env;

use std::sync::Mutex;
mod models;
mod schema;
mod setup;

struct ZammDatabase(Mutex<Option<SqliteConnection>>);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
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
        assert_eq!(result, "Hello, Test! You've been greeted from Rust!");
    }
}
