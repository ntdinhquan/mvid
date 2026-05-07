"use client";

import { useTranslations } from "next-intl";

export default function LabelBasicDemo() {
  const t = useTranslations("LabelBasic");

  return (
    <label className="text-gray-600 font-medium">
      {t("content")}
    </label>
  );
}
