import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.16em] text-[#f0d642]/80 uppercase">MSV Portal</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active = page.url === item.url || (item.url !== '/dashboard' && page.url.startsWith(item.url));
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={item.title}
                                className="hover:bg-sidebar-accent text-white/80 hover:text-white data-[active=true]:bg-[#e6c527] data-[active=true]:font-semibold data-[active=true]:text-[#17330e]"
                            >
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
