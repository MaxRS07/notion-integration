use crate::web::error::AppError;
use crate::web::notion::models::{page_query, user};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use tauri_plugin_http::reqwest::{
    header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE},
    Body, Client,
};

const BASE_URL: &str = "https://api.notion.com/v1";
const NOTION_VERSION: &str = "2025-09-03";

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NotionError {
    pub object: String,
    pub status: i64,
    pub code: String,
    pub message: String,
    pub request_id: String,
}
pub struct NotionClient {
    client: Client,
    secret: String,
}

impl NotionClient {
    pub fn new(secret: String) -> NotionClient {
        NotionClient {
            client: Client::new(),
            secret,
        }
    }

    fn headers(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();

        let auth = format!("Bearer {}", self.secret);
        headers.insert(AUTHORIZATION, HeaderValue::from_str(&auth).unwrap());
        headers.insert("Notion-Version", HeaderValue::from_static(NOTION_VERSION));
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

        headers
    }

    async fn get<T>(&self, endpoint: &str) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let url = format!("{BASE_URL}{endpoint}");
        let response = self
            .client
            .get(url)
            .headers(self.headers())
            .send()
            .await
            .map_err(|e| AppError::Other(e.to_string()))?;

        self.handle_response::<T>(response).await
    }

    async fn post<T>(&self, endpoint: &str, body: serde_json::Value) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let body = Body::wrap(body.to_string());
        let url = format!("{BASE_URL}{endpoint}");
        let response = self
            .client
            .post(url)
            .headers(self.headers())
            .body(body)
            .send()
            .await
            .map_err(|e| AppError::Other(e.to_string()))?;
        self.handle_response::<T>(response).await
    }

    async fn patch<T>(&self, endpoint: &str, body: serde_json::Value) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let body = Body::wrap(body.to_string());
        let url = format!("{BASE_URL}{endpoint}");
        let response = self
            .client
            .patch(url)
            .headers(self.headers())
            .body(body)
            .send()
            .await
            .map_err(|e| AppError::Other(e.to_string()))?;
        self.handle_response::<T>(response).await
    }

    async fn handle_response<T>(
        &self,
        response: tauri_plugin_http::reqwest::Response,
    ) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let status = response.status();
        let text = response
            .text()
            .await
            .map_err(|e| AppError::Parse(e.to_string()))?;
        if !status.is_success() {
            if let Ok(err_obj) = serde_json::from_str::<NotionError>(&text) {
                return Err(AppError::Http(format!(
                    "Notion API error {}: {} (code: {})",
                    err_obj.status, err_obj.message, err_obj.code
                )));
            } else {
                return Err(AppError::Http(format!(
                    "Notion API returned status {}: {}",
                    status, text
                )));
            }
        }
        serde_json::from_str::<T>(&text).map_err(|e| AppError::Parse(e.to_string()))
    }

    // ======================================================
    // ENDPOINT HELPERS (with internal body builders)
    // ======================================================

    pub async fn list_users(&self) -> Result<user::Root, AppError> {
        self.get("/users").await
    }

    pub async fn get_page<T>(&self, page_id: &str) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        self.get(&format!("/pages/{page_id}")).await
    }

    pub async fn query_database<T>(
        &self,
        database_id: &str,
        filter: Option<serde_json::Value>,
        sorts: Option<Vec<serde_json::Value>>,
        page_size: Option<u32>,
    ) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let mut body = serde_json::json!({});
        if let Some(filter) = filter {
            body["filter"] = filter;
        }
        if let Some(sorts) = sorts {
            body["sorts"] = serde_json::Value::Array(sorts);
        }
        if let Some(page_size) = page_size {
            body["page_size"] = serde_json::Value::Number(page_size.into());
        }
        self.post(&format!("/databases/{database_id}/query"), body)
            .await
    }

    pub async fn create_page_in_database<T>(
        &self,
        database_id: &str,
        properties: serde_json::Value,
        children: Option<Vec<serde_json::Value>>,
    ) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let mut body = serde_json::json!({
            "parent": { "database_id": database_id },
            "properties": properties
        });
        if let Some(children) = children {
            body["children"] = serde_json::Value::Array(children);
        }
        self.post("/pages", body).await
    }

    pub async fn update_page_properties<T>(
        &self,
        page_id: &str,
        properties: serde_json::Value,
        archived: Option<bool>,
    ) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let mut body = serde_json::json!({ "properties": properties });
        if let Some(archived) = archived {
            body["archived"] = serde_json::Value::Bool(archived);
        }
        self.patch(&format!("/pages/{page_id}"), body).await
    }

    pub async fn get_block_children<T>(&self, block_id: &str) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        self.get(&format!("/blocks/{block_id}/children")).await
    }

    pub async fn append_blocks<T>(
        &self,
        block_id: &str,
        children: Vec<serde_json::Value>,
    ) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let body = serde_json::json!({ "children": children });
        self.patch(&format!("/blocks/{block_id}/children"), body)
            .await
    }
    pub async fn search_pages(
        &self,
        query: String,
        response_size: i32,
    ) -> Result<page_query::Root, AppError> {
        let body = serde_json::json!({
            "page_size": response_size,
            "query": query
        });
        self.post("/search", body).await
    }
}
