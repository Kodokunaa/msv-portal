import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, CircleAlert } from 'lucide-react';

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    if (!flash?.success && !flash?.error) return null;

    const success = Boolean(flash.success);
    return (
        <div
            className={`mx-4 mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm sm:mx-6 lg:mx-8 ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}
        >
            {success ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" />}
            <span>{flash.success || flash.error}</span>
        </div>
    );
}
