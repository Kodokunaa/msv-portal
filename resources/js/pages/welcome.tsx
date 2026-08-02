import { Head, Link } from '@inertiajs/react';

type WelcomePageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
};

const features = [
    {
        number: '01',
        title: 'Member Management',
        description: 'Maintain an organized directory of approved members and membership applications.',
    },
    {
        number: '02',
        title: 'Financial Transparency',
        description: 'Give members read-only access to clear income, expense, and balance information.',
    },
    {
        number: '03',
        title: 'Payment Records',
        description: 'Allow every member to securely review their own payment history and status.',
    },
    {
        number: '04',
        title: 'Secure Access',
        description: 'Protect organizational information using account approval and role-based permissions.',
    },
];

export default function Welcome({ auth }: WelcomePageProps) {
    return (
        <>
            <Head title="Mindoro Supporting Varsitarian" />

            <div className="min-h-screen bg-[#f6f7f2] text-slate-950">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-[#d9dfd4] bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/images/msv-logo.png" alt="Mindoro Supporting Varsitarian logo" className="h-12 w-12 object-contain" />

                            <div>
                                <p className="text-sm font-bold tracking-wide text-[#075313]">MINDORO SUPPORTING</p>
                                <p className="text-xs font-semibold tracking-[0.18em] text-[#856f00]">VARSITARIAN, INC.</p>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-7 md:flex">
                            <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-[#075313]">
                                About
                            </a>

                            <a href="#services" className="text-sm font-medium text-slate-600 transition hover:text-[#075313]">
                                Portal
                            </a>

                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg bg-[#075313] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#043f0e]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-semibold text-[#075313] transition hover:text-[#043f0e]">
                                        Log in
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-[#075313] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#043f0e]"
                                    >
                                        Apply for Membership
                                    </Link>
                                </>
                            )}
                        </nav>

                        <div className="flex items-center gap-2 md:hidden">
                            {auth.user ? (
                                <Link href="/dashboard" className="rounded-lg bg-[#075313] px-4 py-2 text-sm font-semibold text-white">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/login" className="rounded-lg border border-[#075313] px-4 py-2 text-sm font-semibold text-[#075313]">
                                    Log in
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    {/* Hero */}
                    <section className="relative overflow-hidden bg-[#063d1f]">
                        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-[#e6c527]/15 blur-3xl" />
                        <div className="absolute -bottom-48 -left-28 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
                            <div>
                                <div className="mb-6 inline-flex items-center rounded-full border border-[#e6c527]/50 bg-[#e6c527]/10 px-4 py-2 text-sm font-semibold text-[#f3d94c]">
                                    Official Member Portal
                                </div>

                                <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    Supporting members through
                                    <span className="text-[#e6c527]"> unity, service, and transparency.</span>
                                </h1>

                                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
                                    A secure digital platform for membership applications, organizational records, payment history, and financial
                                    transparency.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    {auth.user ? (
                                        <Link
                                            href="/dashboard"
                                            className="rounded-lg bg-[#e6c527] px-6 py-3.5 text-center text-sm font-bold text-[#063d1f] transition hover:bg-[#f2d743]"
                                        >
                                            Open Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/register"
                                                className="rounded-lg bg-[#e6c527] px-6 py-3.5 text-center text-sm font-bold text-[#063d1f] transition hover:bg-[#f2d743]"
                                            >
                                                Apply for Membership
                                            </Link>

                                            <Link
                                                href="/login"
                                                className="rounded-lg border border-white/40 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                            >
                                                Member Login
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/65">
                                    <span>✓ Secure member access</span>
                                    <span>✓ Administrative approval</span>
                                    <span>✓ Transparent records</span>
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-end">
                                <div className="relative">
                                    <div className="absolute inset-5 rounded-full bg-[#e6c527]/30 blur-3xl" />

                                    <div className="relative rounded-[2rem] border border-white/20 bg-white/95 p-8 shadow-2xl sm:p-12">
                                        <img
                                            src="/images/msv-logo.png"
                                            alt="Mindoro Supporting Varsitarian"
                                            className="h-64 w-64 object-contain sm:h-80 sm:w-80"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* About */}
                    <section id="about" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div>
                                <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#856f00] uppercase">About the organization</p>

                                <h2 className="text-3xl font-bold tracking-tight text-[#063d1f] sm:text-4xl">
                                    A centralized platform for the MSV community
                                </h2>
                            </div>

                            <div>
                                <p className="text-lg leading-8 text-slate-600">
                                    The MSV Member Portal brings essential organizational records into one protected system. Approved members can
                                    conveniently access information while administrators manage membership and organizational records responsibly.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section id="services" className="border-y border-[#d9dfd4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
                            <div className="mb-12 max-w-2xl">
                                <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#856f00] uppercase">Member portal</p>

                                <h2 className="text-3xl font-bold tracking-tight text-[#063d1f] sm:text-4xl">
                                    Everything members need in one secure place
                                </h2>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature) => (
                                    <article
                                        key={feature.number}
                                        className="rounded-2xl border border-[#d9dfd4] bg-[#f8faf6] p-6 transition hover:-translate-y-1 hover:border-[#d2b522] hover:shadow-lg"
                                    >
                                        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#075313] text-sm font-bold text-[#e6c527]">
                                            {feature.number}
                                        </div>

                                        <h3 className="text-lg font-bold text-[#063d1f]">{feature.title}</h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Council */}
                    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
                        <div className="overflow-hidden rounded-3xl bg-[#efe9c7]">
                            <div className="grid items-center gap-8 px-7 py-10 md:grid-cols-[auto_1fr] md:px-12">
                                <img
                                    src="/images/oriental-mindoro-council-logo.png"
                                    alt="Oriental Mindoro Provincial Council"
                                    className="mx-auto h-32 w-32 object-contain md:h-40 md:w-40"
                                />

                                <div>
                                    <p className="text-sm font-bold tracking-[0.18em] text-[#856c00] uppercase">Provincial Council</p>

                                    <h2 className="mt-2 text-2xl font-bold text-[#063d1f] sm:text-3xl">Oriental Mindoro Provincial Council</h2>

                                    <p className="mt-4 max-w-3xl leading-7 text-slate-700">
                                        The portal is designed to support provincial council administration while remaining ready for future
                                        organizational expansion.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Call to action */}
                    <section className="bg-[#075313]">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-5 py-14 text-center md:flex-row md:text-left lg:px-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Ready to join the MSV community?</h2>

                                <p className="mt-2 text-white/70">Submit your application for administrator review.</p>
                            </div>

                            {!auth.user && (
                                <Link
                                    href="/register"
                                    className="rounded-lg bg-[#e6c527] px-7 py-3.5 text-sm font-bold text-[#063d1f] transition hover:bg-[#f2d743]"
                                >
                                    Create an Account
                                </Link>
                            )}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-[#042d17]">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 text-center sm:flex-row sm:text-left lg:px-8">
                        <div className="flex items-center gap-3">
                            <img src="/images/msv-logo.png" alt="" className="h-10 w-10 object-contain" />

                            <div>
                                <p className="text-sm font-semibold text-white">Mindoro Supporting Varsitarian, Inc.</p>
                                <p className="text-xs text-white/55">Member Management and Transparency Portal</p>
                            </div>
                        </div>

                        <p className="text-xs text-white/55">© {new Date().getFullYear()} Mindoro Supporting Varsitarian. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
