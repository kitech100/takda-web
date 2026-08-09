import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PortalPage({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
            {children}
        </div>
    );
}

export function PortalHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
                <h1 className="text-[28px] leading-9 font-extrabold tracking-[-0.025em] text-[#172522] dark:text-[#f3f8f6]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-0.5 text-sm text-[#64736f] dark:text-[#9fb2ad]">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

export function TakdaPanel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'rounded-xl border border-[#dde7e3] bg-white dark:border-[#25413a] dark:bg-[#12201d]',
                className,
            )}
        >
            {children}
        </section>
    );
}

const statusStyles: Record<string, string> = {
    active: 'bg-[#e4f8ef] text-[#07845f] dark:bg-[#0d3b31] dark:text-[#6ee7b7]',
    confirmed:
        'bg-[#e7f0ff] text-[#2563eb] dark:bg-[#162d52] dark:text-[#93c5fd]',
    pending:
        'bg-[#fff2d6] text-[#c26900] dark:bg-[#49300c] dark:text-[#fcd34d]',
    completed:
        'bg-[#e3f8f1] text-[#047857] dark:bg-[#123d31] dark:text-[#6ee7b7]',
    in_progress:
        'bg-[#f0eaff] text-[#6d42df] dark:bg-[#30205e] dark:text-[#c4b5fd]',
    cancelled:
        'bg-[#eef0f3] text-[#64736f] dark:bg-[#2a3532] dark:text-[#b8c9c4]',
    no_show:
        'bg-[#fee9e8] text-[#dc2626] dark:bg-[#4a2020] dark:text-[#fca5a5]',
    loyal: 'bg-[#fee9e8] text-[#f05f55] dark:bg-[#4a2020] dark:text-[#fca5a5]',
    new: 'bg-[#fff2d6] text-[#c26900] dark:bg-[#49300c] dark:text-[#fcd34d]',
    archived:
        'bg-[#eef0f3] text-[#64736f] dark:bg-[#2a3532] dark:text-[#b8c9c4]',
    invited:
        'bg-[#fff2d6] text-[#c26900] dark:bg-[#49300c] dark:text-[#fcd34d]',
};

export function StatusBadge({ status }: { status: string }) {
    const key = status.toLowerCase().replaceAll(' ', '_').replaceAll('-', '_');

    return (
        <span
            className={cn(
                'inline-flex w-fit items-center rounded-md px-2 py-1 text-[11px] leading-3 font-semibold whitespace-nowrap',
                statusStyles[key] ?? statusStyles.cancelled,
            )}
        >
            {status}
        </span>
    );
}

export function PrimaryButton({
    children,
    className,
    ...props
}: React.ComponentProps<typeof Button>) {
    return (
        <Button
            className={cn(
                'h-10 rounded-lg bg-[#0f766e] px-4 font-bold text-white shadow-none hover:bg-[#115e59]',
                className,
            )}
            {...props}
        >
            {children}
        </Button>
    );
}

export function FilterButton({ children }: { children: ReactNode }) {
    return (
        <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-[#dde7e3] bg-white px-3 text-xs font-medium text-[#40534e] shadow-none hover:bg-[#f1f6f4] dark:border-[#2d4942] dark:bg-[#172a26] dark:text-[#b8c9c4] dark:hover:bg-[#203630]"
        >
            {children}
            <ChevronDown className="size-3.5" />
        </Button>
    );
}

export function SearchField({ placeholder }: { placeholder: string }) {
    return (
        <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#64736f]" />
            <Input
                placeholder={placeholder}
                className="h-9 rounded-lg border-[#dde7e3] bg-[#f7faf9] pl-9 text-sm shadow-none focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/15 dark:border-[#2d4942] dark:bg-[#172a26]"
            />
        </div>
    );
}

export function MetricCard({
    label,
    value,
    icon: Icon,
    accent = 'teal',
    trend,
}: {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    accent?: 'teal' | 'blue' | 'amber' | 'coral';
    trend?: string;
}) {
    const dot = {
        teal: 'bg-[#0f766e]',
        blue: 'bg-[#3b82f6]',
        amber: 'bg-[#f59e0b]',
        coral: 'bg-[#f97360]',
    }[accent];

    return (
        <TakdaPanel className="relative flex min-h-24 items-center justify-between p-4">
            <div>
                <p className="text-xs font-medium text-[#64736f] dark:text-[#9fb2ad]">
                    {label}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <p className="text-2xl font-extrabold tracking-[-0.02em] text-[#172522] dark:text-[#f3f8f6]">
                        {value}
                    </p>
                    {trend && (
                        <span className="rounded bg-[#e4f8ef] px-1.5 py-0.5 text-[10px] font-bold text-[#07845f]">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
            <div className={cn('size-2 rounded-full', dot)} />
            {Icon && (
                <Icon className="absolute right-4 bottom-3 size-4 text-[#64736f]" />
            )}
        </TakdaPanel>
    );
}

export function InitialsAvatar({
    initials,
    className,
}: {
    initials: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e7f1ef] text-xs font-bold text-[#0f766e] dark:bg-[#25413a] dark:text-[#5eead4]',
                className,
            )}
        >
            {initials}
        </span>
    );
}
