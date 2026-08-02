import type { PaginationLink } from '@/types';
import { Link } from '@inertiajs/react';

type Props = {
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

const cleanLabel = (label: string) => label.replace('&laquo;', '‹').replace('&raquo;', '›');

export default function Pagination({ links, from, to, total }: Props) {
    if (total === 0) return null;

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
                Showing {from ?? 0}–{to ?? 0} of {total}
            </p>
            <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                {links.map((link, index) =>
                    link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`min-w-9 rounded-md border px-3 py-2 text-center text-sm transition ${
                                link.active ? 'border-[#075313] bg-[#075313] text-white' : 'border-border bg-white text-slate-700 hover:bg-[#eef3eb]'
                            }`}
                            dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }}
                        />
                    ) : (
                        <span
                            key={`${link.label}-${index}`}
                            className="min-w-9 cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-400"
                            dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }}
                        />
                    ),
                )}
            </nav>
        </div>
    );
}
