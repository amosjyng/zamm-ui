// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use diesel::sqlite::SqliteConnection;

#[cfg(debug_assertions)]
use specta::collect_types;

#[cfg(debug_assertions)]
use tauri_specta::ts;

use std::env;

use std::sync::Mutex;
mod commands;
mod models;
mod schema;
mod setup;
use commands::greet;

struct ZammDatabase(Mutex<Option<SqliteConnection>>);

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
