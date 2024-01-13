use crate::commands::errors::ZammResult;
use crate::commands::Error;
use crate::setup::api_keys::Service;
use crate::ZammApiKeys;
use async_openai::config::OpenAIConfig;
use async_openai::types::{
    ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
    CreateChatCompletionRequestArgs,
};
use specta::specta;
use tauri::State;

async fn chat_helper(
    zamm_api_keys: &ZammApiKeys,
    http_client: reqwest_middleware::ClientWithMiddleware,
) -> ZammResult<()> {
    let api_keys = zamm_api_keys.0.lock().await;
    if api_keys.openai.is_none() {
        return Err(Error::MissingApiKey {
            service: Service::OpenAI,
        });
    }

    let config = OpenAIConfig::new().with_api_key(api_keys.openai.as_ref().unwrap());

    let openai_client =
        async_openai::Client::with_config(config).with_http_client(http_client);
    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-3.5-turbo")
        .messages([
            ChatCompletionRequestSystemMessageArgs::default()
                .content("You are ZAMM, a chat program. Respond in first person.")
                .build()?
                .into(),
            ChatCompletionRequestUserMessageArgs::default()
                .content("Hello, does this work?")
                .build()?
                .into(),
        ])
        .build()?;
    let response = openai_client.chat().create(request).await?;
    println!("{:#?}", response);
    Ok(())
}

#[tauri::command(async)]
#[specta]
pub async fn chat(api_keys: State<'_, ZammApiKeys>) -> ZammResult<()> {
    let http_client = reqwest::ClientBuilder::new().build()?;
    let client_with_middleware =
        reqwest_middleware::ClientBuilder::new(http_client).build();
    chat_helper(&api_keys, client_with_middleware).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::setup::api_keys::ApiKeys;
    use reqwest_middleware::{ClientBuilder, ClientWithMiddleware};
    use rvcr::{VCRMiddleware, VCRMode};
    use std::env;
    use std::path::PathBuf;
    use tokio::sync::Mutex;
    use vcr_cassette::Headers;

    const CENSORED: &str = "<CENSORED>";

    fn censor_headers(headers: &Headers, blacklisted_keys: &[&str]) -> Headers {
        return headers
            .clone()
            .iter()
            .map(|(k, v)| {
                if blacklisted_keys.contains(&k.as_str()) {
                    (k.clone(), vec![CENSORED.to_string()])
                } else {
                    (k.clone(), v.clone())
                }
            })
            .collect();
    }

    #[tokio::test]
    async fn test_start_conversation() {
        let api_keys = ZammApiKeys(Mutex::new(ApiKeys {
            openai: env::var("OPENAI_API_KEY").ok(),
        }));

        let recording_path =
            PathBuf::from("api/sample-call-requests/start-conversation.json");
        let is_recording = !recording_path.exists();

        let vcr_mode = if is_recording {
            VCRMode::Record
        } else {
            VCRMode::Replay
        };
        let middleware = VCRMiddleware::try_from(recording_path)
            .unwrap()
            .with_mode(vcr_mode)
            .with_modify_request(|req| {
                req.headers = censor_headers(&req.headers, &["authorization"]);
            })
            .with_modify_response(|resp| {
                resp.headers = censor_headers(&resp.headers, &["openai-organization"]);
            });

        let vcr_client: ClientWithMiddleware =
            ClientBuilder::new(reqwest::Client::new())
                .with(middleware)
                .build();

        let result = chat_helper(&api_keys, vcr_client).await;
        assert!(result.is_err());
    }
}
