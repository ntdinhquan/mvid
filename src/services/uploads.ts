import {api} from "./api";

export interface UploadResponse{
    video_path: string;
    preview_url: string;
}

export async function uploadVideo(url: string){
    const formData = new FormData();
    formData.append("video", url);
    
    return api<UploadResponse>("/download-url", {
        method: "POST",
        body: formData,
    });
}