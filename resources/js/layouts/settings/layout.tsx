import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', url: '/settings/profile', icon: null },
    { title: 'Password', url: '/settings/password', icon: null },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;
    return (
        <div className="msv-page">
            <Heading title="Account settings" description="Manage your personal information and account security" />
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
                <aside className="w-full lg:w-52">
                    <nav className="flex gap-2 lg:flex-col">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('justify-start', currentPath === item.url && 'bg-[#e9f2e7] font-semibold text-[#075313]')}
                            >
                                <Link href={item.url}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>
                <Separator className="lg:hidden" />
                <section className="min-w-0 flex-1 lg:max-w-3xl">{children}</section>
            </div>
        </div>
    );
}
