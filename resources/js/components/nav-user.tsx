import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth, workspace } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group h-14 rounded-lg border border-[#dde7e3] bg-[#f7faf9] px-2 text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent dark:border-[#2d4942] dark:bg-[#172a26]"
                            data-test="sidebar-menu-button"
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e6f3f0] text-xs font-extrabold text-[#0f766e] dark:bg-[#25413a] dark:text-[#5eead4]">
                                {(workspace?.name ?? auth.user.name)
                                    .split(' ')
                                    .map((part) => part[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                                <p className="truncate text-xs font-bold text-[#172522] dark:text-[#e8f2ef]">
                                    {workspace?.name ?? auth.user.name}
                                </p>
                                <p className="truncate text-[10px] text-[#64736f] dark:text-[#9fb2ad]">
                                    {workspace?.location ??
                                        (workspace
                                            ? 'No active location'
                                            : 'Personal account')}
                                </p>
                            </div>
                            <ChevronsUpDown className="ml-auto size-3.5 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem className="mt-1 flex justify-end group-data-[collapsible=icon]:justify-center">
                <ThemeToggle className="size-8 shadow-none" />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
