import { Head, useForm } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import type { FormEvent } from 'react';
import OnboardingProgress from '@/components/takda/onboarding-progress';
import { PrimaryButton, TakdaPanel } from '@/components/takda/portal-ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Draft = {
    name: string;
    description: string;
    email: string;
    phone: string;
    category: string;
};

export default function OnboardingDetails({ draft }: { draft: Draft }) {
    const form = useForm<Draft>(draft);
    function submit(event: FormEvent): void {
        event.preventDefault();
        form.post('/onboarding');
    }

    return (
        <>
            <Head title="Set up your business" />
            <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <OnboardingProgress current={1} />
                <div className="mb-7 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#edf5f3] text-[#0f766e] dark:bg-[#1d3832]">
                        <Building2 />
                    </span>
                    <h1 className="mt-4 text-2xl font-extrabold">
                        Tell us about your business
                    </h1>
                    <p className="mt-1 text-sm text-[#64736f]">
                        This information appears in your Takda workspace and
                        application.
                    </p>
                </div>
                <TakdaPanel className="p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <Label>Business name</Label>
                            <Input
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="mt-2 h-11"
                                required
                            />
                            {form.errors.name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Description</Label>
                            <textarea
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 min-h-24 w-full rounded-lg border border-[#dde7e3] bg-transparent p-3 text-sm dark:border-[#2d4942]"
                                placeholder="What services do you offer?"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Business email</Label>
                                <Input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 h-11"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Business phone</Label>
                                <Input
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 h-11"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Business category</Label>
                            <select
                                value={form.data.category}
                                onChange={(event) =>
                                    form.setData('category', event.target.value)
                                }
                                className="mt-2 h-11 w-full rounded-lg border border-[#dde7e3] bg-white px-3 text-sm dark:border-[#2d4942] dark:bg-[#172a26]"
                            >
                                <option>Massage & Wellness</option>
                                <option>Beauty Salon</option>
                                <option>Spa</option>
                                <option>Barbershop</option>
                                <option>Skin Clinic</option>
                                <option>Nail Salon</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="flex justify-end border-t border-[#edf2f0] pt-5 dark:border-[#25413a]">
                            <PrimaryButton
                                type="submit"
                                disabled={form.processing}
                            >
                                Continue to Location
                            </PrimaryButton>
                        </div>
                    </form>
                </TakdaPanel>
            </main>
        </>
    );
}
