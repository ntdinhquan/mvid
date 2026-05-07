"use client";

import { useTranslations } from "next-intl";
import { Button } from "../ui/button";

export default function AlertBasicDemo() {
    const t = useTranslations("AlertBasic");

    return (
        <div className="flex gap-4">
            <Button
                onClick={() => alert(t("alert_message"))}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {t("alert_button")}
            </Button>

            <Button
                onClick={() => {
                    if (confirm(t("confirm_message"))) {
                        alert(t("confirm_ok"));
                    } else {
                        alert(t("confirm_cancel"));
                    }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                {t("confirm_button")}
            </Button>

            <Button
                onClick={() => {
                    const userInput = prompt(t("prompt_message"));
                    if (userInput !== null) {
                        alert(t("prompt_result", { value: userInput }));
                    }
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
                {t("prompt_button")}
            </Button>
        </div>
    )
}
