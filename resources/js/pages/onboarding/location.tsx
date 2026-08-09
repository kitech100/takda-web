import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import type { FormEvent } from 'react';
import OnboardingProgress from '@/components/takda/onboarding-progress';
import { PrimaryButton, TakdaPanel } from '@/components/takda/portal-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Hours = {
    day: number;
    enabled: boolean;
    opens: string | null;
    closes: string | null;
};
type Draft = {
    name: string;
    address_line_1: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    timezone: string;
    opening_hours: Hours[];
};
const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export default function OnboardingLocation({ draft }: { draft: Draft }) {
    const form = useForm<Draft>(draft);
    function setHour(
        index: number,
        key: keyof Hours,
        value: string | boolean,
    ): void {
        form.setData(
            'opening_hours',
            form.data.opening_hours.map((hour, hourIndex) =>
                hourIndex === index ? { ...hour, [key]: value } : hour,
            ),
        );
    }
    function submit(event: FormEvent): void {
        event.preventDefault();
        form.post('/onboarding/location');
    }

    return (
        <>
            <Head title="Set up your location" />
            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <OnboardingProgress current={2} />
                <div className="mb-7 text-center">
                    <h1 className="text-2xl font-extrabold">
                        Where can customers find you?
                    </h1>
                    <p className="mt-1 text-sm text-[#64736f]">
                        Add your main branch and regular opening hours.
                    </p>
                </div>
                <TakdaPanel>
                    <form onSubmit={submit}>
                        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label>Location name</Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Street address</Label>
                                    <Input
                                        value={form.data.address_line_1}
                                        onChange={(event) =>
                                            form.setData(
                                                'address_line_1',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2"
                                        required
                                    />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <Label>City</Label>
                                        <Input
                                            value={form.data.city}
                                            onChange={(event) =>
                                                form.setData(
                                                    'city',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Province</Label>
                                        <Input
                                            value={form.data.province}
                                            onChange={(event) =>
                                                form.setData(
                                                    'province',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>Postal</Label>
                                        <Input
                                            value={form.data.postal_code}
                                            onChange={(event) =>
                                                form.setData(
                                                    'postal_code',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label>Phone</Label>
                                        <Input
                                            value={form.data.phone}
                                            onChange={(event) =>
                                                form.setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Timezone</Label>
                                        <Input
                                            value={form.data.timezone}
                                            onChange={(event) =>
                                                form.setData(
                                                    'timezone',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label>Opening hours</Label>
                                <div className="mt-3 space-y-2">
                                    {form.data.opening_hours.map(
                                        (hour, index) => (
                                            <div
                                                key={hour.day}
                                                className="grid grid-cols-[85px_22px_1fr_1fr] items-center gap-2 text-xs"
                                            >
                                                <span className="font-semibold">
                                                    {dayNames[index]}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={hour.enabled}
                                                    onChange={(event) =>
                                                        setHour(
                                                            index,
                                                            'enabled',
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                />
                                                {hour.enabled ? (
                                                    <>
                                                        <Input
                                                            type="time"
                                                            value={
                                                                hour.opens ?? ''
                                                            }
                                                            onChange={(event) =>
                                                                setHour(
                                                                    index,
                                                                    'opens',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                        <Input
                                                            type="time"
                                                            value={
                                                                hour.closes ??
                                                                ''
                                                            }
                                                            onChange={(event) =>
                                                                setHour(
                                                                    index,
                                                                    'closes',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                    </>
                                                ) : (
                                                    <span className="col-span-2 text-[#879590]">
                                                        Closed
                                                    </span>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                        {Object.keys(form.errors).length > 0 && (
                            <p className="px-8 pb-3 text-xs text-red-600">
                                Please correct the highlighted location details.
                            </p>
                        )}
                        <div className="flex justify-between border-t border-[#dde7e3] p-5 dark:border-[#25413a]">
                            <Button variant="outline" asChild>
                                <Link href="/onboarding">Back</Link>
                            </Button>
                            <PrimaryButton
                                type="submit"
                                disabled={form.processing}
                            >
                                Continue to Review
                            </PrimaryButton>
                        </div>
                    </form>
                </TakdaPanel>
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#64736f]">
                    <MapPin className="size-4" /> Address details can be edited
                    later.
                </div>
            </main>
        </>
    );
}
