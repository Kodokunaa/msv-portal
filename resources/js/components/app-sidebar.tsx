import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CreditCard, FileWarning, Landmark, LayoutDashboard, ScrollText, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const items: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Financial Records', url: '/financial-records', icon: Landmark },
        { title: 'Payment Records', url: '/payments', icon: CreditCard },
        { title: 'Disciplinary Records', url: '/disciplinary-records', icon: FileWarning },
    ];

    if (user?.can_manage_records) items.push({ title: 'Member Management', url: '/management/members', icon: Users });
    if (user?.is_manager) items.push({ title: 'Audit Logs', url: '/audit-logs', icon: ScrollText });

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border border-r">
            <SidebarHeader className="border-sidebar-border/70 border-b py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="pt-4">
                <NavMain items={items} />
            </SidebarContent>
            <SidebarFooter className="border-sidebar-border/70 border-t">
                <div className="mb-1 flex items-center gap-2 rounded-lg bg-white/8 p-2 group-data-[collapsible=icon]:hidden">
                    <img
                        src="/images/oriental-mindoro-council-logo.png"
                        alt="Oriental Mindoro Provincial Council"
                        className="size-9 rounded-full bg-white object-contain p-0.5"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-white">{user?.council || 'MSV Organization'}</p>
                        <p className="truncate text-[10px] text-white/60">{user?.council ? 'Assigned council' : 'Organization-wide access'}</p>
                    </div>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
