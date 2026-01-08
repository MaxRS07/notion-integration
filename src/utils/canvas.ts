import { invoke } from "@tauri-apps/api/core"
import { Course } from "../models/canvas/course";
import { Assignment } from "../models/canvas/assignment";

export const checkCanvasStatus = async (token: string, domain: string): Promise<boolean> => {
    try {
        await invoke("validate_cavas_token", { token: token, domain: domain });
        return true;
    } catch (err) {
        return false
    }
}
export const getUserCourses = async (token: string, domain: string): Promise<Course[]> => {
    try {
        const response = await invoke<Course[]>("get_courses", { token: token, domain: domain });
        return response
    }
    catch (err) {
        return []
    }
}
export const getAssignmentsByCourse = async (courseId: string, token: string, domain: string): Promise<Assignment[]> => {
    try {
        const response = await invoke<Assignment[]>("get_assignments", { courseId: courseId, token: token, domain: domain });
        return response
    }
    catch (err) {
        return []
    }

}
export const getAllAssignments = async (token: string, domain: string): Promise<Assignment[]> => {
    try {
        const classes = await getUserCourses(token, domain);
        var assignments: Assignment[] = [];
        for (const c of classes) {
            const response = await getAssignmentsByCourse(c.id.toString(), token, domain);
            assignments.push(...response);
        }
        return assignments;
    }
    catch (err) {
        return []
    }
}