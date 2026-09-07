// Đặt NEXT_PUBLIC_API_URL trong .env.local để trỏ về backend local khi dev
// (mặc định là API production trên Hugging Face Space)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://quan2002-mvid-api.hf.space";
