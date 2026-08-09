import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import TakdaBrand from '@/components/takda/brand';
import ThemeToggle from '@/components/theme-toggle';

export default function OnboardingLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f7faf9] text-[#172522] dark:bg-[#0d1815] dark:text-[#f3f8f6]">
            <header className="border-b border-[#dde7e3] bg-white dark:border-[#25413a] dark:bg-[#12201d]">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <TakdaBrand />
                    <div className="flex items-center gap-4">
                        <p className="hidden text-xs text-[#64736f] sm:block dark:text-[#9fb2ad]">
                            Need help?{' '}
                            <a
                                href="mailto:support@takda.app"
                                className="font-bold text-[#0f766e] dark:text-[#5eead4]"
                            >
                                Contact support
                            </a>
                        </p>
                        <ThemeToggle className="size-9" />
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-xs font-bold text-[#40534e] dark:text-[#b8c9c4]"
                        >
                            Sign out
                        </Link>
                    </div>
                </div>
            </header>
            {children}
        </div>
    );
}
