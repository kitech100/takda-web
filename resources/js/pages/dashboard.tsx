import { Head, Link } from '@inertiajs/react';
import {
    CirclePlus,
    Clock3,
    MoveRight,
    Send,
    TriangleAlert,
} from 'lucide-react';
import {
    InitialsAvatar,
    MetricCard,
    PortalHeader,
    PortalPage,
    PrimaryButton,
    StatusBadge,
    TakdaPanel,
} from '@/components/takda/portal-ui';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type Appointment = {
    id: string;
    reference: string;
    customer: string;
    service: string;
    staff: string;
    location: string;
    status: string;
    startsAt: string;
};
type Props = {
    scope: string;
    business: {
        name: string;
        status: string;
        currency: string;
        timezone: string;
    } | null;
    metrics: {
        today: number;
        confirmed: number;
        pending: number;
        completed: number;
        noShow: number;
        revenueMinor: number;
    };
    upcoming: Appointment[];
};

export default function Dashboard({ business, metrics, upcoming }: Props) {
    const revenue = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: business?.currency ?? 'PHP',
    }).format(metrics.revenueMinor / 100);
    const staffActivity = Object.entries(
        upcoming.reduce<Record<string, number>>((totals, appointment) => {
            totals[appointment.staff] = (totals[appointment.staff] ?? 0) + 1;

            return totals;
        }, {}),
    ).slice(0, 3);

    return (
        <>
            <Head title="Overview" />
            <PortalPage>
                <PortalHeader
                    title={`Welcome to ${business?.name ?? 'Takda'}`}
                    description={new Intl.DateTimeFormat('en-PH', {
                        dateStyle: 'full',
                    }).format(new Date())}
                    actions={
                        <PrimaryButton asChild>
                            <Link href="/appointments">
                                <CirclePlus /> New Appointment
                            </Link>
                        </PrimaryButton>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Today's Appointments"
                        value={metrics.today}
                    />
                    <MetricCard
                        label="Confirmed"
                        value={metrics.confirmed}
                        accent="blue"
                    />
                    <MetricCard
                        label="Pending"
                        value={metrics.pending}
                        accent="amber"
                    />
                    <MetricCard label="Completed" value={metrics.completed} />
                </div>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.9fr)]">
                    <TakdaPanel className="p-5">
                        <div className="mb-4 flex justify-between">
                            <h2 className="font-bold">Upcoming Schedule</h2>
                            <Link
                                href="/calendar"
                                className="text-xs font-bold text-[#0f766e]"
                            >
                                View Calendar
                            </Link>
                        </div>
                        <div className="divide-y divide-[#dde7e3] border border-[#dde7e3] dark:divide-[#25413a] dark:border-[#25413a]">
                            {upcoming.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3"
                                >
                                    <span className="text-xs font-bold">
                                        {new Date(
                                            appointment.startsAt,
                                        ).toLocaleTimeString('en-PH', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">
                                            {appointment.service}
                                        </p>
                                        <p className="truncate text-xs text-[#64736f]">
                                            {appointment.customer} ·{' '}
                                            {appointment.staff}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge
                                            status={appointment.status}
                                        />
                                        <InitialsAvatar
                                            initials={appointment.staff
                                                .split(' ')
                                                .map((part) => part[0])
                                                .join('')
                                                .slice(0, 2)}
                                            className="size-7 text-[10px]"
                                        />
                                    </div>
                                </div>
                            ))}
                            {!upcoming.length && (
                                <p className="p-8 text-center text-sm text-[#64736f]">
                                    No upcoming appointments.
                                </p>
                            )}
                        </div>
                    </TakdaPanel>
                    <div className="grid gap-4">
                        <TakdaPanel className="p-5">
                            <p className="text-xs font-medium text-[#64736f]">
                                REVENUE TODAY
                            </p>
                            <p className="mt-5 text-[26px] font-extrabold">
                                {revenue}
                            </p>
                            <p className="mt-2 text-xs text-[#64736f]">
                                Completed appointments
                            </p>
                        </TakdaPanel>
                        <TakdaPanel className="p-5">
                            <p className="mb-4 text-xs font-medium text-[#64736f]">
                                UPCOMING STAFF ACTIVITY
                            </p>
                            {staffActivity.map(([name, value], index) => (
                                <div key={name} className="mb-3">
                                    <div className="mb-1 flex justify-between text-xs font-semibold">
                                        <span>{name}</span>
                                        <span>{value} bookings</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[#edf2f0] dark:bg-[#263832]">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.min(100, value * 20)}%`,
                                                backgroundColor: [
                                                    '#0f766e',
                                                    '#3b82f6',
                                                    '#f97360',
                                                ][index],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {!staffActivity.length && (
                                <p className="text-xs text-[#64736f]">
                                    No upcoming staff activity.
                                </p>
                            )}
                        </TakdaPanel>
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold text-[#64736f]">
                        QUICK ACTIONS
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/appointments">
                                <MoveRight /> Walk-in Booking
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/calendar">
                                <Clock3 /> Calendar
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/notifications">
                                <Send /> Delivery Log
                            </Link>
                        </Button>
                    </div>
                </div>
                {business?.status !== 'active' && (
                    <div className="flex justify-between gap-3 rounded-lg border border-[#f2c94c] bg-[#fff4c9] px-4 py-3 text-sm text-[#9a4f00] dark:bg-[#3f310d] dark:text-[#fcd34d]">
                        <span className="flex items-center gap-2">
                            <TriangleAlert className="size-4" />
                            Your application is{' '}
                            {business?.status.replaceAll('_', ' ')}.
                        </span>
                        <Link
                            href="/settings/booking-rules"
                            className="font-bold underline"
                        >
                            Review Settings
                        </Link>
                    </div>
                )}
            </PortalPage>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Overview', href: dashboard() }] };
