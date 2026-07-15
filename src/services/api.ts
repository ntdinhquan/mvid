const API_URL = process.env.NEXT_PUBLIC_API_URL;

console.log("API_URL:", API_URL);

export async function api<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, options);

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}