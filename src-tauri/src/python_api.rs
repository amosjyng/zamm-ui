// Example code that deserializes and serializes the model.
// extern crate serde;
// #[macro_use]
// extern crate serde_derive;
// extern crate serde_json;
//
// use generated_module::ChatMethod;
//
// fn main() {
//     let json = r#"{"answer": 42}"#;
//     let model: ChatMethod = serde_json::from_str(&json).unwrap();
// }

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ChatMethod {
    pub args: ChatArgs,

    pub response: ChatResponse,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ChatArgs {
    pub api_key: String,

    pub llm: String,

    pub prompt: Vec<ChatMessage>,

    pub provider: String,

    pub temperature: Option<f64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ChatMessage {
    pub message: String,

    pub role: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ChatResponse {
    pub response: ChatMessage,

    pub tokens: TokenMetadata,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TokenMetadata {
    pub completion: i64,

    pub cost: f64,

    pub prompt: i64,

    pub total: i64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GreetArgs {
    pub name: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GreetResponse {
    pub greeting: String,
}
