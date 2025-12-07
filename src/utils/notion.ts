import { invoke } from "@tauri-apps/api/core";
import Root from "../models/notion/user"

export const getNotionUserInfo = async (token: string): Promise<Root | null> => {
    try {
        const result = await invoke<Root>("validate_notion_token", { token: token });
        return result;
    } catch (err) {
        return null;
    }
}