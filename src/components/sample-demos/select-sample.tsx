"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function SelectBasicDemo() {
    const t = useTranslations("SelectBasic");
    const [value, setValue] = useState("");

    return (
        <div className="flex items-center gap-4">
            <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("select_placeholder")} />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="apple">{t("apple")}</SelectItem>
                    <SelectItem value="banana">{t("banana")}</SelectItem>
                    <SelectItem value="orange">{t("orange")}</SelectItem>
                </SelectContent>
            </Select>

            <div className="px-4 py-2 rounded bg-gray-200">
                {value ? `${t("selected")}: ${value}` : t("not_selected")}
            </div>
        </div>
    );
}
