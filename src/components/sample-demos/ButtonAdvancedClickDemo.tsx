"use client";

import { useTranslations } from "next-intl";

export default function ButtonAngularEmbedDemo() {
    const t = useTranslations("ButtonBasic");

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-lg font-semibold">
                {t("embedded_demo")} (Angular)
            </h2>

            <iframe
                src="https://angular-experiment.vercel.app/scenario/Angular/CommonControls/Button/Button_Sample"
                className="w-full h-[480px] rounded-lg border border-gray-300 shadow-sm"
                sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals"
            />
        </div>
    );
}
