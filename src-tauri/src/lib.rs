pub mod web;

use crate::web::{
    canvas::{
        client::{CanvasClient, EnrollmentType},
        models::{assignment, course},
    },
    notion::{client::NotionClient, models::user},
};

use std::env;

#[tauri::command]
async fn get_courses() -> Result<Vec<course::Root>, String> {
    let token = std::env::var("CANVAS_TOKEN").map_err(|_| "CANVAS_TOKEN is missing".to_string())?;
    let client = CanvasClient::new(token);

    client
        .list_courses(EnrollmentType::Student)
        .await
        .map_err(|e| e.to_string())
}
#[tauri::command]
async fn get_assignments(courseId: String) -> Result<Vec<assignment::Root>, String> {
    let token = std::env::var("CANVAS_TOKEN").map_err(|_| "CANVAS_TOKEN is missing".to_string())?;
    let client = CanvasClient::new(token);

    client
        .assignments_by_course(courseId)
        .await
        .map_err(|e| e.to_string())
}
#[tauri::command]
async fn validate_cavas_token(token: String) -> Result<(), String> {
    CanvasClient::new(token)
        .ping()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_notion_token(token: String) -> Result<user::Root, String> {
    NotionClient::new(token)
        .list_users()
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
            validate_cavas_token,
            validate_notion_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
