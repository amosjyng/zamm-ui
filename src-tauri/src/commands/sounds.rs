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
    Whoosh,
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
    let embedded_sound: &[u8] = match sound {
        Sound::Switch => include_bytes!("../../sounds/switch.ogg"),
        Sound::Whoosh => include_bytes!("../../sounds/whoosh.ogg"),
    };
    let cursor = Cursor::new(embedded_sound);
    let source = Decoder::new(cursor)?;
    stream_handle.play_raw(source.convert_samples())?;
    thread::sleep(std::time::Duration::from_secs(1));
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sample_call::SampleCall;

    use std::fs;

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
    struct PlaySoundRequest {
        sound: Sound,
    }

    fn parse_request(request_str: &str) -> PlaySoundRequest {
        serde_json::from_str(request_str).unwrap()
    }

    fn read_sample(filename: &str) -> SampleCall {
        let sample_str = fs::read_to_string(filename)
            .unwrap_or_else(|_| panic!("No file found at {filename}"));
        serde_yaml::from_str(&sample_str).unwrap()
    }

    fn check_play_sound_sample(file_prefix: &str) {
        let greet_sample = read_sample(file_prefix);
        assert_eq!(greet_sample.request.len(), 2);
        assert_eq!(greet_sample.request[0], "play_sound");

        let request = parse_request(&greet_sample.request[1]);
        #[allow(clippy::let_unit_value)]
        let actual_result = play_sound(request.sound);
        let actual_json = serde_json::to_string(&actual_result).unwrap();
        let expected_json = greet_sample.response;
        assert_eq!(actual_json, expected_json);
    }

    #[test]
    fn test_play_switch() {
        check_play_sound_sample("./api/sample-calls/play_sound-switch.yaml");
    }

    #[test]
    fn test_play_whoosh() {
        check_play_sound_sample("./api/sample-calls/play_sound-whoosh.yaml");
    }
}