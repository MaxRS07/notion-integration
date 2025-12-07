use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Root {
    pub object: String,
    pub results: Vec<Result>,
    pub next_cursor: Value,
    pub has_more: bool,
    #[serde(rename = "type")]
    pub type_field: String,
    pub user: User,
    pub request_id: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Result {
    pub object: String,
    pub id: String,
    pub name: String,
    pub avatar_url: Value,
    #[serde(rename = "type")]
    pub type_field: String,
    pub person: Option<Person>,
    pub bot: Option<Bot>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Person {
    pub email: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Bot {
    pub owner: Owner,
    pub workspace_name: String,
    pub workspace_id: String,
    pub workspace_limits: WorkspaceLimits,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Owner {
    #[serde(rename = "type")]
    pub type_field: String,
    pub workspace: bool,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WorkspaceLimits {
    pub max_file_upload_size_in_bytes: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct User {}
