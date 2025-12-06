use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Root {
    pub id: i64,
    pub name: String,

    #[serde(default)]
    pub position: Option<i64>,
    #[serde(default)]
    pub description: Option<Value>,
    #[serde(default)]
    pub points_possible: Option<f64>,
    #[serde(default)]
    pub grading_type: Option<String>,
    #[serde(default)]
    pub created_at: Option<String>,
    #[serde(default)]
    pub updated_at: Option<String>,
    #[serde(default)]
    pub due_at: Option<Value>,
    #[serde(default)]
    pub final_grader_id: Option<Value>,
    #[serde(default)]
    pub grader_count: Option<i64>,
    #[serde(default)]
    pub graders_anonymous_to_graders: Option<bool>,
    #[serde(default)]
    pub grader_comments_visible_to_graders: Option<bool>,
    #[serde(default)]
    pub grader_names_visible_to_final_grader: Option<bool>,
    #[serde(default)]
    pub lock_at: Option<Value>,
    #[serde(default)]
    pub unlock_at: Option<Value>,
    #[serde(default)]
    pub assignment_group_id: Option<i64>,
    #[serde(default)]
    pub peer_reviews: Option<bool>,
    #[serde(default)]
    pub anonymous_peer_reviews: Option<bool>,
    #[serde(default)]
    pub automatic_peer_reviews: Option<bool>,
    #[serde(default)]
    pub intra_group_peer_reviews: Option<bool>,
    #[serde(default)]
    pub post_to_sis: Option<bool>,
    #[serde(default)]
    pub grade_group_students_individually: Option<bool>,
    #[serde(default)]
    pub group_category_id: Option<Value>,
    #[serde(default)]
    pub grading_standard_id: Option<Value>,
    #[serde(default)]
    pub moderated_grading: Option<bool>,
    #[serde(default)]
    pub hide_in_gradebook: Option<bool>,
    #[serde(default)]
    pub omit_from_final_grade: Option<bool>,
    #[serde(default)]
    pub suppress_assignment: Option<bool>,
    #[serde(default)]
    pub anonymous_instructor_annotations: Option<bool>,
    #[serde(default)]
    pub anonymous_grading: Option<bool>,
    #[serde(default)]
    pub allowed_attempts: Option<i64>,
    #[serde(default)]
    pub annotatable_attachment_id: Option<Value>,
    #[serde(default)]
    pub secure_params: Option<String>,
    #[serde(default)]
    pub lti_context_id: Option<String>,
    #[serde(default)]
    pub course_id: Option<i64>,
    #[serde(default)]
    pub submission_types: Option<Vec<String>>,
    #[serde(default)]
    pub has_submitted_submissions: Option<bool>,
    #[serde(default)]
    pub due_date_required: Option<bool>,
    #[serde(default)]
    pub max_name_length: Option<i64>,
    #[serde(default)]
    pub in_closed_grading_period: Option<bool>,
    #[serde(default)]
    pub graded_submissions_exist: Option<bool>,
    #[serde(default)]
    pub is_quiz_assignment: Option<bool>,
    #[serde(default)]
    pub can_duplicate: Option<bool>,
    #[serde(default)]
    pub original_course_id: Option<Value>,
    #[serde(default)]
    pub original_assignment_id: Option<Value>,
    #[serde(default)]
    pub original_lti_resource_link_id: Option<Value>,
    #[serde(default)]
    pub original_assignment_name: Option<Value>,
    #[serde(default)]
    pub original_quiz_id: Option<Value>,
    #[serde(default)]
    pub workflow_state: Option<String>,
    #[serde(default)]
    pub important_dates: Option<bool>,
    #[serde(default)]
    pub muted: Option<bool>,
    #[serde(default)]
    pub html_url: Option<String>,
    #[serde(default)]
    pub published: Option<bool>,
    #[serde(default)]
    pub only_visible_to_overrides: Option<bool>,
    #[serde(default)]
    pub visible_to_everyone: Option<bool>,
    #[serde(default)]
    pub locked_for_user: Option<bool>,
    #[serde(default)]
    pub submissions_download_url: Option<String>,
    #[serde(default)]
    pub post_manually: Option<bool>,
    #[serde(default)]
    pub anonymize_students: Option<bool>,
    #[serde(default)]
    pub new_quizzes_anonymous_participants: Option<bool>,
    #[serde(default)]
    pub require_lockdown_browser: Option<bool>,
    #[serde(default)]
    pub restrict_quantitative_data: Option<bool>,
}
