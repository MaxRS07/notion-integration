use crate::web::error::AppError;
use serde::{de::DeserializeOwned, Deserialize};
use tauri::http::StatusCode;
use tauri_plugin_http::reqwest::{header::AUTHORIZATION, Client};
pub struct NotionClient {
    client: Client,
    secret: String,
}

const BASE_URL: &str = "https://api.notion.com/v1";

impl NotionClient {
    pub fn new(secret: String) -> NotionClient {
        NotionClient {
            client: Client::new(),
            secret,
        }
    }
    async fn post<T, B>(&self, endpoint: &str, body: &B) -> Result<T, AppError>
    where
        T: DeserializeOwned,
        B: serde::Serialize,
    {
        let url = format!("{BASE_URL}{endpoint}");

        let response = self
            .client
            .post(url)
            // .header(AUTHORIZATION, self.auth_header())
            // .body(body)
            .send()
            .await
            .map_err(|e| AppError::Other(e.to_string()))?;

        let text = response
            .text()
            .await
            .map_err(|e| AppError::Parse(e.to_string()))?;

        let value = serde_json::from_str::<T>(&text).map_err(|e| AppError::Other(e.to_string()))?;

        Ok(value)
    }
}
