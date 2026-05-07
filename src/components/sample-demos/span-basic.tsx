"use client";

import { useTranslations } from "next-intl";

export default function SpanBasicDemo() {
  const t = useTranslations("SpanBasic");

  return (
    <span className="text-gray-700">
      {t("content")}
    </span>
  );
}
