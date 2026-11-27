// Địa chỉ backend. Đặt NEXT_PUBLIC_API_URL trong .env.local để trỏ sang server khác (vd: http://localhost:7860)
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://quan2002-mvid-api.hf.space"
).replace(/\/$/, "");

export type Segment = { start: number; end: number; text: string };

// --- Theo dõi số request đang chạy để hiện thanh loading trên cùng trang ---
let activeRequests = 0;
const loadingListeners = new Set<(active: boolean) => void>();
const emitLoading = () => loadingListeners.forEach((fn) => fn(activeRequests > 0));

export function subscribeLoading(fn: (active: boolean) => void) {
  loadingListeners.add(fn);
  fn(activeRequests > 0);
  return () => {
    loadingListeners.delete(fn);
  };
}

// Bọc 1 tác vụ bất đồng bộ: thanh loading hiện trong suốt thời gian tác vụ chạy
export async function withLoading<T>(task: () => Promise<T>): Promise<T> {
  activeRequests++;
  emitLoading();
  try {
    return await task();
  } finally {
    activeRequests--;
    emitLoading();
  }
}

// fetch tới backend (path dạng "/generate-video") kèm thanh loading
export const apiFetch = (path: string, init?: RequestInit) =>
  withLoading(() => fetch(`${API_BASE}${path}`, init));

// Đọc lỗi từ backend mà không vỡ khi server trả về HTML (vd: 502 từ proxy)
export async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.detail || fallback;
  } catch {
    return `${fallback} (HTTP ${res.status})`;
  }
}

// Kịch bản -> mảng dòng, cùng quy tắc với backend (_split_lines):
// chỉ bỏ dòng trống ở cuối khi số dòng vượt số đoạn, để dòng trống ứng với 1 đoạn không bị mất
export const scriptLines = (script: string, expected = 0) => {
  const lines = script.replace(/\r/g, "").split("\n");
  while (lines.length > Math.max(expected, 1) && !lines[lines.length - 1].trim()) lines.pop();
  return lines;
};
