import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
    children: ReactNode;
    title: string;
    description: string;
};

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f6f7f2] lg:grid lg:grid-cols-2">
            {/* Left branding panel */}
            <section className="relative hidden overflow-hidden bg-[#063d1f] lg:flex lg:flex-col lg:justify-between">
                <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#e6c527]/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

                <div className="relative z-10 p-10">
                    <Link href="/" className="inline-flex items-center gap-4">
                        <div className="rounded-2xl bg-white p-2 shadow-lg">
                            <img src="/images/msv-logo.png" alt="Mindoro Supporting Varsitarian logo" className="h-16 w-16 object-contain" />
                        </div>

                        <div>
                            <p className="font-bold tracking-wide text-white">MINDORO SUPPORTING</p>
                            <p className="text-sm font-semibold tracking-[0.2em] text-[#e6c527]">VARSITARIAN, INC.</p>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 max-w-xl px-10 pb-12">
                    <div className="mb-6 h-1 w-16 rounded-full bg-[#e6c527]" />

                    <h1 className="text-4xl leading-tight font-bold text-white">
                        Secure access for the
                        <span className="text-[#e6c527]"> MSV community.</span>
                    </h1>

                    <p className="mt-5 max-w-lg text-lg leading-8 text-white/70">
                        Manage your membership, review organizational records, and access transparent information through one protected portal.
                    </p>

                    <div className="mt-9 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-sm font-semibold text-white">Protected Records</p>
                            <p className="mt-1 text-xs leading-5 text-white/60">Access is limited according to account role and approval status.</p>
                        </div>

                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-sm font-semibold text-white">Member Transparency</p>
                            <p className="mt-1 text-xs leading-5 text-white/60">
                                Approved members can securely review available organizational information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 border-t border-white/10 px-10 py-5">
                    <p className="text-xs text-white/65">Mindoro Supporting Varsitarian Member Portal</p>
                </div>
            </section>

            {/* Form section */}
            <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="mb-8 flex justify-center lg:hidden">
                        <Link href="/" className="flex flex-col items-center">
                            <img src="/images/msv-logo.png" alt="Mindoro Supporting Varsitarian logo" className="h-24 w-24 object-contain" />

                            <p className="mt-3 text-sm font-bold tracking-wide text-[#075313]">MINDORO SUPPORTING VARSITARIAN</p>
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-[#d9dfd4] bg-white p-6 shadow-xl shadow-[#063d1f]/5 sm:p-8">
                        <div className="mb-7">
                            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#856f00] uppercase">MSV Member Portal</p>

                            <h2 className="text-2xl font-bold tracking-tight text-[#063d1f]">{title}</h2>

                            {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
                        </div>

                        {children}
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm font-medium text-[#075313] hover:underline">
                            ← Return to the MSV home page
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
