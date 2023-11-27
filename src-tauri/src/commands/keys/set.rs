use crate::commands::errors::ZammResult;
use crate::setup::api_keys::{ApiKeys, Service};
use crate::ZammApiKeys;
use specta::specta;
use tauri::State;

use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::path::Path;

fn set_api_key_helper(
    api_keys: &mut ApiKeys,
    filename: Option<&str>,
    service: &Service,
    api_key: String,
) -> ZammResult<()> {
    // write new API key to disk before we can no longer borrow it
    let init_update_result = || -> ZammResult<()> {
        if let Some(filename) = filename {
            let ends_in_newline = {
                if Path::new(filename).exists() {
                    let mut file = OpenOptions::new().read(true).open(filename)?;
                    let mut contents = String::new();
                    file.read_to_string(&mut contents)?;
                    contents.ends_with('\n')
                } else {
                    true // no need to start the file with a newline later
                }
            };

            let mut file = OpenOptions::new()
                .create(true)
                .write(true)
                .append(true)
                .open(filename)?;
            if !ends_in_newline {
                writeln!(file)?;
            }
            writeln!(file, "export OPENAI_API_KEY=\"{}\"", api_key)?;
        }
        Ok(())
    }();
    // assign ownership of new API key string to in-memory API keys
    api_keys.update(service, api_key);
    init_update_result
}

#[tauri::command(async)]
#[specta]
pub fn set_api_key(
    api_keys: State<ZammApiKeys>,
    filename: Option<&str>,
    service: Service,
    api_key: String,
) -> ZammResult<()> {
    let mut api_keys = api_keys.0.lock().unwrap();
    set_api_key_helper(&mut api_keys, filename, &service, api_key)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sample_call::SampleCall;
    use crate::test_helpers::get_temp_test_dir;
    use serde::{Deserialize, Serialize};

    use std::fs;
    use std::path::{Path, PathBuf};

    #[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
    struct SetApiKeyRequest {
        filename: Option<String>,
        service: Service,
        api_key: String,
    }

    fn parse_request(request_str: &str) -> SetApiKeyRequest {
        serde_json::from_str(request_str).unwrap()
    }

    fn read_sample(filename: &str) -> SampleCall {
        let sample_str = fs::read_to_string(filename)
            .unwrap_or_else(|_| panic!("No file found at {filename}"));
        serde_yaml::from_str(&sample_str).unwrap()
    }

    fn check_set_api_key_sample(sample_file: &str, mut existing_api_keys: ApiKeys) {
        let sample = read_sample(sample_file);
        assert_eq!(sample.request.len(), 2);
        assert_eq!(sample.request[0], "set_api_key");

        let request = parse_request(&sample.request[1]);
        let request_path = request.filename.map(|f| PathBuf::from(&f));
        let test_init_file = request_path.as_ref().map(|p| {
            let sample_file_directory = p.parent().unwrap().to_str().unwrap();
            let test_name = format!("set_api_key/{}", sample_file_directory);
            let temp_init_dir = get_temp_test_dir(&test_name);
            let init_file = temp_init_dir.join(p.file_name().unwrap());
            println!(
                "Test will be performed on shell init file at {}",
                init_file.display()
            );

            let starting_init_file = Path::new("api/sample-init-files").join(p);
            if PathBuf::from(&starting_init_file).exists() {
                fs::copy(&starting_init_file, &init_file).unwrap();
            }

            init_file
        });

        let actual_result = set_api_key_helper(
            &mut existing_api_keys,
            test_init_file.as_ref().map(|f| f.to_str().unwrap()),
            &request.service,
            request.api_key.clone(),
        );
        // check that the API call returns a success signal
        assert!(
            actual_result.is_ok(),
            "API call failed: {:?}",
            actual_result
        );

        // check that the API call returns the expected JSON
        let actual_json =
            serde_json::to_string_pretty(&actual_result.unwrap()).unwrap();
        let expected_json = sample.response.trim();
        assert_eq!(actual_json, expected_json);

        // check that the API call actually modified the in-memory API keys
        assert_eq!(existing_api_keys.openai, Some(request.api_key));

        // check that the API call successfully wrote the API keys to disk, if asked to
        if let Some(p) = request_path {
            let expected_init_file = Path::new("api/sample-init-files")
                .join(p)
                .with_file_name("expected.bashrc");

            let resulting_contents = fs::read_to_string(test_init_file.unwrap())
                .expect("Test shell init file doesn't exist");
            let expected_contents = fs::read_to_string(&expected_init_file)
                .unwrap_or_else(|_| {
                    panic!(
                        "No gold init file found at {}",
                        expected_init_file.display()
                    )
                });
            assert_eq!(resulting_contents.trim(), expected_contents.trim());
        }
    }

    #[test]
    fn test_write_new_init_file() {
        check_set_api_key_sample(
            "api/sample-calls/set_api_key-no-file.yaml",
            ApiKeys::default(),
        );
    }

    #[test]
    fn test_overwrite_existing_init_file_with_newline() {
        check_set_api_key_sample(
            "api/sample-calls/set_api_key-existing-with-newline.yaml",
            ApiKeys::default(),
        );
    }

    #[test]
    fn test_overwrite_existing_init_file_no_newline() {
        check_set_api_key_sample(
            "api/sample-calls/set_api_key-existing-no-newline.yaml",
            ApiKeys::default(),
        );
    }

    #[test]
    fn test_no_disk_write() {
        check_set_api_key_sample(
            "api/sample-calls/set_api_key-no-disk-write.yaml",
            ApiKeys::default(),
        );
    }
}
