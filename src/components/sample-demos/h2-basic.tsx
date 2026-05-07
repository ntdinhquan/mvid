"use client";

import { useTranslations } from "next-intl";

export default function H2BasicDemo() {
  const t = useTranslations("H2Basic");

  return (
    <h2 className="text-xl font-semibold text-gray-800">
      {t("content")}
    </h2>
  );
}
