import { Moon, Sun } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function ThemeToggle({
    className,
    ...props
}: Omit<ComponentProps<typeof Button>, 'children' | 'onClick'>) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const nextAppearance = isDark ? 'light' : 'dark';
    const label = `Switch to ${nextAppearance} mode`;

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => updateAppearance(nextAppearance)}
            aria-label={label}
            title={label}
            className={cn(
                'size-10 rounded-full border-[#dde7e3] bg-white text-[#0f766e] shadow-sm transition-all hover:border-[#0f766e]/40 hover:bg-[#eef8f5] hover:text-[#115e59] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/20 dark:border-[#2d4942] dark:bg-[#172a26] dark:text-[#5eead4] dark:hover:border-[#5eead4]/50 dark:hover:bg-[#203630] dark:hover:text-[#99f6e4]',
                className,
            )}
            {...props}
        >
            {isDark ? (
                <Sun className="size-[18px]" />
            ) : (
                <Moon className="size-[18px]" />
            )}
            <span className="sr-only">{label}</span>
        </Button>
    );
}
