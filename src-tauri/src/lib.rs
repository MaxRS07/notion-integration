pub mod web;

use crate::web::{
    canvas::{
        client::{CanvasClient, EnrollmentType},
        models::{assignment, course},
    },
    notion::{
        client::NotionClient,
        models::{
            page_query::{self, ResultObject},
            page_request::ParentType,
            user,
        },
    },
};

use std::env;

#[tauri::command]
async fn get_courses(token: String, domain: String) -> Result<Vec<course::Root>, String> {
    let client = CanvasClient::new(token, domain);

    client
        .list_courses(EnrollmentType::Student)
        .await
        .map_err(|e| e.to_string())
}
#[tauri::command]
async fn get_assignments(
    courseId: String,
    token: String,
    domain: String,
) -> Result<Vec<assignment::Root>, String> {
    let client = CanvasClient::new(token, domain);

    client
        .assignments_by_course(courseId)
        .await
        .map_err(|e| e.to_string())
}
#[tauri::command]
async fn validate_canvas_token(token: String, domain: String) -> Result<(), String> {
    CanvasClient::new(token, domain)
        .ping()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_notion_user(token: String) -> Result<user::Root, String> {
    NotionClient::new(token)
        .list_users()
        .await
        .map_err(|e| e.to_string())
}
#[tauri::command]
async fn query_user_pages(
    token: String,
    query: String,
    maxPages: i32,
) -> Result<page_query::Root, String> {
    NotionClient::new(token)
        .search_pages(query, maxPages)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_database_entry(
    token: String,
    databaseId: String,
    properties: serde_json::Value,
    children: Option<Vec<serde_json::Value>>,
    icon: Option<serde_json::Value>,
    cover: Option<serde_json::Value>,
) -> Result<ResultObject, String> {
    NotionClient::new(token)
        .create_page(
            ParentType::Database,
            &databaseId,
            properties,
            children,
            icon,
            cover,
        )
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_courses,
            get_assignments,
            validate_canvas_token,
            get_notion_user,
            query_user_pages,
            add_database_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
