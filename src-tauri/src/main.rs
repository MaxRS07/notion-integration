// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;

fn main() {
    dotenv().ok();
    notion_integration_lib::run()
}
