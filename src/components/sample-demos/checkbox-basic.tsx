"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

export default function CheckboxBasicDemo() {
  const [checked, setChecked] = useState(false);
  const t = useTranslations("CheckboxBasic");

  return (
    <div className="flex items-center gap-4">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => setChecked(!!value)}
      />
      <span className={`font-medium ${checked ? "text-green-600" : "text-gray-700"}`}>
        {checked ? t("checkbox_checked") : t("checkbox_unchecked")}
      </span>
    </div>
  );
}
