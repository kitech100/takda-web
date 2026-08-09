import { Link } from '@inertiajs/react';
import ThemeToggle from '@/components/theme-toggle';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center bg-[#f7faf9] p-4 transition-colors sm:p-8 lg:p-16 dark:bg-[#091411]">
            <ThemeToggle className="absolute top-4 right-4 sm:top-8 sm:right-8" />

            <main className="w-full max-w-[480px] rounded-xl bg-white p-6 text-[#172522] shadow-[0_8px_12px_rgba(15,118,110,0.06)] transition-colors sm:p-10 dark:border dark:border-[#25413a] dark:bg-[#12201d] dark:text-[#f3f8f6] dark:shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                        >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#0f766e]">
                                <img
                                    src="/assets/figma/login-calendar-check.svg"
                                    alt=""
                                    className="size-[18px]"
                                />
                            </div>
                            <span className="text-xl font-extrabold tracking-[-0.02em] text-[#0f766e] dark:text-[#5eead4]">
                                Takda
                            </span>
                            <span className="rounded bg-[#0f766e]/[0.08] px-1.5 py-0.5 text-[10px] leading-[14px] font-bold tracking-[0.04em] text-[#0f766e] uppercase dark:bg-[#5eead4]/10 dark:text-[#5eead4]">
                                Business
                            </span>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl leading-8 font-extrabold tracking-[-0.02em] text-[#172522] dark:text-[#f3f8f6]">
                                {title}
                            </h1>
                            <p className="text-center text-sm leading-5 text-[#64736f] dark:text-[#9fb2ad]">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
