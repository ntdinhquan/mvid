import { api } from "./api";

export interface PreviewStepsResponse {
    output_url: string;
}

export interface GenerateVideoRequest {
    videoServerPath: string;
    useAIVoice: boolean;
    customAudio: File | null;
    script: string;
    voice: string;
    rate: number;
    volume: number;
    bgmStart: number;
    bgmEnd: number;
    bgm: File | null;
}

export async function previewSteps(
    data: GenerateVideoRequest
){
    const formData = new FormData();
    formData.append("video_path", data.videoServerPath);

    if (!data.useAIVoice && data.customAudio) {
        formData.append("custom_audio", data.customAudio, "record.webm");
    } else {
        formData.append("script", data.script);
        formData.append("voice", data.voice);
        formData.append("rate", (data.rate || 0).toString());
    }
    formData.append("bgm_volume", (data.volume || 0).toString());
    formData.append("bgm_start", (data.bgmStart || 0).toString());
    formData.append("bgm_end", (data.bgmEnd || 0).toString());

    if (data.bgm) {
        formData.append("bgm", data.bgm);
    }

    return api<PreviewStepsResponse>(
        "/generate-video",
        {
            method: "POST",
            body: formData,
        }
    );
}
