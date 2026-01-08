use crate::web::canvas::models::{self, assignment, course};
use crate::web::error::AppError;
use serde::{de::DeserializeOwned, Deserialize};
use tauri_plugin_http::reqwest::{header::AUTHORIZATION, Client};

#[derive(Debug, Deserialize)]
struct CanvasError {
    message: String,
}

#[derive(Debug, Deserialize)]
struct CanvasErrorResponse {
    errors: Vec<CanvasError>,
}

pub enum EnrollmentType {
    Student,
    Teacher,
    TA,
    Observer,
    Designer,
}

impl EnrollmentType {
    pub fn as_str(&self) -> &'static str {
        match self {
            EnrollmentType::Student => "student",
            EnrollmentType::Teacher => "teacher",
            EnrollmentType::TA => "ta",
            EnrollmentType::Observer => "observer",
            EnrollmentType::Designer => "designer",
        }
    }
}
pub struct CanvasClient {
    token: String,
    client: Client,
    domain: String,
}

impl CanvasClient {
    pub fn new(token: String, domain: String) -> Self {
        Self {
            token,
            domain,
            client: Client::new(),
        }
    }

    fn auth_header(&self) -> String {
        format!("Bearer {}", self.token)
    }

    pub async fn ping(&self) -> Result<(), AppError> {
        let endpoint = "/accounts";
        match self.get::<serde_json::Value>(endpoint).await {
            Ok(_) => Ok(()),
            Err(e) => Err(e),
        }
    }

    pub async fn list_courses(
        &self,
        enrollment: EnrollmentType,
    ) -> Result<Vec<course::Root>, AppError> {
        let endpoint = format!("/courses?enrollment_type={}", enrollment.as_str());
        self.get(&endpoint).await
    }

    pub async fn assignments_by_course(
        &self,
        course_id: String,
    ) -> Result<Vec<assignment::Root>, AppError> {
        let endpoint = format!("/courses/{}/assignments", course_id);
        self.get(&endpoint).await
    }

    pub async fn get<T>(&self, endpoint: &str) -> Result<T, AppError>
    where
        T: DeserializeOwned,
    {
        let url = format!("https://{}.instructure.com/api/v1{}", self.domain, endpoint);

        let response = self
            .client
            .get(&url)
            .header(AUTHORIZATION, self.auth_header())
            .send()
            .await
            .map_err(|e| AppError::Other(e.to_string()))?;

        let status = response.status();
        if !status.is_success() {
            let text = response.text().await.unwrap_or_default();
            return Err(AppError::Http(format!("GET failed ({}): {}", status, text)));
        }

        let text = response
            .text()
            .await
            .map_err(|e| AppError::Other(e.to_string()))?;

        match serde_json::from_str::<T>(&text) {
            Ok(val) => Ok(val),
            Err(_) => {
                if let Ok(err_obj) = serde_json::from_str::<CanvasErrorResponse>(&text) {
                    let msg = err_obj
                        .errors
                        .into_iter()
                        .map(|e| e.message)
                        .collect::<Vec<_>>()
                        .join(", ");
                    Err(AppError::Other(msg))
                } else {
                    Err(AppError::Parse(format!(
                        "Failed to parse response as expected type and no Canvas error found. Raw: {}",
                        text
                    )))
                }
            }
        }
    }

    async fn post<T, B>(&self, endpoint: &str, body: &B) -> Result<T, AppError>
    where
        T: DeserializeOwned,
        B: serde::Serialize,
    {
        let url = format!("https://{}.instructure.com/api/v1{}", self.domain, endpoint);

        let response = self
            .client
            .post(url)
            .header(AUTHORIZATION, self.auth_header())
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
