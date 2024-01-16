use crate::commands::errors::ZammResult;
use crate::commands::Error;
use crate::models::llm_calls::{
    EntityId, Llm, LlmCall, Request, Response, TokenMetadata,
};
use crate::schema::llm_calls;
use crate::setup::api_keys::Service;
use crate::{ZammApiKeys, ZammDatabase};
use async_openai::config::OpenAIConfig;
use async_openai::types::{
    ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
    CreateChatCompletionRequestArgs,
};
use diesel::RunQueryDsl;
use specta::specta;
use tauri::State;
use uuid::Uuid;

async fn chat_helper(
    zamm_api_keys: &ZammApiKeys,
    zamm_db: &ZammDatabase,
    http_client: reqwest_middleware::ClientWithMiddleware,
) -> ZammResult<LlmCall> {
    let api_keys = zamm_api_keys.0.lock().await;
    if api_keys.openai.is_none() {
        return Err(Error::MissingApiKey {
            service: Service::OpenAI,
        });
    }

    let db = &mut zamm_db.0.lock().await;

    let config = OpenAIConfig::new().with_api_key(api_keys.openai.as_ref().unwrap());
    let requested_model = "gpt-3.5-turbo";
    let temperature = 1.0;

    let openai_client =
        async_openai::Client::with_config(config).with_http_client(http_client);
    let request = CreateChatCompletionRequestArgs::default()
        .model(requested_model)
        .temperature(temperature)
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
    let response = openai_client.chat().create(&request).await?;

    let token_metadata = TokenMetadata {
        prompt_tokens: response
            .usage
            .as_ref()
            .map(|usage| usage.prompt_tokens as i32),
        response_tokens: response
            .usage
            .as_ref()
            .map(|usage| usage.completion_tokens as i32),
    };
    let sole_choice = response
        .choices
        .first()
        .ok_or(Error::UnexpectedOpenAiResponse {
            reason: "Zero choices".to_owned(),
        })?
        .message
        .to_owned();
    let llm_call = LlmCall {
        id: EntityId {
            uuid: Uuid::new_v4(),
        },
        timestamp: chrono::Utc::now().naive_utc(),
        llm: Llm {
            provider: Service::OpenAI,
            name: response.model.clone(),
            requested: requested_model.to_owned(),
        },
        request: Request {
            temperature,
            prompt: request.messages.try_into()?,
        },
        response: Response {
            completion: sole_choice.try_into()?,
        },
        token_metadata,
    };

    if let Some(conn) = db.as_mut() {
        diesel::insert_into(llm_calls::table)
            .values(llm_call.as_sql_row())
            .execute(conn)?;
    } // todo: warn users if DB write unsuccessful

    Ok(llm_call)
}

#[tauri::command(async)]
#[specta]
pub async fn chat(
    api_keys: State<'_, ZammApiKeys>,
    database: State<'_, ZammDatabase>,
) -> ZammResult<LlmCall> {
    let http_client = reqwest::ClientBuilder::new().build()?;
    let client_with_middleware =
        reqwest_middleware::ClientBuilder::new(http_client).build();
    chat_helper(&api_keys, &database, client_with_middleware).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::llm_calls::{ChatMessage, LlmCallRow};
    use crate::setup::api_keys::ApiKeys;
    use crate::setup::db::MIGRATIONS;
    use diesel::prelude::*;
    use diesel_migrations::MigrationHarness;
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

    fn setup_database() -> SqliteConnection {
        let mut conn = SqliteConnection::establish(":memory:").unwrap();
        conn.run_pending_migrations(MIGRATIONS).unwrap();
        conn
    }

    pub fn setup_zamm_db() -> ZammDatabase {
        ZammDatabase(Mutex::new(Some(setup_database())))
    }

    async fn get_llm_call(db: &ZammDatabase, call_id: &EntityId) -> LlmCall {
        use crate::schema::llm_calls::dsl::*;
        let mut conn_mutex = db.0.lock().await;
        let conn = conn_mutex.as_mut().unwrap();
        llm_calls
            .filter(id.eq(call_id))
            .first::<LlmCallRow>(conn)
            .unwrap()
            .into()
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

        let db = setup_zamm_db();
        let result = chat_helper(&api_keys, &db, vcr_client).await;
        assert!(result.is_ok(), "Error: {:?}", result.err());
        let ok_result = result.unwrap();
        assert!(ok_result.request.prompt.len() > 0);
        match &ok_result.response.completion {
            ChatMessage::AI { text } => assert!(!text.is_empty()),
            _ => panic!("Unexpected response type"),
        }

        // check that it made it into the database
        let stored_llm_call = get_llm_call(&db, &ok_result.id).await;
        assert_eq!(stored_llm_call.request.prompt, ok_result.request.prompt);
        assert_eq!(
            stored_llm_call.response.completion,
            ok_result.response.completion
        );
    }
}
