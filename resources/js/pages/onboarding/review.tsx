import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Check, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import type { FormEvent } from 'react';
import OnboardingProgress from '@/components/takda/onboarding-progress';
import { PrimaryButton, TakdaPanel } from '@/components/takda/portal-ui';
import { Button } from '@/components/ui/button';

type Details = {
    name: string;
    description: string;
    email: string;
    phone: string;
    category: string;
};
type Location = {
    name: string;
    address_line_1: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    timezone: string;
    opening_hours: Array<{
        day: number;
        enabled: boolean;
        opens: string | null;
        closes: string | null;
    }>;
};
function ReviewRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Building2;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-[#edf5f3] text-[#0f766e] dark:bg-[#1d3832]">
                <Icon className="size-4" />
            </span>
            <div>
                <p className="text-[10px] font-bold text-[#64736f] uppercase">
                    {label}
                </p>
                <p className="text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
}

export default function OnboardingReview({
    details,
    location,
}: {
    details: Details;
    location: Location;
}) {
    const form = useForm({});
    function submit(event: FormEvent): void {
        event.preventDefault();
        form.post('/onboarding/review');
    }

    return (
        <>
            <Head title="Review your business" />
            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <OnboardingProgress current={3} />
                <div className="mb-7 text-center">
                    <h1 className="text-2xl font-extrabold">
                        Review and submit your workspace
                    </h1>
                    <p className="mt-1 text-sm text-[#64736f]">
                        The Takda platform team will review this application.
                    </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                    <TakdaPanel className="p-6">
                        <div className="mb-5 flex justify-between">
                            <h2 className="font-extrabold">Business details</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/onboarding">Edit</Link>
                            </Button>
                        </div>
                        <div className="space-y-5">
                            <ReviewRow
                                icon={Building2}
                                label="Business"
                                value={details.name}
                            />
                            <ReviewRow
                                icon={Mail}
                                label="Email"
                                value={details.email}
                            />
                            <ReviewRow
                                icon={Phone}
                                label="Phone"
                                value={details.phone}
                            />
                            <ReviewRow
                                icon={Check}
                                label="Category"
                                value={details.category}
                            />
                        </div>
                    </TakdaPanel>
                    <TakdaPanel className="p-6">
                        <div className="mb-5 flex justify-between">
                            <h2 className="font-extrabold">Main location</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/onboarding/location">Edit</Link>
                            </Button>
                        </div>
                        <div className="space-y-5">
                            <ReviewRow
                                icon={MapPin}
                                label="Address"
                                value={[
                                    location.address_line_1,
                                    location.city,
                                    location.province,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            />
                            <ReviewRow
                                icon={Phone}
                                label="Phone"
                                value={location.phone}
                            />
                            <ReviewRow
                                icon={Clock3}
                                label="Timezone"
                                value={location.timezone}
                            />
                        </div>
                    </TakdaPanel>
                </div>
                <TakdaPanel className="mt-5 flex gap-3 border-[#b8ded8] bg-[#edf8f5] p-4 dark:bg-[#12312b]">
                    <span className="grid size-7 place-items-center rounded-full bg-[#0f766e] text-white">
                        <Check className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-bold">
                            Your workspace will be available immediately
                        </p>
                        <p className="mt-1 text-xs text-[#64736f]">
                            You can configure services and staff while the
                            platform administrator reviews your application.
                        </p>
                    </div>
                </TakdaPanel>
                <form onSubmit={submit} className="mt-6 flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/onboarding/location">Back</Link>
                    </Button>
                    <PrimaryButton type="submit" disabled={form.processing}>
                        Submit Application
                    </PrimaryButton>
                </form>
            </main>
        </>
    );
}
