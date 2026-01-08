import { NotionType } from "../notion/types"
import { Variable } from "../shared/mapvar"

export interface Assignment {
    id: number
    position: number
    description: any
    points_possible: number
    grading_type: string
    created_at: string
    updated_at: string
    due_at: any
    final_grader_id: any
    grader_count: number
    graders_anonymous_to_graders: boolean
    grader_comments_visible_to_graders: boolean
    grader_names_visible_to_final_grader: boolean
    lock_at: any
    unlock_at: any
    assignment_group_id: number
    peer_reviews: boolean
    anonymous_peer_reviews: boolean
    automatic_peer_reviews: boolean
    intra_group_peer_reviews: boolean
    post_to_sis: boolean
    grade_group_students_individually: boolean
    group_category_id: any
    grading_standard_id: any
    moderated_grading: boolean
    hide_in_gradebook: boolean
    omit_from_final_grade: boolean
    suppress_assignment: boolean
    anonymous_instructor_annotations: boolean
    anonymous_grading: boolean
    allowed_attempts: number
    annotatable_attachment_id: any
    secure_params: string
    lti_context_id: string
    course_id: number
    name: string
    submission_types: string[]
    has_submitted_submissions: boolean
    due_date_required: boolean
    max_name_length: number
    in_closed_grading_period: boolean
    graded_submissions_exist: boolean
    is_quiz_assignment: boolean
    can_duplicate: boolean
    original_course_id: any
    original_assignment_id: any
    original_lti_resource_link_id: any
    original_assignment_name: any
    original_quiz_id: any
    workflow_state: string
    important_dates: boolean
    muted: boolean
    html_url: string
    published: boolean
    only_visible_to_overrides: boolean
    visible_to_everyone: boolean
    locked_for_user: boolean
    submissions_download_url: string
    post_manually: boolean
    anonymize_students: boolean
    new_quizzes_anonymous_participants: boolean
    require_lockdown_browser: boolean
    restrict_quantitative_data: boolean
}
export const AssignmentVars: Variable[] = [
    { name: "ID", value: "id", description: "ID number of the Canvas assignment", dataType: NotionType.Number },
    { name: "Description", value: "description", description: "The description of the assignment as appears in Canvas", dataType: NotionType.RichText },
    { name: "Position", value: "position", description: "The position of the assignment in the assignment list", dataType: NotionType.Number },
    { name: "Points Possible", value: "points_possible", description: "The maximum number of points possible for the assignment", dataType: NotionType.Number },
    { name: "Grading Type", value: "grading_type", description: "The type of grading used for the assignment (e.g., 'points', 'percent', 'letter_grade', 'gpa_scale', 'not_graded')", dataType: NotionType.Select },
    { name: "Created At", value: "created_at", description: "The time at which the assignment was created", dataType: NotionType.Date },
    { name: "Updated At", value: "updated_at", description: "The time at which the assignment was last updated", dataType: NotionType.Date },
    { name: "Due At", value: "due_at", description: "The time at which the assignment is due", dataType: NotionType.Date },
    { name: "Final Grader ID", value: "final_grader_id", description: "The ID of the user designated as the final grader (if moderated grading is enabled)", dataType: NotionType.Number },
    { name: "Grader Count", value: "grader_count", description: "The number of graders assigned to the assignment (if peer reviews are enabled)", dataType: NotionType.Number },
    { name: "Graders Anonymous To Graders", value: "graders_anonymous_to_graders", description: "Whether graders' identities are hidden from other graders", dataType: NotionType.Checkbox },
    { name: "Grader Comments Visible To Graders", value: "grader_comments_visible_to_graders", description: "Whether comments made by one grader are visible to other graders", dataType: NotionType.Checkbox },
    { name: "Grader Names Visible To Final Grader", value: "grader_names_visible_to_final_grader", description: "Whether the names of graders are visible to the final grader", dataType: NotionType.Checkbox },
    { name: "Lock At", value: "lock_at", description: "The time at which the assignment is locked for submission", dataType: NotionType.Date },
    { name: "Unlock At", value: "unlock_at", description: "The time at which the assignment is unlocked for submission", dataType: NotionType.Date },
    { name: "Assignment Group ID", value: "assignment_group_id", description: "The ID of the assignment group the assignment belongs to", dataType: NotionType.Number },
    { name: "Peer Reviews", value: "peer_reviews", description: "Whether peer reviews are enabled for the assignment", dataType: NotionType.Checkbox },
    { name: "Anonymous Peer Reviews", value: "anonymous_peer_reviews", description: "Whether peer reviews are anonymous", dataType: NotionType.Checkbox },
    { name: "Automatic Peer Reviews", value: "automatic_peer_reviews", description: "Whether Canvas automatically assigns peer reviews", dataType: NotionType.Checkbox },
    { name: "Intra Group Peer Reviews", value: "intra_group_peer_reviews", description: "Whether students are assigned peer reviews within their own groups", dataType: NotionType.Checkbox },
    { name: "Post To SIS", value: "post_to_sis", description: "Whether the assignment grade should be posted to the SIS (Student Information System)", dataType: NotionType.Checkbox },
    { name: "Grade Group Students Individually", value: "grade_group_students_individually", description: "Whether students in a group receive individual grades for a group assignment", dataType: NotionType.Checkbox },
    { name: "Group Category ID", value: "group_category_id", description: "The ID of the group category associated with the assignment (if a group assignment)", dataType: NotionType.Number },
    { name: "Grading Standard ID", value: "grading_standard_id", description: "The ID of the grading standard used for the assignment", dataType: NotionType.Number },
    { name: "Moderated Grading", value: "moderated_grading", description: "Whether moderated grading is enabled for the assignment", dataType: NotionType.Checkbox },
    { name: "Hide In Gradebook", value: "hide_in_gradebook", description: "Whether the assignment is hidden from students in the gradebook", dataType: NotionType.Checkbox },
    { name: "Omit From Final Grade", value: "omit_from_final_grade", description: "Whether the assignment's grade is omitted when calculating the final grade", dataType: NotionType.Checkbox },
    { name: "Suppress Assignment", value: "suppress_assignment", description: "Whether the assignment is suppressed (hidden) from students", dataType: NotionType.Checkbox },
    { name: "Anonymous Instructor Annotations", value: "anonymous_instructor_annotations", description: "Whether instructor annotations are anonymous", dataType: NotionType.Checkbox },
    { name: "Anonymous Grading", value: "anonymous_grading", description: "Whether grading is done anonymously (instructor does not see student names)", dataType: NotionType.Checkbox },
    { name: "Allowed Attempts", value: "allowed_attempts", description: "The number of attempts allowed for the assignment", dataType: NotionType.Number },
    { name: "Annotatable Attachment ID", value: "annotatable_attachment_id", description: "The ID of the attachment available for online annotation", dataType: NotionType.Number },
    { name: "Secure Params", value: "secure_params", description: "Secure parameters used for LTI links", dataType: NotionType.Text },
    { name: "LTI Context ID", value: "lti_context_id", description: "The LTI context ID for the assignment", dataType: NotionType.Text },
    { name: "Course ID", value: "course_id", description: "The ID of the course the assignment belongs to", dataType: NotionType.Number },
    { name: "Name", value: "name", description: "The name of the assignment", dataType: NotionType.Title },
    { name: "Submission Types", value: "submission_types", description: "An array of submission types allowed (e.g., 'online_upload', 'online_text_entry', 'discussion_topic', 'external_tool')", dataType: NotionType.Multiselect },
    { name: "Has Submitted Submissions", value: "has_submitted_submissions", description: "Whether at least one student has submitted the assignment", dataType: NotionType.Checkbox },
    { name: "Due Date Required", value: "due_date_required", description: "Whether a due date is required for the assignment", dataType: NotionType.Checkbox },
    { name: "Max Name Length", value: "max_name_length", description: "The maximum length of the assignment name", dataType: NotionType.Number },
    { name: "In Closed Grading Period", value: "in_closed_grading_period", description: "Whether the assignment falls within a closed grading period", dataType: NotionType.Checkbox },
    { name: "Graded Submissions Exist", value: "graded_submissions_exist", description: "Whether any submissions have been graded yet", dataType: NotionType.Checkbox },
    { name: "Is Quiz Assignment", value: "is_quiz_assignment", description: "Whether the assignment is linked to a quiz", dataType: NotionType.Checkbox },
    { name: "Can Duplicate", value: "can_duplicate", description: "Whether the user has permission to duplicate this assignment", dataType: NotionType.Checkbox },
    { name: "Original Course ID", value: "original_course_id", description: "The ID of the original course if this assignment was copied", dataType: NotionType.Number },
    { name: "Original Assignment ID", value: "original_assignment_id", description: "The ID of the original assignment if this assignment was copied", dataType: NotionType.Number },
    { name: "Original LTI Resource Link ID", value: "original_lti_resource_link_id", description: "The original LTI resource link ID if copied", dataType: NotionType.Text },
    { name: "Original Assignment Name", value: "original_assignment_name", description: "The name of the original assignment if this assignment was copied", dataType: NotionType.Text },
    { name: "Original Quiz ID", value: "original_quiz_id", description: "The ID of the original quiz if this assignment was copied from a quiz", dataType: NotionType.Number },
    { name: "Workflow State", value: "workflow_state", description: "The current workflow state of the assignment (e.g., 'unpublished', 'published')", dataType: NotionType.Status },
    { name: "Important Dates", value: "important_dates", description: "Whether the assignment has important dates specified", dataType: NotionType.Checkbox },
    { name: "Muted", value: "muted", description: "Whether the assignment is muted (grades hidden from students)", dataType: NotionType.Checkbox },
    { name: "HTML URL", value: "html_url", description: "The URL to the assignment's page in Canvas", dataType: NotionType.Url },
    { name: "Published", value: "published", description: "Whether the assignment is published and visible to students", dataType: NotionType.Checkbox },
    { name: "Only Visible To Overrides", value: "only_visible_to_overrides", description: "Whether the assignment is only visible to users with specific date overrides", dataType: NotionType.Checkbox },
    { name: "Visible To Everyone", value: "visible_to_everyone", description: "Whether the assignment is visible to all students without date restrictions", dataType: NotionType.Checkbox },
    { name: "Locked For User", value: "locked_for_user", description: "Whether the assignment is currently locked for the current user", dataType: NotionType.Checkbox },
    { name: "Submissions Download URL", value: "submissions_download_url", description: "The URL to download all assignment submissions", dataType: NotionType.Url },
    { name: "Post Manually", value: "post_manually", description: "Whether grades need to be manually posted to students", dataType: NotionType.Checkbox },
    { name: "Anonymize Students", value: "anonymize_students", description: "Whether student names are anonymized during grading", dataType: NotionType.Checkbox },
    { name: "New Quizzes Anonymous Participants", value: "new_quizzes_anonymous_participants", description: "Whether participants in New Quizzes are anonymous", dataType: NotionType.Checkbox },
    { name: "Require Lockdown Browser", value: "require_lockdown_browser", description: "Whether a lockdown browser is required for the assignment/quiz", dataType: NotionType.Checkbox },
    { name: "Restrict Quantitative Data", value: "restrict_quantitative_data", description: "Whether quantitative data is restricted for the assignment/quiz", dataType: NotionType.Checkbox }
];