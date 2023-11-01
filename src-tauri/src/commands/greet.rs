use crate::python_api::{GreetArgs, GreetResponse};

use specta::specta;

use crate::commands::api::{process, SidecarExecutor, SidecarExecutorImpl};
use crate::commands::errors::ZammResult;

fn greet_helper<T: SidecarExecutor>(t: &T, name: &str) -> ZammResult<String> {
    let result = process::<GreetArgs, GreetResponse>(
        t,
        "zamm-python",
        "greet",
        &GreetArgs { name: name.into() },
    )?;
    let greeting = result.greeting;
    Ok(format!("{greeting} via Rust"))
}

#[tauri::command(async)]
#[specta]
pub fn greet(name: &str) -> ZammResult<String> {
    match greet_helper(&SidecarExecutorImpl {}, name) {
        Ok(greeting) => Ok(greeting),
        Err(err) => {
            eprintln!("Greet error: {}", err);
            Err(err)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::commands::api::MockSidecarExecutor;
    use crate::sample_call::SampleCall;

    use std::fs;

    fn parse_greet(args_str: &str) -> GreetArgs {
        serde_json::from_str(args_str).unwrap()
    }

    fn read_sample(filename: &str) -> SampleCall {
        let sample_str = fs::read_to_string(filename)
            .unwrap_or_else(|_| panic!("No file found at {filename}"));
        serde_yaml::from_str(&sample_str).unwrap()
    }

    fn check_greet_sample(file_prefix: &str, rust_input: &str, rust_result: &str) {
        let greet_sample = read_sample(file_prefix);

        let mut mock = MockSidecarExecutor::new();
        mock.expect_execute()
            .withf(move |cmd, actual_cmd_args| {
                assert_eq!(cmd, "zamm-python");

                let expected_cmd_args = &greet_sample.request;
                assert_eq!(actual_cmd_args.len(), expected_cmd_args.len());
                assert_eq!(actual_cmd_args[0], expected_cmd_args[0]);

                let actual_greet_args = parse_greet(actual_cmd_args[1]);
                let expected_greet_args = parse_greet(&expected_cmd_args[1]);
                assert_eq!(actual_greet_args, expected_greet_args);

                true
            })
            .return_once(move |_, _| Ok(greet_sample.response));

        let result = greet_helper(&mock, rust_input).unwrap();
        assert_eq!(result, rust_result);
    }

    #[test]
    fn test_greet_name() {
        check_greet_sample(
            "../src-python/api/sample-calls/greet.yaml",
            "Test",
            "Hello, Test! You have been greeted from Python via Rust",
        );
    }

    #[test]
    fn test_greet_empty_name() {
        check_greet_sample(
            "../src-python/api/sample-calls/greet_empty.yaml",
            "",
            "Hello, ! You have been greeted from Python via Rust",
        );
    }
}
