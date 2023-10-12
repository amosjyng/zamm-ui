use serde::{Deserialize, Serialize};

use specta::Type;

#[derive(Debug, Default, Clone, Eq, PartialEq, Serialize, Deserialize, Type)]
pub struct Preferences {
    unceasing_animations: Option<bool>,
    sound_on: Option<bool>,
}
