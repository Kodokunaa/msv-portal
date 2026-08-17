import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;
    return (
        <header className="border-border flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-white px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-[#075313]" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[#063d1f]">{auth.user?.name}</p>
                <p className="text-muted-foreground text-xs">{auth.user?.is_manager ? 'Manager' : auth.user?.is_admin ? 'Admin' : 'Member'}</p>
            </div>
        </header>
    );
}
