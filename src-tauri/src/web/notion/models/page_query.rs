use serde::{Deserialize, Serialize};
use serde_json::Value;

//
// Root search response
//

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Root {
    pub object: String,
    pub results: Vec<ResultObject>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
    #[serde(rename = "type")]
    pub type_field: String,
    pub page_or_data_source: Value, // rarely used, Notion keeps it vague
    pub request_id: String,
}

//
// Search results can be: page OR data_source
//

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "object")]
pub enum ResultObject {
    #[serde(rename = "page")]
    Page(PageObject),

    #[serde(rename = "data_source")]
    DataSource(DataSource),

    // fallback—Notion adds new types over time
    #[serde(other)]
    Unknown,
}

//
// Page Object (your existing structure, expanded slightly)
//

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PageObject {
    pub id: String,
    pub created_time: Option<String>,
    pub last_edited_time: Option<String>,
    pub created_by: Option<PartialUser>,
    pub last_edited_by: Option<PartialUser>,
    pub cover: Option<Value>,
    pub icon: Option<Icon>,
    pub parent: Option<Parent>,
    pub archived: Option<bool>,
    pub in_trash: Option<bool>,
    pub properties: Value,
    pub url: Option<String>,
    pub public_url: Option<String>,
}

//
// Data Source (merged from the Notion docs)
// https://developers.notion.com/reference/data-source
//

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DataSource {
    pub id: String,
    pub created_time: String,
    pub created_by: PartialUser,
    pub last_edited_time: String,
    pub last_edited_by: PartialUser,

    pub properties: Value, // dynamic property schema
    pub parent: ParentObject,
    pub database_parent: Option<ParentObject>,

    pub title: Vec<RichTextObject>,
    pub description: Option<Vec<RichTextObject>>,

    pub icon: Option<FileOrEmoji>,
    pub archived: bool,
    pub in_trash: bool,
}

//
// Users
//

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PartialUser {
    pub object: Option<String>,
    pub id: Option<String>,
}

//
// Icon
//

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Icon {
    #[serde(rename = "type")]
    pub type_field: Option<String>,
    pub emoji: Option<String>,
}

//
// Parent objects
//

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Parent {
    #[serde(rename = "type")]
    pub type_field: Option<String>,

    // For compatibility with page parent
    pub data_source_id: Option<String>,
}

//
// Data Source parent
//

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParentObject {
    #[serde(rename = "type")]
    pub parent_type: String,

    #[serde(flatten)]
    pub ids: ParentId,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ParentId {
    Database {
        database_id: String,
    },
    Page {
        page_id: String,
    },
    Workspace {
        workspace: bool,
    },
    DataSource {
        data_source_id: String,
        database_id: String,
    },
    Unknown(Value),
}

//
// Rich Text (simplified but correct)
//

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RichTextObject {
    #[serde(rename = "type")]
    pub kind: String,
    pub plain_text: String,
    pub href: Option<String>,

    // We allow all additional fields Notion may provide
    #[serde(flatten)]
    pub extra: Value,
}

//
// Icon for data sources (file or emoji)
//

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum FileOrEmoji {
    File(FileObject),
    Emoji(Value),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FileObject {
    #[serde(flatten)]
    pub extra: Value,
}
