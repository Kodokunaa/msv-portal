import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Save } from 'lucide-react';
import type { ChangeEvent, FormEventHandler } from 'react';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Profile settings', href: '/settings/profile' }];
type ProfileData = {
    middle_name?: string | null;
    contact_number?: string | null;
    birth_date?: string | null;
    address?: string | null;
    school?: string | null;
    course?: string | null;
    graduation_year?: number | null;
};

export default function Profile({ profile }: { mustVerifyEmail: boolean; status?: string; profile: ProfileData | null }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user!;
    const form = useForm({
        first_name: user.first_name || '',
        middle_name: profile?.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_number: profile?.contact_number || '',
        birth_date: profile?.birth_date ? profile.birth_date.slice(0, 10) : '',
        address: profile?.address || '',
        school: profile?.school || '',
        course: profile?.course || '',
        graduation_year: profile?.graduation_year ? String(profile.graduation_year) : '',
        avatar: null as File | null,
    });

    const preview = useMemo(() => (form.data.avatar ? URL.createObjectURL(form.data.avatar) : user.avatar), [form.data.avatar, user.avatar]);
    const initials = `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
    const changeAvatar = (event: ChangeEvent<HTMLInputElement>) => form.setData('avatar', event.target.files?.[0] || null);
    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.post('/settings/profile', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 sm:p-8">
                        <HeadingSmall title="Profile information" description="Update your photo and personal membership information" />
                        <form onSubmit={submit} className="mt-7 space-y-7">
                            <div className="flex flex-col gap-5 rounded-2xl bg-[#eef3eb] p-5 sm:flex-row sm:items-center">
                                <Avatar className="size-24 border-4 border-white shadow">
                                    <AvatarImage src={preview || undefined} />
                                    <AvatarFallback className="bg-[#e6c527] text-xl font-bold text-[#17330e]">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Label
                                        htmlFor="avatar"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#075313] px-4 py-2 text-sm font-semibold text-white hover:bg-[#043f0e]"
                                    >
                                        <Camera className="size-4" /> Change avatar
                                    </Label>
                                    <input
                                        id="avatar"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={changeAvatar}
                                    />
                                    <p className="text-muted-foreground mt-2 text-xs">JPG, PNG, or WebP. Maximum 2 MB.</p>
                                    <InputError message={form.errors.avatar} />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First name</Label>
                                    <Input
                                        id="first_name"
                                        value={form.data.first_name}
                                        onChange={(e) => form.setData('first_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={form.errors.first_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle name</Label>
                                    <Input
                                        id="middle_name"
                                        value={form.data.middle_name}
                                        onChange={(e) => form.setData('middle_name', e.target.value)}
                                    />
                                    <InputError message={form.errors.middle_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last name</Label>
                                    <Input
                                        id="last_name"
                                        value={form.data.last_name}
                                        onChange={(e) => form.setData('last_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={form.errors.last_name} />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={form.errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_number">Contact number</Label>
                                    <Input
                                        id="contact_number"
                                        value={form.data.contact_number}
                                        onChange={(e) => form.setData('contact_number', e.target.value)}
                                        placeholder="09xx xxx xxxx"
                                    />
                                    <InputError message={form.errors.contact_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Birth date</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={form.data.birth_date}
                                        onChange={(e) => form.setData('birth_date', e.target.value)}
                                    />
                                    <InputError message={form.errors.birth_date} />
                                </div>
                                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                                    <Label htmlFor="address">Complete address</Label>
                                    <textarea
                                        id="address"
                                        className="border-input min-h-20 w-full rounded-md border bg-white px-3 py-2 text-sm"
                                        value={form.data.address}
                                        onChange={(e) => form.setData('address', e.target.value)}
                                    />
                                    <InputError message={form.errors.address} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school">School or university</Label>
                                    <Input id="school" value={form.data.school} onChange={(e) => form.setData('school', e.target.value)} />
                                    <InputError message={form.errors.school} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course or program</Label>
                                    <Input id="course" value={form.data.course} onChange={(e) => form.setData('course', e.target.value)} />
                                    <InputError message={form.errors.course} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="graduation_year">Graduation year</Label>
                                    <Input
                                        id="graduation_year"
                                        type="number"
                                        min="1950"
                                        max="2100"
                                        value={form.data.graduation_year}
                                        onChange={(e) => form.setData('graduation_year', e.target.value)}
                                    />
                                    <InputError message={form.errors.graduation_year} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={form.processing}>
                                    <Save className="size-4" /> Save changes
                                </Button>
                                <Transition
                                    show={form.recentlySuccessful}
                                    enter="transition"
                                    enterFrom="opacity-0"
                                    leave="transition"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm font-medium text-emerald-700">Profile saved.</p>
                                </Transition>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </SettingsLayout>
        </AppLayout>
    );
}
