use crate::setup::api_keys::ApiKeys;
use crate::ZammApiKeys;
use specta::specta;
use std::clone::Clone;
use tauri::State;

fn get_api_keys_helper(zamm_api_keys: &ZammApiKeys) -> ApiKeys {
    zamm_api_keys.0.lock().unwrap().clone()
}

#[tauri::command(async)]
#[specta]
pub fn get_api_keys(api_keys: State<ZammApiKeys>) -> ApiKeys {
    get_api_keys_helper(&api_keys)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sample_call::SampleCall;
    use crate::setup::api_keys::{ApiKey, Source};
    use std::sync::Mutex;

    use std::fs;

    fn parse_api_keys(response_str: &str) -> ApiKeys {
        serde_json::from_str(response_str).unwrap()
    }

    fn read_sample(filename: &str) -> SampleCall {
        let sample_str = fs::read_to_string(filename)
            .unwrap_or_else(|_| panic!("No file found at {filename}"));
        serde_json::from_str(&sample_str).unwrap()
    }

    fn check_get_api_keys_sample(file_prefix: &str, rust_input: &ZammApiKeys) {
        let greet_sample = read_sample(file_prefix);
        // zero frontend arguments to get_api_keys
        assert_eq!(greet_sample.request.len(), 0);

        let actual_keys = get_api_keys_helper(rust_input);
        let expected_keys = parse_api_keys(&greet_sample.response);
        assert_eq!(actual_keys, expected_keys);
    }

    #[test]
    fn test_get_empty_keys() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));

        check_get_api_keys_sample(
            "./api/sample-calls/get_api_keys-empty.json",
            &api_keys,
        );
    }

    #[test]
    fn test_get_openai_key() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys {
            openai: Some(ApiKey {
                value: "0p3n41-4p1-k3y".to_string(),
                source: Source::Environment,
            }),
        }));

        check_get_api_keys_sample(
            "./api/sample-calls/get_api_keys-openai.json",
            &api_keys,
        );
    }
}
