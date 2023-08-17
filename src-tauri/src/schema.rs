// @generated automatically by Diesel CLI.

diesel::table! {
    executions (id) {
        id -> Text,
        raw_io -> Text,
        command -> Text,
        output -> Text,
    }
}
