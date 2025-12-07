import { invoke } from "@tauri-apps/api/core"

export const checkCanvasStatus = async (token: string): Promise<boolean> => {
    try {
        await invoke("validate_cavas_token", { token: token });
        return true;
    } catch (err) {
        return false
    }
}