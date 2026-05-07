"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/locale-switcher/LocaleSwitcher";

export default function Header() {
  const t = useTranslations("HomePage");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link
          href="/"
          className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition"
        >
          {t("title")}
        </Link>

        <div className="w-24 md:w-28">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
