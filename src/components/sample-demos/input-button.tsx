"use client";

import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function InputButtonDemo() {
    const t = useTranslations("InputButton");
    const [action, setAction] = useState("");

    const handleLeftClick = () => setAction("left");
    const handleDoubleClick = () => setAction("double");
    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setAction("right");
    };
    return (
        <div className="flex gap-4 items-center">
            <Input
                type="button"
                value={t("button_label")}
                onClick={handleLeftClick}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleRightClick}
                className="w-64 cursor-pointer select-none text-left"
            />

            <div className="px-4 py-2 rounded bg-gray-200">
                {action === "" && t("no_action")}
                {action === "left" && t("left_click")}
                {action === "double" && t("double_click")}
                {action === "right" && t("right_click")}
            </div>
        </div>
    );
}
