// @generated automatically by Diesel CLI.

diesel::table! {
    api_keys (service) {
        service -> Text,
        api_key -> Text,
    }
}
