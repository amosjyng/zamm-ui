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
    use std::sync::Mutex;

    use std::fs;

    fn read_sample(filename: &str) -> SampleCall {
        let sample_str = fs::read_to_string(filename)
            .unwrap_or_else(|_| panic!("No file found at {filename}"));
        serde_yaml::from_str(&sample_str).unwrap()
    }

    fn check_get_api_keys_sample(file_prefix: &str, rust_input: &ZammApiKeys) {
        let greet_sample = read_sample(file_prefix);
        assert_eq!(greet_sample.request, vec!["get_api_keys"]);

        let actual_result = get_api_keys_helper(rust_input);
        let actual_json = serde_json::to_string_pretty(&actual_result).unwrap();
        let expected_json = greet_sample.response.trim();
        assert_eq!(actual_json, expected_json);
    }

    #[test]
    fn test_get_empty_keys() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));

        check_get_api_keys_sample(
            "./api/sample-calls/get_api_keys-empty.yaml",
            &api_keys,
        );
    }

    #[test]
    fn test_get_openai_key() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys {
            openai: Some("0p3n41-4p1-k3y".to_string()),
        }));

        check_get_api_keys_sample(
            "./api/sample-calls/get_api_keys-openai.yaml",
            &api_keys,
        );
    }
}
