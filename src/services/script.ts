import { api } from "./api";

export interface OriginalScriptResponse {
    original_script: string;
    video_path: string;
}

export interface TranslatedScriptResponse {
    script: string;
}

export interface UploadOnlyResponse {
    video_path: string;
}

export async function getOriginalScript(
    file?: File,
    videoPath?: string,
    signal?: AbortSignal
) {
    const formData = new FormData();

    if (file)
        formData.append("file", file);
    else if (videoPath)
        formData.append("video_path", videoPath);

    try {
        return await api<OriginalScriptResponse>(
            "/get-original-script",
            {
                method: "POST",
                body: formData,
                signal,
            }
        );
    }
    catch (error) {
        throw new Error("Lỗi khi bóc băng video. Vui lòng thử lại.");
    }
    
}

export async function translateScript(
    currentOriginalText: string,
    geminiKey: string,
    signal: AbortSignal,
) {
    const formDataTrans = new FormData();
    formDataTrans.append("text", currentOriginalText);
    formDataTrans.append("api_key", geminiKey);
    return api<TranslatedScriptResponse>(
        "/translate-text",
        {
            method: "POST",
            body: formDataTrans,
            signal,
        }
    );
}

export async function uploadOnly(
    file: File,
) {
    const formData = new FormData();
    formData.append("file", file);
    return api<UploadOnlyResponse>(
        "/upload-only",
        {
            method: "POST",
            body: formData,
        }
    );
}