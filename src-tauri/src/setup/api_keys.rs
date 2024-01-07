use diesel::deserialize::FromSqlRow;
use diesel::expression::AsExpression;
use diesel::sql_types::Text;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::env;
use strum_macros::{Display, EnumString};

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Serialize,
    Deserialize,
    Type,
    EnumString,
    Display,
    AsExpression,
    FromSqlRow,
)]
#[diesel(sql_type = Text)]
#[strum(serialize_all = "snake_case")]
pub enum Service {
    OpenAI,
}

#[derive(Debug, Default, Clone, Eq, PartialEq, Serialize, Deserialize, Type)]
pub struct ApiKeys {
    pub openai: Option<String>,
}

impl ApiKeys {
    pub fn update(&mut self, service: &Service, key: String) {
        match service {
            Service::OpenAI => self.openai = Some(key),
        }
    }

    pub fn remove(&mut self, service: &Service) {
        match service {
            Service::OpenAI => self.openai = None,
        }
    }
}

pub fn setup_api_keys() -> ApiKeys {
    let mut api_keys = ApiKeys { openai: None };
    if let Ok(openai_api_key) = env::var("OPENAI_API_KEY") {
        api_keys.openai = Some(openai_api_key);
    }
    api_keys
}

#[cfg(test)]
mod tests {
    use super::*;
    use temp_env;

    #[test]
    fn test_get_empty_api_keys() {
        temp_env::with_var("OPENAI_API_KEY", None::<String>, || {
            let api_keys = setup_api_keys();
            assert!(api_keys.openai.is_none());
        });
    }

    #[test]
    fn test_get_present_api_keys() {
        temp_env::with_var("OPENAI_API_KEY", Some("dummy"), || {
            let api_keys = setup_api_keys();
            assert_eq!(api_keys.openai, Some("dummy".to_string()));
        });
    }
}
