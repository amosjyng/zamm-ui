// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use diesel::sqlite::SqliteConnection;

use setup::api_keys::{setup_api_keys, ApiKeys};
#[cfg(debug_assertions)]
use specta::collect_types;

#[cfg(debug_assertions)]
use tauri_specta::ts;

use std::env;

use std::sync::Mutex;
mod commands;
mod models;
mod python_api;
#[cfg(test)]
mod sample_call;
mod schema;
mod setup;
use commands::{get_api_keys, get_preferences, greet, play_sound};

pub struct ZammDatabase(Mutex<Option<SqliteConnection>>);
pub struct ZammApiKeys(Mutex<ApiKeys>);

fn main() {
    #[cfg(debug_assertions)]
    ts::export(
        collect_types![greet, get_api_keys, play_sound, get_preferences],
        "../src-svelte/src/lib/bindings.ts",
    )
    .unwrap();

    let possible_db = setup::get_db();

    tauri::Builder::default()
        .manage(ZammDatabase(Mutex::new(possible_db)))
        .manage(ZammApiKeys(Mutex::new(setup_api_keys())))
        .invoke_handler(tauri::generate_handler![
            greet,
            get_api_keys,
            play_sound,
            get_preferences
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
