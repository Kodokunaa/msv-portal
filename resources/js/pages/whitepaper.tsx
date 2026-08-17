import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Check,
    Database,
    Download,
    FileCheck2,
    FileText,
    Gauge,
    KeyRound,
    LockKeyhole,
    Printer,
    Scale,
    ShieldCheck,
    UserCheck,
    Users,
    WalletCards,
} from 'lucide-react';

type WhitepaperProps = {
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
};

type Role = {
    name: string;
    eyebrow: string;
    description: string;
    permissions: string[];
    accent: string;
};

const sections = [
    ['overview', 'Overview'],
    ['quick-start', 'How to use'],
    ['roles', 'Roles'],
    ['features', 'Features'],
    ['security', 'Security'],
    ['capacity', 'Capacity'],
    ['deployment', 'Deployment'],
    ['faq', 'FAQ'],
];

const roles: Role[] = [
    {
        name: 'Member',
        eyebrow: 'Approved users',
        description: 'A transparent, read-only view of organizational information and personal payment history.',
        permissions: ['View published finances', 'View personal payments', 'View disciplinary records', 'Manage own profile'],
        accent: 'border-emerald-200 bg-emerald-50/70',
    },
    {
        name: 'Admin',
        eyebrow: 'Operations',
        description: 'Responsible for membership, payments, and disciplinary record administration.',
        permissions: ['Review applications', 'Manage member status', 'Manage payments', 'Manage disciplinary cases'],
        accent: 'border-amber-200 bg-amber-50/70',
    },
    {
        name: 'Manager',
        eyebrow: 'Organization-wide',
        description: 'Full operational oversight with exclusive responsibility for financial record management.',
        permissions: ['All Admin capabilities', 'Manage financial records', 'Assign roles and councils', 'Review audit logs'],
        accent: 'border-[#aac9b2] bg-[#edf6ef]',
    },
];

const steps = [
    ['Create an account', 'Submit your name, email address, and a secure password through the registration page.'],
    ['Verify your email', 'Open the verification link delivered to your registered email address.'],
    ['Wait for approval', 'An Admin or Manager reviews the application before portal access is granted.'],
    ['Open your dashboard', 'Approved members are routed to a dashboard designed for their assigned role.'],
    ['Review your records', 'Use the navigation to view finances, personal payments, and disciplinary information.'],
];

const features: Array<{ icon: LucideIcon; title: string; description: string; items: string[] }> = [
    {
        icon: UserCheck,
        title: 'Membership lifecycle',
        description: 'A controlled process from application to active membership.',
        items: ['Pending-by-default registration', 'Approval and rejection', 'Suspension and reactivation', 'Role and status history'],
    },
    {
        icon: WalletCards,
        title: 'Financial transparency',
        description: 'A shared view of published organizational income and expenses.',
        items: ['Income and expense records', 'Balance summaries', 'Categories and references', 'Manager-only financial control'],
    },
    {
        icon: FileCheck2,
        title: 'Payment records',
        description: 'Private payment visibility with organization-wide administration.',
        items: ['Amount due and paid', 'Payment date and status', 'Member-only personal history', 'Audited record voiding'],
    },
    {
        icon: Scale,
        title: 'Disciplinary records',
        description: 'Structured, accountable documentation of organizational cases.',
        items: ['Case numbers and violations', 'Incident details', 'Actions and statuses', 'Read-only member access'],
    },
    {
        icon: BarChart3,
        title: 'Role dashboards',
        description: 'Relevant summaries without exposing controls a user cannot access.',
        items: ['Member overview', 'Admin operating metrics', 'Financial summaries', 'Recent Manager activity'],
    },
    {
        icon: Database,
        title: 'API and auditability',
        description: 'A secure integration layer supported by traceable organizational actions.',
        items: ['Sanctum bearer tokens', 'Bounded API pagination', 'Before-and-after audit values', 'Status and assignment history'],
    },
];

const securityControls = [
    ['Identity', 'Hashed passwords, email verification, secure password reset, and token authentication.'],
    ['Authorization', 'Route middleware and model policies enforce Member, Admin, and Manager boundaries.'],
    ['Account state', 'Pending, rejected, suspended, and deactivated users cannot bypass controls through direct URLs.'],
    ['Data privacy', 'Members can retrieve only their own payment records. Administrative controls remain server-enforced.'],
    ['Record integrity', 'Sensitive business records are voided with a reason rather than silently removed.'],
    ['Traceability', 'Audit logs preserve the actor, action, entity, IP address, user agent, and changed values.'],
];

const faqs = [
    ['Why is my account pending?', 'Every application requires review. Portal access begins only after approval and email verification.'],
    ['Who can edit financial records?', 'Only the Manager role can create, update, or void financial records.'],
    [
        'Can another member see my payments?',
        'No. Members can see only their own payment history; Admins and Managers manage the complete payment register.',
    ],
    ['Are deleted records recoverable?', 'Business records are voided and retained with an audit reason instead of being permanently removed.'],
    [
        'Does 250 users mean 250 requests at one instant?',
        'No. Active users normally pause to read pages. A concurrency test intentionally creates a more severe burst than typical use.',
    ],
];

function SectionHeading({ number, eyebrow, title, description }: { number: string; eyebrow: string; title: string; description: string }) {
    return (
        <div className="mb-10 grid gap-5 lg:grid-cols-[140px_1fr]">
            <div className="font-mono text-sm font-semibold tracking-[0.2em] text-[#8a7410]">SECTION {number}</div>
            <div className="max-w-3xl">
                <p className="text-xs font-bold tracking-[0.2em] text-[#7a6810] uppercase">{eyebrow}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#073b20] sm:text-4xl">{title}</h2>
                <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
            </div>
        </div>
    );
}

export default function Whitepaper({ auth }: WhitepaperProps) {
    return (
        <>
            <Head title="Portal White Paper">
                <meta name="description" content="User guide, system capabilities, security model, and measured capacity of the MSV Member Portal." />
            </Head>

            <div className="min-h-screen bg-[#f4f5ef] text-slate-950 print:bg-white">
                <header className="whitepaper-no-print sticky top-0 z-50 border-b border-[#d8dfd5] bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
                        <Link href="/" className="flex min-w-0 items-center gap-3">
                            <img src="/images/msv-logo.png" alt="MSV logo" className="h-11 w-11 shrink-0 object-contain" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#075313]">MSV MEMBER PORTAL</p>
                                <p className="truncate text-[10px] font-semibold tracking-[0.16em] text-[#856f00]">SYSTEM WHITE PAPER · 2026</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <a
                                href="/whitepaper/download"
                                download
                                className="hidden items-center gap-2 rounded-lg bg-[#e6c527] px-4 py-2 text-sm font-bold text-[#063d1f] transition hover:bg-[#f2d743] md:flex"
                            >
                                <Download className="h-4 w-4" /> Download PDF
                            </a>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="hidden items-center gap-2 rounded-lg border border-[#cad6c8] px-4 py-2 text-sm font-semibold text-[#075313] transition hover:bg-[#edf4eb] sm:flex"
                            >
                                <Printer className="h-4 w-4" /> Print
                            </button>
                            <Link
                                href={auth.user ? '/dashboard' : '/login'}
                                className="rounded-lg bg-[#075313] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#043f0e]"
                            >
                                {auth.user ? 'Dashboard' : 'Open portal'}
                            </Link>
                        </div>
                    </div>
                </header>

                <nav className="whitepaper-no-print border-b border-[#d8dfd5] bg-[#edf2ea] lg:hidden">
                    <div className="flex gap-5 overflow-x-auto px-5 py-3 text-xs font-semibold whitespace-nowrap text-slate-600">
                        {sections.map(([id, label]) => (
                            <a key={id} href={`#${id}`} className="hover:text-[#075313]">
                                {label}
                            </a>
                        ))}
                    </div>
                </nav>

                <main>
                    <section className="relative overflow-hidden bg-[#063d1f] text-white">
                        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:56px_56px] opacity-20" />
                        <div className="absolute -top-28 right-0 h-96 w-96 rounded-full bg-[#e6c527]/20 blur-3xl" />
                        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-28">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#e6c527]/40 bg-[#e6c527]/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-[#f2d743] uppercase">
                                    <BookOpen className="h-4 w-4" /> Public system guide
                                </div>
                                <h1 className="mt-7 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl">
                                    One portal. Clear records. <span className="text-[#e6c527]">Accountable service.</span>
                                </h1>
                                <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
                                    The official guide to using the Mindoro Supporting Varsitarian Member Portal—its roles, capabilities, safeguards,
                                    and measured operating profile.
                                </p>
                                <div className="whitepaper-no-print mt-9 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href="#quick-start"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e6c527] px-6 py-3.5 text-sm font-bold text-[#063d1f] transition hover:bg-[#f2d743]"
                                    >
                                        Read the guide <ArrowRight className="h-4 w-4" />
                                    </a>
                                    <Link
                                        href="/register"
                                        className="rounded-lg border border-white/35 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Apply for membership
                                    </Link>
                                    <a
                                        href="/whitepaper/download"
                                        download
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        <Download className="h-4 w-4" /> Download PDF
                                    </a>
                                </div>
                            </div>

                            <div className="self-end rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                                <p className="text-xs font-bold tracking-[0.18em] text-[#f2d743] uppercase">Document profile</p>
                                <dl className="mt-6 space-y-5 text-sm">
                                    <div className="flex justify-between gap-5 border-b border-white/15 pb-4">
                                        <dt className="text-white/55">Release</dt>
                                        <dd className="font-semibold">Version 1.0</dd>
                                    </div>
                                    <div className="flex justify-between gap-5 border-b border-white/15 pb-4">
                                        <dt className="text-white/55">Audience</dt>
                                        <dd className="font-semibold">Members & officers</dd>
                                    </div>
                                    <div className="flex justify-between gap-5 border-b border-white/15 pb-4">
                                        <dt className="text-white/55">Access</dt>
                                        <dd className="font-semibold">Public reference</dd>
                                    </div>
                                    <div className="flex justify-between gap-5">
                                        <dt className="text-white/55">Platform</dt>
                                        <dd className="font-semibold">Laravel + React</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </section>

                    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[220px_1fr] lg:px-8 lg:py-24">
                        <aside className="whitepaper-no-print hidden lg:block">
                            <div className="sticky top-28 rounded-2xl border border-[#d5ded2] bg-white p-5 shadow-sm">
                                <p className="mb-4 text-[10px] font-bold tracking-[0.18em] text-[#806e16] uppercase">On this page</p>
                                <nav className="space-y-1">
                                    {sections.map(([id, label], index) => (
                                        <a
                                            key={id}
                                            href={`#${id}`}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#edf4eb] hover:text-[#075313]"
                                        >
                                            <span className="font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                                            {label}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        <div className="min-w-0 space-y-24">
                            <section id="overview" className="scroll-mt-28">
                                <SectionHeading
                                    number="01"
                                    eyebrow="Purpose"
                                    title="A trusted operating record for the organization"
                                    description="The portal centralizes membership decisions, financial transparency, payment history, disciplinary records, and accountability controls in one protected system."
                                />
                                <div className="grid gap-5 sm:grid-cols-3">
                                    {[
                                        [Users, 'People', 'A clear membership lifecycle from application through active service.'],
                                        [FileText, 'Records', 'Structured, searchable organizational information with controlled editing.'],
                                        [ShieldCheck, 'Trust', 'Server-enforced permissions and traceable decisions at every sensitive step.'],
                                    ].map(([Icon, title, copy]) => {
                                        const Component = Icon as LucideIcon;
                                        return (
                                            <article key={title as string} className="rounded-2xl border border-[#d5ded2] bg-white p-6 shadow-sm">
                                                <Component className="h-6 w-6 text-[#075313]" />
                                                <h3 className="mt-5 text-lg font-bold text-[#073b20]">{title as string}</h3>
                                                <p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>

                            <section id="quick-start" className="scroll-mt-28">
                                <SectionHeading
                                    number="02"
                                    eyebrow="Member guide"
                                    title="From application to everyday use"
                                    description="The member experience is intentionally simple. Approval and verification happen before any organizational information becomes available."
                                />
                                <div className="overflow-hidden rounded-3xl border border-[#d5ded2] bg-white shadow-sm">
                                    {steps.map(([title, description], index) => (
                                        <div
                                            key={title}
                                            className="grid gap-4 border-b border-[#e0e6de] p-6 last:border-0 sm:grid-cols-[56px_1fr] sm:p-7"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075313] font-mono text-sm font-bold text-[#e6c527]">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#073b20]">{title}</h3>
                                                <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section id="roles" className="scroll-mt-28">
                                <SectionHeading
                                    number="03"
                                    eyebrow="Access model"
                                    title="Responsibilities are separated by role"
                                    description="Visibility and editing privileges are enforced by the server. Hiding a button is never treated as the security boundary."
                                />
                                <div className="grid gap-5 xl:grid-cols-3">
                                    {roles.map((role) => (
                                        <article key={role.name} className={`rounded-2xl border p-6 ${role.accent}`}>
                                            <p className="text-[10px] font-bold tracking-[0.18em] text-[#806e16] uppercase">{role.eyebrow}</p>
                                            <h3 className="mt-2 text-2xl font-bold text-[#073b20]">{role.name}</h3>
                                            <p className="mt-3 min-h-18 text-sm leading-6 text-slate-600">{role.description}</p>
                                            <ul className="mt-6 space-y-3">
                                                {role.permissions.map((permission) => (
                                                    <li key={permission} className="flex gap-3 text-sm text-slate-700">
                                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#075313]" /> {permission}
                                                    </li>
                                                ))}
                                            </ul>
                                        </article>
                                    ))}
                                </div>

                                <div className="mt-7 overflow-x-auto rounded-2xl border border-[#d5ded2] bg-white shadow-sm">
                                    <table className="w-full min-w-[680px] text-left text-sm">
                                        <thead className="bg-[#edf2ea] text-[#073b20]">
                                            <tr>
                                                <th className="px-5 py-4 font-bold">Capability</th>
                                                <th className="px-5 py-4 font-bold">Member</th>
                                                <th className="px-5 py-4 font-bold">Admin</th>
                                                <th className="px-5 py-4 font-bold">Manager</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e0e6de]">
                                            {[
                                                ['View published finances', true, true, true],
                                                ['View own payments', true, true, true],
                                                ['Manage applications and members', false, true, true],
                                                ['Manage payments and discipline', false, true, true],
                                                ['Manage financial records', false, false, true],
                                                ['Manage roles and audit logs', false, false, true],
                                            ].map(([label, ...values]) => (
                                                <tr key={label as string}>
                                                    <td className="px-5 py-4 font-medium text-slate-700">{label as string}</td>
                                                    {values.map((value, index) => (
                                                        <td key={index} className="px-5 py-4">
                                                            {value ? (
                                                                <Check className="h-5 w-5 text-[#075313]" />
                                                            ) : (
                                                                <span className="text-slate-300">—</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section id="features" className="scroll-mt-28">
                                <SectionHeading
                                    number="04"
                                    eyebrow="Capabilities"
                                    title="The complete operating toolkit"
                                    description="Each module is designed around a specific organizational responsibility while sharing one identity, permissions, and audit model."
                                />
                                <div className="grid gap-5 md:grid-cols-2">
                                    {features.map(({ icon: Icon, title, description, items }) => (
                                        <article key={title} className="rounded-2xl border border-[#d5ded2] bg-white p-6 shadow-sm">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075313] text-[#e6c527]">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="mt-5 text-xl font-bold text-[#073b20]">{title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {items.map((item) => (
                                                    <span
                                                        key={item}
                                                        className="rounded-full bg-[#edf2ea] px-3 py-1.5 text-xs font-medium text-[#36523d]"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section id="security" className="scroll-mt-28">
                                <SectionHeading
                                    number="05"
                                    eyebrow="Safeguards"
                                    title="Security is enforced beyond the interface"
                                    description="The portal combines identity, account-state checks, authorization policies, protected routing, and audit history to reduce unauthorized access and untraceable changes."
                                />
                                <div className="rounded-3xl bg-[#073b20] p-6 text-white sm:p-9">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        {securityControls.map(([title, description], index) => (
                                            <article key={title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                                                <div className="flex items-center gap-3">
                                                    {index === 0 ? (
                                                        <KeyRound className="h-5 w-5 text-[#e6c527]" />
                                                    ) : (
                                                        <LockKeyhole className="h-5 w-5 text-[#e6c527]" />
                                                    )}
                                                    <h3 className="font-bold">{title}</h3>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-white/70">{description}</p>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section id="capacity" className="scroll-mt-28">
                                <SectionHeading
                                    number="06"
                                    eyebrow="Performance"
                                    title="Designed toward a 250-user burst profile"
                                    description="Capacity figures are measured engineering evidence, not a hosting guarantee. Production performance depends on PHP workers, database resources, Redis, network conditions, and data volume."
                                />
                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        ['250', 'Virtual users'],
                                        ['1,000', 'Total requests'],
                                        ['98.5%', 'Best local success'],
                                        ['27.65', 'Requests / second'],
                                    ].map(([value, label]) => (
                                        <div key={label} className="rounded-2xl border border-[#d5ded2] bg-white p-6 shadow-sm">
                                            <p className="text-3xl font-bold tracking-tight text-[#075313]">{value}</p>
                                            <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">{label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
                                    <div className="rounded-2xl border border-[#d5ded2] bg-white p-6">
                                        <Gauge className="h-6 w-6 text-[#075313]" />
                                        <h3 className="mt-4 font-bold text-[#073b20]">Observed local profile</h3>
                                        <dl className="mt-5 space-y-3 text-sm">
                                            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                                <dt className="text-slate-500">Median latency</dt>
                                                <dd className="font-semibold">2.75 seconds</dd>
                                            </div>
                                            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                                <dt className="text-slate-500">Successful requests</dt>
                                                <dd className="font-semibold">985 / 1,000</dd>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">Environment</dt>
                                                <dd className="font-semibold">Local XAMPP</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                                        <h3 className="font-bold text-amber-950">How to interpret these numbers</h3>
                                        <p className="mt-3 text-sm leading-6 text-amber-900/75">
                                            The local test deliberately created 250 simultaneous workflows. Typical members pause to read between
                                            requests, so ordinary regional traffic is substantially lighter. The remaining local failures were
                                            worker-pool timeouts; Hostinger staging must pass the same test before any guaranteed capacity is
                                            published.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section id="deployment" className="scroll-mt-28">
                                <SectionHeading
                                    number="07"
                                    eyebrow="Operations"
                                    title="Production readiness depends on the environment"
                                    description="A secure deployment requires more than uploading source files. The server must preserve Laravel's public boundary and provide dependable sessions, queues, mail, and backups."
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        [
                                            'Public document root',
                                            'Serve only the public directory; never expose .env, storage, or application source.',
                                        ],
                                        ['Production configuration', 'Disable debug mode, enforce HTTPS cookies, and use a unique application key.'],
                                        ['Redis and queues', 'Use Redis for sessions and cache, with a supervised worker for notifications.'],
                                        ['Mail delivery', 'Configure and verify SMTP for registration, approval, and password-reset messages.'],
                                        ['Database safety', 'Back up before migrations and apply indexed schema changes through Artisan.'],
                                        ['Monitoring', 'Watch HTTP errors, queue failures, slow requests, resource usage, and backup completion.'],
                                    ].map(([title, description], index) => (
                                        <article key={title} className="flex gap-4 rounded-2xl border border-[#d5ded2] bg-white p-5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf2ea] font-mono text-xs font-bold text-[#075313]">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#073b20]">{title}</h3>
                                                <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section id="faq" className="scroll-mt-28">
                                <SectionHeading
                                    number="08"
                                    eyebrow="Common questions"
                                    title="Answers for members and officers"
                                    description="These answers describe the current operating rules of the portal. Organization policy remains authoritative when procedures change."
                                />
                                <div className="space-y-3">
                                    {faqs.map(([question, answer]) => (
                                        <details key={question} className="group rounded-2xl border border-[#d5ded2] bg-white p-5 open:shadow-sm">
                                            <summary className="cursor-pointer list-none pr-8 font-bold text-[#073b20] marker:hidden">
                                                {question}
                                            </summary>
                                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>

                    <section className="whitepaper-no-print bg-[#075313] text-white">
                        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 md:flex-row md:items-center lg:px-8">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold tracking-[0.18em] text-[#e6c527] uppercase">Member access</p>
                                <h2 className="mt-3 text-3xl font-bold">Ready to use the portal?</h2>
                                <p className="mt-3 text-white/70">Apply for membership or sign in with an approved account.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href="/register" className="rounded-lg bg-[#e6c527] px-6 py-3 text-center text-sm font-bold text-[#063d1f]">
                                    Create account
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-lg border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white"
                                >
                                    Member login
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#042d17] text-white">
                    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center lg:px-8">
                        <div className="flex items-center gap-3">
                            <img src="/images/msv-logo.png" alt="" className="h-10 w-10 object-contain" />
                            <div>
                                <p className="text-sm font-semibold">Mindoro Supporting Varsitarian, Inc.</p>
                                <p className="text-xs text-white/50">Member Portal · Public System White Paper</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/50">Updated August 2026 · Version 1.0</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
