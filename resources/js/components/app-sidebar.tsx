import { Link, usePage } from '@inertiajs/react';
import {
    ArchiveRestore,
    BarChart3,
    Bell,
    Building2,
    CalendarDays,
    CalendarRange,
    LayoutDashboard,
    Scissors,
    Settings,
    Users,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    { title: 'Calendar', href: '/calendar', icon: CalendarDays },
    { title: 'Appointments', href: '/appointments', icon: CalendarRange },
    { title: 'Customers', href: '/customers', icon: UsersRound },
    { title: 'Services', href: '/services', icon: Scissors },
    { title: 'Staff', href: '/staff', icon: Users },
    { title: 'Locations', href: '/locations', icon: Building2 },
    { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    { title: 'Notifications', href: '/notifications', icon: Bell },
    { title: 'Archived', href: '/archived', icon: ArchiveRestore },
    {
        title: 'Settings',
        href: '/settings/booking-rules',
        icon: Settings,
    },
];

export function AppSidebar() {
    const { workspace } = usePage().props;
    const navigation = mainNavItems.map((item) =>
        item.title === 'Notifications'
            ? { ...item, badge: workspace?.notificationCount || undefined }
            : item,
    );

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-[#dde7e3] bg-white dark:border-[#25413a] dark:bg-[#12201d]"
        >
            <SidebarHeader className="p-4 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-10 p-0 hover:bg-transparent data-[state=open]:bg-transparent"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-1">
                <NavMain items={navigation} />
            </SidebarContent>

            <SidebarFooter className="border-t border-[#dde7e3] p-3 dark:border-[#25413a]">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
