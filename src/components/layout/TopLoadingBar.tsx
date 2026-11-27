"use client";

import { useEffect, useState } from "react";
import { subscribeLoading } from "@/lib/api";

// Thanh loading chạy ngang trên cùng trang, tự hiện khi có request tới backend
export default function TopLoadingBar() {
  const [active, setActive] = useState(false);

  useEffect(() => subscribeLoading(setActive), []);

  return (
    <div
      role="progressbar"
      aria-label="Đang xử lý"
      aria-hidden={!active}
      className={`fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden bg-blue-100/60 pointer-events-none transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="top-loading-bar h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
    </div>
  );
}
