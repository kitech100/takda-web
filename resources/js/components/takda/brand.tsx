import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function TakdaBrand({
    compact = false,
    className,
}: {
    compact?: boolean;
    className?: string;
}) {
    return (
        <Link
            href="/dashboard"
            className={cn(
                'inline-flex items-center gap-2 text-[#172522] dark:text-[#f3f8f6]',
                className,
            )}
        >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0f766e] text-sm font-extrabold text-white">
                T
            </span>
            {!compact && (
                <span className="text-lg font-extrabold tracking-[-0.03em]">
                    Takda
                </span>
            )}
        </Link>
    );
}
