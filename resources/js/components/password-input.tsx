import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function PasswordInput({
    className,
    ref,
    toggleMode = 'icon',
    ...props
}: Omit<ComponentProps<'input'>, 'type'> & {
    ref?: Ref<HTMLInputElement>;
    toggleMode?: 'icon' | 'label';
}) {
    const [showPassword, setShowPassword] = useState(false);
    const usesLabel = toggleMode === 'label';

    return (
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn(usesLabel ? 'pr-16' : 'pr-10', className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={cn(
                    'absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none',
                    usesLabel
                        ? 'px-4 text-xs font-bold text-[#0f766e] hover:text-[#115e59] dark:text-[#5eead4] dark:hover:text-[#99f6e4]'
                        : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
            >
                {usesLabel ? (
                    showPassword ? (
                        'Hide'
                    ) : (
                        'Show'
                    )
                ) : showPassword ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}
