use std::fmt;

#[derive(Debug)]
pub enum AppError {
    Http(String),
    Parse(String),
    Json(String),
    Io(String),
    Other(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Http(msg) => write!(f, "HTTP error: {}", msg),
            AppError::Parse(msg) => write!(f, "Parse error: {}", msg),
            AppError::Json(msg) => write!(f, "JSON error: {}", msg),
            AppError::Io(msg) => write!(f, "IO error: {}", msg),
            AppError::Other(msg) => write!(f, "Error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

//
// Automatic conversions (this is the important part)
//

impl From<tauri_plugin_http::reqwest::Error> for AppError {
    fn from(err: tauri_plugin_http::reqwest::Error) -> Self {
        AppError::Http(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Json(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

impl From<&str> for AppError {
    fn from(err: &str) -> Self {
        AppError::Other(err.to_string())
    }
}

impl From<String> for AppError {
    fn from(err: String) -> Self {
        AppError::Other(err)
    }
}
