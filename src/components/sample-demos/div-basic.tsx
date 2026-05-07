"use client";

import { useTranslations } from "next-intl";

export default function DivBasicDemo() {
  const t = useTranslations("DivBasic");

  return (
    <div className="px-4 py-2 rounded bg-gray-200 text-gray-800">
      {t("content")}
    </div>
  );
}
