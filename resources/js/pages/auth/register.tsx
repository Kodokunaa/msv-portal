import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    [key: string]: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to submit your membership application">
            <Head title="Register" />

            <div className="mb-6 space-y-3">
                <Button type="button" variant="outline" className="w-full border-[#cbd8c8] bg-white text-[#36523d]" disabled>
                    <span className="flex size-5 items-center justify-center rounded-full border text-xs font-bold">G</span>
                    Register with Google
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                    Google registration will still require Admin approval when OAuth is enabled.
                </p>
                <div className="flex items-center gap-3">
                    <span className="bg-border h-px flex-1" />
                    <span className="text-muted-foreground text-xs">or use email</span>
                    <span className="bg-border h-px flex-1" />
                </div>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First name</Label>

                            <Input
                                id="first_name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="given-name"
                                value={data.first_name}
                                onChange={(event) => setData('first_name', event.target.value)}
                                disabled={processing}
                                placeholder="First name"
                            />

                            <InputError message={errors.first_name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last name</Label>

                            <Input
                                id="last_name"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="family-name"
                                value={data.last_name}
                                onChange={(event) => setData('last_name', event.target.value)}
                                disabled={processing}
                                placeholder="Last name"
                            />

                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>

                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>

                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>

                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />

                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full bg-[#075313] text-white hover:bg-[#043f0e]" tabIndex={6} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Submit membership application
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={7}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
