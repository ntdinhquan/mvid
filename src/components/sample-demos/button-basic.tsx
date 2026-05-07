"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ButtonAdvancedClickDemo() {
    const t = useTranslations("ButtonBasic");
    const [action, setAction] = useState("");

    const handleLeftClick = () => setAction("left");
    const handleDoubleClick = () => setAction("double");
    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault(); 
        setAction("right");
    };

    return (
        <div className="flex gap-4 items-center">
            <Button
                onClick={handleLeftClick}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleRightClick}
            >
                {t("click_me")}
            </Button>

            <div className="px-4 py-2 rounded bg-gray-200">
                {action === "" && t("no_action")}
                {action === "left" && t("left_click")}
                {action === "double" && t("double_click")}
                {action === "right" && t("right_click")}
            </div>
        </div>
    );
}
