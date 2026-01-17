import { invoke } from "@tauri-apps/api/core";
import User, { Result } from "../models/notion/user"
import PageList from "../models/notion/page_query"

export const getNotionUserInfo = async (token: string): Promise<User | null> => {
    try {
        const result = await invoke<User>("get_notion_user", { token: token });
        return result;
    } catch (err) {
        return null;
    }
}
export const getPageList = async (token: String, query: String, max_pages?: number): Promise<PageList | null> => {
    try {
        const result = await invoke<PageList>("query_user_pages", { token: token, query: query, maxPages: max_pages || 100 });
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
}
export const addDatabaseEntry = async (token: String, databaseId: String, properties: any, children?: any[], icon?: any, cover?: any): Promise<Result | null> => {
    try {
        const result = await invoke<Result>("add_database_entry", { token: token, databaseId: databaseId, properties: properties, children: children, icon: icon, cover: cover });
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
}
export const NotionColorMap = {
    default: {
        light: { background: "#FFFFFF", text: "#373530" },
        dark: { background: "#191919", text: "#D4D4D4" }
    },
    gray: {
        light: { background: "#F1F1EF", text: "#787774" },
        dark: { background: "#252525", text: "#9B9B9B" }
    },
    brown: {
        light: { background: "#F3EEEE", text: "#976D57" },
        dark: { background: "#2E2724", text: "#A27763" }
    },
    orange: {
        light: { background: "#F8ECDF", text: "#CC782F" },
        dark: { background: "#36291F", text: "#CB7B37" }
    },
    yellow: {
        light: { background: "#FAF3DD", text: "#C29343" },
        dark: { background: "#372E20", text: "#C19138" }
    },
    green: {
        light: { background: "#EEF3ED", text: "#548164" },
        dark: { background: "#242B26", text: "#4F9768" }
    },
    blue: {
        light: { background: "#E9F3F7", text: "#487CA5" },
        dark: { background: "#1F282D", text: "#447ACB" }
    },
    purple: {
        light: { background: "#F6F3F8", text: "#8A67AB" },
        dark: { background: "#2A2430", text: "#865DBB" }
    },
    pink: {
        light: { background: "#F9F2F5", text: "#B35488" },
        dark: { background: "#2E2328", text: "#BA4A78" }
    },
    red: {
        light: { background: "#FAECEC", text: "#C4554D" },
        dark: { background: "#332523", text: "#BE524B" }
    }
};