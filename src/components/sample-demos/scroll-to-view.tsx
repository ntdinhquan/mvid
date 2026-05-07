"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";
import InputEmailDemo from "./input-email";

export default function ScrollDemo() {
    const t = useTranslations("ScrollDemo");
    const [count, setCount] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [scrollY, setScrollY] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col items-center gap-6 py-12">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {t("title")}
            </h2>

            <Button onClick={() => setCount((c) => c + 1)}>{t("click_button")}</Button>

            <div className="text-gray-600 dark:text-gray-300">
                {t("click_count", { count })}
            </div>

            {/* <div className="sticky top-16 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded shadow">
                {t("scroll_position", { scrollY: Math.round(scrollY) })}
            </div> */}

            <div className="w-full max-w-3xl mt-10 space-y-8">
                {Array.from({ length: 15 }).map((_, i) => (
                    <section
                        key={i}
                        className={
                            i === 10
                                ? "min-h-[400px] flex flex-col items-center justify-center bg-green-100 dark:bg-green-800 rounded-2xl shadow p-6"
                                : "h-64 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-xl font-medium text-gray-700 dark:text-gray-200 shadow"
                        }
                    >
                        {i === 10 ? (
                            <>
                                <h3 className="text-2xl font-semibold mb-4">{t("section_label", { index: i + 1 })}</h3>
                                <InputEmailDemo />
                            </>
                        ) : (
                            t("section_label", { index: i + 1 })
                        )}
                    </section>

                ))}

                <section className="min-h-[400px] flex flex-col items-center justify-center bg-green-100 dark:bg-green-800 rounded-2xl shadow p-6">
                    <h3 className="text-2xl font-semibold mb-4">
                        {t("final_section_title")}
                    </h3>
                    <InputEmailDemo />
                </section>
            </div>

            {showScrollTop && (
                <Button
                    onClick={handleScrollToTop}
                    className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5" />
                </Button>
            )}
        </div>
    );
}
