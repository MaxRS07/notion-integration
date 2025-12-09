import { invoke } from "@tauri-apps/api/core";
import User from "../models/notion/user"
import PageList from "../models/notion/page_query"

export const getNotionUserInfo = async (token: string): Promise<User | null> => {
    try {
        const result = await invoke<User>("get_notion_user", { token: token });
        return result;
    } catch (err) {
        return null;
    }
}
export const getPageList = async (token: String, query: String, max_pages: number): Promise<PageList | null> => {
    try {
        const result = await invoke<PageList>("query_user_pages", { token: token, query: query, maxPages: max_pages });
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
}