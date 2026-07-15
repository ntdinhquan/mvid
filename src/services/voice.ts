const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function voiceResponse(
    script: string,
    voice: string,
    rate: number
) {
    const formData = new FormData();
    formData.append("script", script);
    formData.append("voice", voice);
    formData.append("rate", (rate || 0).toString());

    const res = await fetch(`${API_URL}/preview-voice`, {
        method: "POST",
        body: formData
    });

    if (!res.ok)
        throw new Error(await res.text());

    return res.blob();
}