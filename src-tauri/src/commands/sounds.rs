use rodio::{source::Source, Decoder, OutputStream};
use serde::{Deserialize, Serialize};
use specta::specta;
use specta::Type;

use std::include_bytes;
use std::thread;

use std::io::Cursor;

use crate::commands::errors::ZammResult;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, Type)]
pub enum Sound {
    Switch,
}

#[tauri::command]
#[specta]
pub fn play_sound(sound: Sound) {
    thread::spawn(move || {
        if let Err(e) = play_sound_async(sound) {
            eprintln!("Error playing sound: {}", e);
        }
    });
}

fn play_sound_async(sound: Sound) -> ZammResult<()> {
    let (_stream, stream_handle) = OutputStream::try_default()?;
    let embedded_sound = match sound {
        Sound::Switch => include_bytes!("../../sounds/switch.ogg"),
    };
    let cursor = Cursor::new(embedded_sound);
    let source = Decoder::new(cursor)?;
    stream_handle.play_raw(source.convert_samples())?;
    thread::sleep(std::time::Duration::from_secs(1));
    Ok(())
}
