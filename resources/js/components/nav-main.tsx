import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="h-10 gap-3 rounded-lg px-3 text-sm font-medium text-[#40534e] hover:bg-[#f1f6f4] hover:text-[#0f766e] data-[active=true]:bg-[#ebf1f0] data-[active=true]:font-bold data-[active=true]:text-[#0f766e] dark:text-[#b8c9c4] dark:hover:bg-[#172a26] dark:data-[active=true]:bg-[#1d3832] dark:data-[active=true]:text-[#5eead4]"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.badge !== undefined && (
                                    <span className="ml-auto rounded-full bg-[#f97360] px-1.5 py-0.5 text-[10px] leading-3 font-bold text-white group-data-[collapsible=icon]:hidden">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
