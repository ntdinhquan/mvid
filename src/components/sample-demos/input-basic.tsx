"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export default function InputBasicDemo() {
  const [value, setValue] = useState("");
  const t = useTranslations("InputBasic");

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder={t("input_placeholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-64"
      />
      <div className="text-gray-700 dark:text-gray-300">
        {t("input_value")}: {value || t("input_empty")}
      </div>
    </div>
  );
}
