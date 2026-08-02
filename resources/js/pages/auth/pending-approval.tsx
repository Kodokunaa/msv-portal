import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, LogOut, MailCheck, UserRoundPen } from 'lucide-react';

export default function PendingApproval({ emailVerified, status }: { emailVerified: boolean; status?: string }) {
    return (
        <>
            <Head title="Pending Approval" />
            <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-5 py-10">
                <section className="w-full max-w-lg rounded-3xl border border-[#d9dfd4] bg-white p-8 text-center shadow-xl shadow-[#063d1f]/5">
                    <img src="/images/msv-logo.png" alt="Mindoro Supporting Varsitarian" className="mx-auto h-28 w-28 object-contain" />
                    <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Clock3 className="h-7 w-7" />
                    </div>
                    <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#856f00] uppercase">Membership application</p>
                    <h1 className="mt-2 text-3xl font-bold text-[#063d1f]">Pending approval</h1>
                    <p className="mt-4 leading-7 text-slate-600">
                        Your account was created successfully. An MSV administrator must review and approve your application before you can access the
                        member portal.
                    </p>

                    {status && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{status}</div>}

                    <div
                        className={`mt-7 rounded-xl border p-4 text-left ${emailVerified ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
                    >
                        <div className="flex items-start gap-3">
                            {emailVerified ? (
                                <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" />
                            ) : (
                                <MailCheck className="mt-0.5 size-5 text-amber-700" />
                            )}
                            <div>
                                <p className={`font-semibold ${emailVerified ? 'text-emerald-900' : 'text-amber-900'}`}>
                                    {emailVerified ? 'Email verified' : 'Verify your email address'}
                                </p>
                                <p className={`mt-1 text-sm leading-6 ${emailVerified ? 'text-emerald-800' : 'text-amber-800'}`}>
                                    {emailVerified
                                        ? 'Your email is confirmed. You only need to wait for the administrator’s decision.'
                                        : 'Email verification is required before an approved account can enter the portal.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        {!emailVerified && (
                            <Button asChild>
                                <Link href={route('verification.send')} method="post" as="button" className="w-full">
                                    <MailCheck className="h-4 w-4" /> Resend verification email
                                </Link>
                            </Button>
                        )}
                        <Link
                            href="/settings/profile"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#075313] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#043f0e]"
                        >
                            <UserRoundPen className="h-4 w-4" /> Complete or update profile
                        </Link>
                        <Link
                            href="/"
                            className="rounded-lg border border-[#075313] px-5 py-3 text-sm font-semibold text-[#075313] transition hover:bg-[#eef3eb]"
                        >
                            Return to home page
                        </Link>
                        <Button variant="outline" asChild>
                            <Link href={route('logout')} method="post" as="button" className="w-full">
                                <LogOut className="h-4 w-4" /> Log out
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
