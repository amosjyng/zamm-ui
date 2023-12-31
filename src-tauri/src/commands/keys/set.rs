use crate::commands::errors::ZammResult;
use crate::setup::api_keys::Service;
use crate::ZammApiKeys;
use specta::specta;
use tauri::State;

use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::path::Path;

fn set_api_key_helper(
    zamm_api_keys: &ZammApiKeys,
    filename: Option<&str>,
    service: &Service,
    api_key: String,
) -> ZammResult<()> {
    let api_keys = &mut zamm_api_keys.0.lock().unwrap();
    // write new API key to disk before we can no longer borrow it
    let init_update_result = || -> ZammResult<()> {
        if api_key.is_empty() {
            return Ok(());
        }

        if let Some(untrimmed_filename) = filename {
            let f = untrimmed_filename.trim();
            if !f.is_empty() {
                let ends_in_newline = {
                    if Path::new(f).exists() {
                        let mut file = OpenOptions::new().read(true).open(f)?;
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
                    .open(f)?;
                if !ends_in_newline {
                    writeln!(file)?;
                }
                writeln!(file, "export OPENAI_API_KEY=\"{}\"", api_key)?;
            }
        }
        Ok(())
    }();
    // assign ownership of new API key string to in-memory API keys
    if api_key.is_empty() {
        api_keys.remove(service);
    } else {
        api_keys.update(service, api_key);
    }
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
    set_api_key_helper(&api_keys, filename, &service, api_key)
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use crate::sample_call::SampleCall;
    use crate::setup::api_keys::ApiKeys;
    use crate::test_helpers::get_temp_test_dir;
    use serde::{Deserialize, Serialize};
    use std::sync::Mutex;

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

    pub fn check_set_api_key_sample(
        sample_file: &str,
        existing_zamm_api_keys: &ZammApiKeys,
        should_fail: bool,
        test_dir_name: &str,
    ) {
        let sample = read_sample(sample_file);
        assert_eq!(sample.request.len(), 2);
        assert_eq!(sample.request[0], "set_api_key");

        let request = parse_request(&sample.request[1]);
        let valid_request_path_specified = request
            .filename
            .as_ref()
            .map(|f| !f.is_empty() && !f.ends_with('/'))
            .unwrap_or(false);
        let request_path = request.filename.as_ref().map(|f| PathBuf::from(&f));
        let test_init_file = if valid_request_path_specified {
            let p = request_path.as_ref().unwrap();
            let sample_file_directory = p.parent().unwrap().to_str().unwrap();
            let test_name = format!("{}/{}", test_dir_name, sample_file_directory);
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

            Some(init_file.to_str().unwrap().to_owned())
        } else {
            request.filename
        };

        let actual_result = set_api_key_helper(
            existing_zamm_api_keys,
            test_init_file.as_deref(),
            &request.service,
            request.api_key.clone(),
        );

        // check that the API call returns the expected success or failure signal
        if should_fail {
            assert!(actual_result.is_err(), "API call should have thrown error");
        } else {
            assert!(
                actual_result.is_ok(),
                "API call failed: {:?}",
                actual_result
            );
        }

        // check that the API call returns the expected JSON
        let actual_json = match actual_result {
            Ok(r) => serde_json::to_string_pretty(&r).unwrap(),
            Err(e) => serde_json::to_string_pretty(&e).unwrap(),
        };
        let expected_json = sample.response.trim();
        assert_eq!(actual_json, expected_json);

        // check that the API call actually modified the in-memory API keys,
        // regardless of success or failure
        let existing_api_keys = existing_zamm_api_keys.0.lock().unwrap();
        if request.api_key.is_empty() {
            assert_eq!(existing_api_keys.openai, None);
        } else {
            assert_eq!(existing_api_keys.openai, Some(request.api_key));
        }

        // check that the API call successfully wrote the API keys to disk, if asked to
        if valid_request_path_specified {
            let p = request_path.unwrap();
            let expected_init_file = Path::new("api/sample-init-files")
                .join(p)
                .with_file_name("expected.bashrc");

            let resulting_contents =
                fs::read_to_string(test_init_file.unwrap().as_str())
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

    fn check_set_api_key_sample_unit(
        sample_file: &str,
        existing_zamm_api_keys: &ZammApiKeys,
    ) {
        check_set_api_key_sample(
            sample_file,
            existing_zamm_api_keys,
            false,
            "set_api_key",
        );
    }

    fn check_set_api_key_sample_unit_fails(
        sample_file: &str,
        existing_zamm_api_keys: &ZammApiKeys,
    ) {
        check_set_api_key_sample(
            sample_file,
            existing_zamm_api_keys,
            true,
            "set_api_key",
        );
    }

    #[test]
    fn test_write_new_init_file() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));
        check_set_api_key_sample_unit(
            "api/sample-calls/set_api_key-no-file.yaml",
            &api_keys,
        );
    }

    #[test]
    fn test_overwrite_existing_init_file_with_newline() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));
        check_set_api_key_sample_unit(
            "api/sample-calls/set_api_key-existing-with-newline.yaml",
            &api_keys,
        );
    }

    #[test]
    fn test_overwrite_existing_init_file_no_newline() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));
        check_set_api_key_sample_unit(
            "api/sample-calls/set_api_key-existing-no-newline.yaml",
            &api_keys,
        );
    }

    #[test]
    fn test_no_disk_write() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));
        check_set_api_key_sample_unit(
            "api/sample-calls/set_api_key-no-disk-write.yaml",
            &api_keys,
        );
    }

    #[test]
    fn test_unset() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys {
            openai: Some("0p3n41-4p1-k3y".to_owned()),
        }));
        check_set_api_key_sample_unit(
            "api/sample-calls/set_api_key-unset.yaml",
            &api_keys,
        );
        assert!(api_keys.0.lock().unwrap().openai.is_none());
    }

    #[test]
    fn test_empty_filename() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));
        check_set_api_key_sample_unit(
            "api/sample-calls/set_api_key-empty-filename.yaml",
            &api_keys,
        );
    }

    #[test]
    fn test_invalid_filename() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys::default()));
        check_set_api_key_sample_unit_fails(
            "api/sample-calls/set_api_key-invalid-filename.yaml",
            &api_keys,
        );
    }
}
