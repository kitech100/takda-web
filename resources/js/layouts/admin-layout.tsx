import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardCheck,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Store,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import TakdaBrand from '@/components/takda/brand';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
    { label: 'Overview', href: '/platform-admin', icon: LayoutDashboard },
    {
        label: 'Applications',
        href: '/platform-admin/applications',
        icon: ClipboardCheck,
    },
    { label: 'Businesses', href: '/platform-admin/businesses', icon: Store },
    {
        label: 'Platform Settings',
        href: '/platform-admin/settings',
        icon: Settings,
    },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const { auth, platform } = props;
    const [open, setOpen] = useState(false);
    const initials = auth.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="min-h-screen bg-[#f7faf9] text-[#172522] dark:bg-[#0d1815] dark:text-[#f3f8f6]">
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-[260px] -translate-x-full flex-col border-r border-[#dde7e3] bg-white transition-transform lg:translate-x-0 dark:border-[#25413a] dark:bg-[#12201d]',
                    open && 'translate-x-0',
                )}
            >
                <div className="flex h-16 items-center border-b border-[#dde7e3] px-5 dark:border-[#25413a]">
                    <TakdaBrand />
                    <span className="ml-2 rounded bg-[#172522] px-2 py-1 text-[9px] font-bold text-white dark:bg-[#e9f2ef] dark:text-[#172522]">
                        ADMIN
                    </span>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    <p className="px-3 py-3 text-[10px] font-bold tracking-wider text-[#879590] uppercase">
                        Platform
                    </p>
                    {navigation.map((item) => {
                        const active =
                            item.href === '/platform-admin'
                                ? url === item.href
                                : url.startsWith(item.href);
                        const badge =
                            item.label === 'Applications'
                                ? platform?.pendingApplications
                                : undefined;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#40534e] hover:bg-[#f1f6f4] dark:text-[#b8c9c4] dark:hover:bg-[#172a26]',
                                    active &&
                                        'bg-[#ebf1f0] text-[#0f766e] dark:bg-[#1d3832] dark:text-[#5eead4]',
                                )}
                            >
                                <item.icon className="size-[18px]" />
                                {item.label}
                                {Boolean(badge) && (
                                    <span className="ml-auto rounded-full bg-[#f97360] px-1.5 py-0.5 text-[9px] text-white">
                                        {badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-[#dde7e3] p-3 dark:border-[#25413a]">
                    <div className="flex items-center gap-3 rounded-lg p-2">
                        <span className="grid size-9 place-items-center rounded-full bg-[#172522] text-xs font-bold text-white dark:bg-[#e9f2ef] dark:text-[#172522]">
                            {initials}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold">
                                {auth.user.name}
                            </p>
                            <p className="truncate text-[10px] text-[#64736f]">
                                Platform Admin
                            </p>
                        </div>
                        <ThemeToggle className="size-8" />
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#64736f] hover:bg-[#f7faf9] dark:hover:bg-[#172a26]"
                    >
                        <LogOut className="size-4" /> Sign out
                    </Link>
                </div>
            </aside>
            {open && (
                <button
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                />
            )}
            <div className="lg:pl-[260px]">
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#dde7e3] bg-white/90 px-4 backdrop-blur lg:hidden dark:border-[#25413a] dark:bg-[#12201d]/90">
                    <Button
                        aria-label="Open navigation"
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(true)}
                    >
                        <Menu />
                    </Button>
                    <TakdaBrand />
                    <ThemeToggle className="size-8" />
                </header>
                <main>{children}</main>
            </div>
        </div>
    );
}
