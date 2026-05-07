"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

export default function TextareaBasicDemo() {
    const t = useTranslations("TextareaBasic");
    const [text, setText] = useState("");

    return (
        <div className="flex flex-col gap-4 w-[400px]">
            <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t("placeholder")}
            />

            <div className="px-4 py-2 rounded bg-gray-200">
                {text ? text : t("empty")}
            </div>
        </div>
    );
}
