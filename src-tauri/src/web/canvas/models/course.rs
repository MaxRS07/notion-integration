use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Root {
    pub id: i64,
    pub name: String,
    #[serde(rename = "course_code")]
    pub course_code: String,
    #[serde(rename = "account_id")]
    pub account_id: i64,
    #[serde(rename = "created_at")]
    pub created_at: String,
    #[serde(rename = "start_at")]
    pub start_at: Option<String>,
    #[serde(rename = "default_view")]
    pub default_view: String,
    #[serde(rename = "enrollment_term_id")]
    pub enrollment_term_id: i64,
    #[serde(rename = "is_public")]
    pub is_public: Option<bool>,
    #[serde(rename = "grading_standard_id")]
    pub grading_standard_id: Option<i64>,
    #[serde(rename = "root_account_id")]
    pub root_account_id: i64,
    pub uuid: String,
    pub license: Option<String>,
    #[serde(rename = "grade_passback_setting")]
    pub grade_passback_setting: Value,
    #[serde(rename = "end_at")]
    pub end_at: Value,
    #[serde(rename = "public_syllabus")]
    pub public_syllabus: bool,
    #[serde(rename = "public_syllabus_to_auth")]
    pub public_syllabus_to_auth: bool,
    #[serde(rename = "storage_quota_mb")]
    pub storage_quota_mb: i64,
    #[serde(rename = "is_public_to_auth_users")]
    pub is_public_to_auth_users: bool,
    #[serde(rename = "homeroom_course")]
    pub homeroom_course: bool,
    #[serde(rename = "course_color")]
    pub course_color: Value,
    #[serde(rename = "friendly_name")]
    pub friendly_name: Value,
    #[serde(rename = "apply_assignment_group_weights")]
    pub apply_assignment_group_weights: bool,
    pub calendar: Calendar,
    #[serde(rename = "time_zone")]
    pub time_zone: String,
    pub blueprint: bool,
    pub template: bool,
    pub enrollments: Vec<Enrollment>,
    #[serde(rename = "hide_final_grades")]
    pub hide_final_grades: bool,
    #[serde(rename = "workflow_state")]
    pub workflow_state: String,
    #[serde(rename = "course_format")]
    pub course_format: Option<String>,
    #[serde(rename = "restrict_enrollments_to_course_dates")]
    pub restrict_enrollments_to_course_dates: bool,
    pub locale: Option<String>,
    #[serde(rename = "overridden_course_visibility")]
    pub overridden_course_visibility: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Calendar {
    pub ics: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Enrollment {
    #[serde(rename = "type")]
    pub type_field: String,
    pub role: String,
    #[serde(rename = "role_id")]
    pub role_id: i64,
    #[serde(rename = "user_id")]
    pub user_id: i64,
    #[serde(rename = "enrollment_state")]
    pub enrollment_state: String,
    #[serde(rename = "limit_privileges_to_course_section")]
    pub limit_privileges_to_course_section: bool,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Term {
    id: i64,
    name: String,
    start_at: String,
    end_at: Option<String>,
}
#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CoursePogress {
    requirement_count: i32,
    requirement_completed_count: i32,
    next_requirement_url: String,
    completed_at: String,
}
