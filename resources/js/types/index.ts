import type { LucideIcon } from 'lucide-react';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    status: string | null;
    status_name: string | null;
    roles: string[];
    is_admin: boolean;
    is_manager: boolean;
    is_provincial_admin: boolean;
    can_manage_records: boolean;
    council: string | null;
}

export interface Auth {
    user: User | null;
}
export interface Flash {
    success?: string | null;
    error?: string | null;
}
export interface BreadcrumbItem {
    title: string;
    href: string;
}
export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}
export interface NavGroup {
    title: string;
    items: NavItem[];
}
export interface SharedData {
    name: string;
    auth: Auth;
    flash: Flash;
    quote?: { message: string; author: string };
    [key: string]: unknown;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
