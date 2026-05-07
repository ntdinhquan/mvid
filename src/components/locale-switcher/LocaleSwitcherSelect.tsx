"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { ChangeEvent, ReactNode, useTransition } from "react";

type Props = {
    children: ReactNode;
    defaultValue: string;
    label: string;
};

export default function LocaleSwitcherSelect({ children, defaultValue }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const params = useParams();

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value;
        startTransition(() => {
            router.replace(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                { pathname, params },
                { locale: nextLocale }
            );
        });
    }

    return (
        <div className="relative inline-block w-32">
            <select
                className={clsx(
                    "w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1 pl-2 pr-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition",
                    isPending && "opacity-50 cursor-not-allowed"
                )}
                defaultValue={defaultValue}
                disabled={isPending}
                onChange={onSelectChange}
            >
                {children}
            </select>
        </div>
    );
}
