use crate::schema::executions;
use diesel::backend::Backend;
use diesel::deserialize::FromSqlRow;
use diesel::deserialize::{self, FromSql};
use diesel::expression::AsExpression;
use diesel::prelude::*;
use diesel::serialize::{self, IsNull, Output, ToSql};
use diesel::sql_types::Text;
use diesel::sqlite::Sqlite;
use uuid::Uuid;

#[derive(AsExpression, FromSqlRow, Debug, Clone)]
#[diesel(sql_type = Text)]
pub struct EntityId {
    pub uuid: Uuid,
}

#[derive(Queryable, Selectable, Debug)]
pub struct Execution {
    pub id: EntityId,
    pub raw_io: String,
    pub command: String,
    pub output: String,
}

#[derive(Insertable)]
#[diesel(table_name = executions)]
pub struct NewExecution<'a> {
    pub id: EntityId,
    pub raw_io: &'a str,
    pub command: &'a str,
    pub output: &'a str,
}

impl ToSql<Text, Sqlite> for EntityId
where
    String: ToSql<Text, Sqlite>,
{
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, Sqlite>) -> serialize::Result {
        let uuid_str = self.uuid.to_string();
        out.set_value(uuid_str);
        Ok(IsNull::No)
    }
}

impl<DB> FromSql<Text, DB> for EntityId
where
    DB: Backend,
    String: FromSql<Text, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> deserialize::Result<Self> {
        let uuid_str = String::from_sql(bytes)?;
        let parsed_uuid = Uuid::parse_str(&uuid_str)?;
        Ok(EntityId { uuid: parsed_uuid })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::setup::db::MIGRATIONS;

    use diesel_migrations::MigrationHarness;

    fn setup_database() -> SqliteConnection {
        let mut conn = SqliteConnection::establish(":memory:").unwrap();
        conn.run_pending_migrations(MIGRATIONS).unwrap();
        conn
    }

    #[test]
    fn test_uuid_serialization_and_deserialization() {
        let mut conn = setup_database();

        let new_execution = NewExecution {
            id: EntityId {
                uuid: Uuid::new_v4(),
            },
            raw_io: "Test IO",
            command: "Test Command",
            output: "Test Output",
        };

        // Insert
        diesel::insert_into(executions::table)
            .values(&new_execution)
            .execute(&mut conn)
            .unwrap();

        // Query
        let results: Vec<Execution> = executions::table.load(&mut conn).unwrap();
        assert_eq!(results.len(), 1);

        let retrieved_execution = &results[0];
        assert_eq!(retrieved_execution.id.uuid, new_execution.id.uuid);
        assert_eq!(retrieved_execution.raw_io, new_execution.raw_io);
        assert_eq!(retrieved_execution.command, new_execution.command);
        assert_eq!(retrieved_execution.output, new_execution.output);
    }
}
