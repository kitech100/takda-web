import { Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Clock3,
    Eye,
    ServerCog,
    Store,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
    MetricCard,
    PortalHeader,
    PortalPage,
    PrimaryButton,
    StatusBadge,
    TakdaPanel,
} from '@/components/takda/portal-ui';
import { Button } from '@/components/ui/button';

export type ApplicationRow = {
    id: string;
    business: string;
    category: string;
    owner: string;
    ownerEmail: string;
    submittedAt: string | null;
    status: string;
};
export type Pagination<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type ReviewApplication = ApplicationRow & {
    email: string;
    phone: string | null;
    description: string | null;
    registrationNumber: string | null;
    location: { address: string; phone: string; timezone: string } | null;
    reviewNotes: string | null;
};
export type BusinessRow = {
    id: string;
    name: string;
    owner: string | null;
    email: string | null;
    status: string;
    locations: number;
    staff: number;
    appointments: number;
    createdAt: string;
};

function formatDate(value: string | null): string {
    return value
        ? new Intl.DateTimeFormat('en-PH', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : 'Draft';
}
function statusLabel(status: string): string {
    return status
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminDashboardView({
    metrics,
    applications,
    businessHealth,
}: {
    metrics: {
        pendingApplications: number;
        approvedBusinesses: number;
        activeCustomers: number;
        monthlyBookings: number;
    };
    applications: ApplicationRow[];
    businessHealth: { approved: number; pending: number; needsChanges: number };
}) {
    return (
        <PortalPage>
            <PortalHeader
                title="Platform Overview"
                description="Live onboarding and activity across Takda"
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Pending applications"
                    value={metrics.pendingApplications}
                    accent="amber"
                />
                <MetricCard
                    label="Approved businesses"
                    value={metrics.approvedBusinesses}
                />
                <MetricCard
                    label="Active customers"
                    value={metrics.activeCustomers}
                    accent="blue"
                />
                <MetricCard
                    label="Bookings this month"
                    value={metrics.monthlyBookings}
                    accent="coral"
                />
            </div>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                <TakdaPanel className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#dde7e3] p-5 dark:border-[#25413a]">
                        <div>
                            <h2 className="font-extrabold">
                                Recent applications
                            </h2>
                            <p className="text-xs text-[#64736f]">
                                Businesses awaiting review
                            </p>
                        </div>
                        <Button variant="ghost" asChild>
                            <Link href="/platform-admin/applications">
                                View all <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left text-xs">
                            <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                                <tr>
                                    {[
                                        'Business',
                                        'Category',
                                        'Owner',
                                        'Submitted',
                                        'Status',
                                        '',
                                    ].map((column) => (
                                        <th key={column} className="px-4 py-3">
                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dde7e3] dark:divide-[#25413a]">
                                {applications.map((application) => (
                                    <tr key={application.id}>
                                        <td className="px-4 py-4 font-bold">
                                            {application.business}
                                        </td>
                                        <td className="px-4 py-4">
                                            {application.category}
                                        </td>
                                        <td className="px-4 py-4">
                                            {application.owner}
                                        </td>
                                        <td className="px-4 py-4">
                                            {formatDate(
                                                application.submittedAt,
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge
                                                status={statusLabel(
                                                    application.status,
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/platform-admin/applications/${application.id}`}
                                                    aria-label={`Review ${application.business}`}
                                                >
                                                    <Eye />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!applications.length && (
                        <p className="p-8 text-center text-sm text-[#64736f]">
                            No applications submitted yet.
                        </p>
                    )}
                </TakdaPanel>
                <TakdaPanel className="h-fit p-5">
                    <h2 className="font-extrabold">Application health</h2>
                    <div className="mt-5 space-y-4">
                        {[
                            ['Approved', businessHealth.approved, '#0f766e'],
                            ['Pending', businessHealth.pending, '#f4b740'],
                            [
                                'Needs changes',
                                businessHealth.needsChanges,
                                '#f97360',
                            ],
                        ].map(([label, value, color]) => (
                            <div key={String(label)}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span>{label}</span>
                                    <strong>{value}</strong>
                                </div>
                                <div className="h-2 rounded-full bg-[#e7efed] dark:bg-[#25413a]">
                                    <div
                                        className="h-full min-w-1 rounded-full"
                                        style={{
                                            width: `${Math.min(100, Number(value) * 10)}%`,
                                            backgroundColor: String(color),
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </TakdaPanel>
            </div>
        </PortalPage>
    );
}

export function AdminApplicationsView({
    applications,
    filters,
}: {
    applications: Pagination<ApplicationRow>;
    filters: { search: string; status: string };
}) {
    const [search, setSearch] = useState(filters.search);
    function apply(event: FormEvent): void {
        event.preventDefault();
        router.get(
            '/platform-admin/applications',
            { search, status: filters.status },
            { preserveState: true },
        );
    }

    return (
        <PortalPage>
            <PortalHeader
                title="Business Applications"
                description="Review and process businesses requesting access"
            />
            <TakdaPanel className="overflow-hidden">
                <form
                    onSubmit={apply}
                    className="flex gap-3 border-b border-[#dde7e3] p-4 dark:border-[#25413a]"
                >
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by business..."
                        className="h-9 flex-1 rounded-lg border border-[#dde7e3] bg-[#f7faf9] px-3 text-sm dark:border-[#2d4942] dark:bg-[#172a26]"
                    />
                    <select
                        value={filters.status}
                        onChange={(event) =>
                            router.get(
                                '/platform-admin/applications',
                                { search, status: event.target.value },
                                { preserveState: true },
                            )
                        }
                        className="rounded-lg border border-[#dde7e3] bg-white px-3 text-xs dark:border-[#2d4942] dark:bg-[#172a26]"
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under review</option>
                        <option value="approved">Approved</option>
                        <option value="needs_changes">Needs changes</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-xs">
                        <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                            <tr>
                                {[
                                    'Business',
                                    'Category',
                                    'Owner',
                                    'Submitted',
                                    'Status',
                                    'Actions',
                                ].map((column) => (
                                    <th key={column} className="px-4 py-3">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dde7e3] dark:divide-[#25413a]">
                            {applications.data.map((application) => (
                                <tr key={application.id}>
                                    <td className="px-4 py-4 font-bold">
                                        {application.business}
                                    </td>
                                    <td className="px-4 py-4">
                                        {application.category}
                                    </td>
                                    <td className="px-4 py-4">
                                        {application.owner}
                                        <p className="text-[10px] text-[#64736f]">
                                            {application.ownerEmail}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        {formatDate(application.submittedAt)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge
                                            status={statusLabel(
                                                application.status,
                                            )}
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/platform-admin/applications/${application.id}`}
                                            >
                                                <Eye /> Review
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between border-t border-[#dde7e3] p-4 text-xs dark:border-[#25413a]">
                    <span>{applications.total} applications</span>
                    <div className="flex gap-2">
                        {applications.prev_page_url && (
                            <Button size="sm" variant="outline" asChild>
                                <Link href={applications.prev_page_url}>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {applications.next_page_url && (
                            <Button size="sm" variant="outline" asChild>
                                <Link href={applications.next_page_url}>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </TakdaPanel>
        </PortalPage>
    );
}

export function AdminReviewView({
    application,
}: {
    application: ReviewApplication;
}) {
    const [notes, setNotes] = useState(application.reviewNotes ?? '');
    function decide(decision: string): void {
        router.patch(`/platform-admin/applications/${application.id}`, {
            decision,
            review_notes: notes,
        });
    }

    return (
        <PortalPage>
            <PortalHeader
                title="Review Application"
                description={`${application.business} • Submitted ${formatDate(application.submittedAt)}`}
                actions={
                    <StatusBadge status={statusLabel(application.status)} />
                }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
                <div className="space-y-5">
                    <TakdaPanel className="p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-xl bg-[#edf5f3] font-extrabold text-[#0f766e] dark:bg-[#1d3832]">
                                {application.business.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                                <h2 className="text-lg font-extrabold">
                                    {application.business}
                                </h2>
                                <p className="text-xs text-[#64736f]">
                                    {application.category}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-5 border-t border-[#edf2f0] pt-5 sm:grid-cols-2 dark:border-[#25413a]">
                            {[
                                ['Owner', application.owner],
                                ['Work email', application.email],
                                ['Phone', application.phone ?? '—'],
                                [
                                    'Registration no.',
                                    application.registrationNumber ??
                                        'Not supplied',
                                ],
                                [
                                    'Main location',
                                    application.location?.address ?? '—',
                                ],
                                [
                                    'Timezone',
                                    application.location?.timezone ?? '—',
                                ],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-[10px] font-bold text-[#64736f] uppercase">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </TakdaPanel>
                    <TakdaPanel className="p-6">
                        <h2 className="font-extrabold">Business description</h2>
                        <p className="mt-3 text-sm leading-6 text-[#64736f]">
                            {application.description ||
                                'No description was supplied.'}
                        </p>
                    </TakdaPanel>
                    <TakdaPanel className="p-6">
                        <h2 className="font-extrabold">
                            Application checklist
                        </h2>
                        <div className="mt-4 space-y-3">
                            {[
                                'Owner identity and contact',
                                'Business location',
                                'Service category',
                                'Opening hours',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-lg border border-[#dde7e3] p-3 text-xs font-semibold dark:border-[#2d4942]"
                                >
                                    <span className="grid size-7 place-items-center rounded-full bg-[#e4f8ef] text-[#07845f]">
                                        <Check className="size-4" />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </TakdaPanel>
                </div>
                <TakdaPanel className="h-fit p-5 xl:sticky xl:top-5">
                    <h2 className="font-extrabold">Review decision</h2>
                    <p className="mt-1 text-xs text-[#64736f]">
                        Approving activates the business workspace.
                    </p>
                    <label
                        className="mt-5 block text-xs font-bold"
                        htmlFor="review-notes"
                    >
                        Review notes
                    </label>
                    <textarea
                        id="review-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="mt-2 min-h-28 w-full rounded-lg border border-[#dde7e3] bg-transparent p-3 text-sm dark:border-[#2d4942]"
                    />
                    <div className="mt-5 space-y-2">
                        <PrimaryButton
                            className="w-full"
                            onClick={() => decide('approved')}
                        >
                            Approve Application
                        </PrimaryButton>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={!notes.trim()}
                            onClick={() => decide('needs_changes')}
                        >
                            <Clock3 /> Request Changes
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-[#dc554b]"
                            disabled={!notes.trim()}
                            onClick={() => decide('rejected')}
                        >
                            Reject Application
                        </Button>
                    </div>
                </TakdaPanel>
            </div>
        </PortalPage>
    );
}

export function AdminBusinessesView({
    businesses,
}: {
    businesses: Pagination<BusinessRow>;
}) {
    return (
        <PortalPage>
            <PortalHeader
                title="Businesses"
                description="Manage every business workspace on Takda"
            />
            <TakdaPanel className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-xs">
                        <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                            <tr>
                                {[
                                    'Business',
                                    'Owner',
                                    'Locations',
                                    'Staff',
                                    'Bookings',
                                    'Status',
                                ].map((column) => (
                                    <th key={column} className="px-4 py-3">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dde7e3] dark:divide-[#25413a]">
                            {businesses.data.map((business) => (
                                <tr key={business.id}>
                                    <td className="px-4 py-4 font-bold">
                                        {business.name}
                                        <p className="text-[10px] font-normal text-[#64736f]">
                                            Since{' '}
                                            {formatDate(business.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        {business.owner}
                                        <p className="text-[10px] text-[#64736f]">
                                            {business.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        {business.locations}
                                    </td>
                                    <td className="px-4 py-4">
                                        {business.staff}
                                    </td>
                                    <td className="px-4 py-4">
                                        {business.appointments}
                                    </td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={business.status}
                                            onChange={(event) =>
                                                router.patch(
                                                    `/platform-admin/businesses/${business.id}/status`,
                                                    {
                                                        status: event.target
                                                            .value,
                                                    },
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className="rounded-md border border-[#dde7e3] bg-transparent px-2 py-1 dark:border-[#2d4942]"
                                        >
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="pending_approval">
                                                Pending approval
                                            </option>
                                            <option value="draft">Draft</option>
                                            <option value="suspended">
                                                Suspended
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TakdaPanel>
        </PortalPage>
    );
}

export function AdminSettingsView({
    system,
}: {
    system: {
        appName: string;
        environment: string;
        queue: string;
        cache: string;
        mail: string;
        users: number;
    };
}) {
    return (
        <PortalPage>
            <PortalHeader
                title="Platform Settings"
                description="Runtime configuration and service health"
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                    ['Application', system.appName, Store],
                    ['Environment', system.environment, ServerCog],
                    ['Users', String(system.users), Users],
                    ['Queue', system.queue, Clock3],
                    ['Cache', system.cache, Check],
                    ['Mail', system.mail, Check],
                ].map(([label, value, Icon]) => {
                    const Component = Icon as typeof Store;

                    return (
                        <TakdaPanel key={String(label)} className="p-5">
                            <Component className="size-5 text-[#0f766e]" />
                            <p className="mt-4 text-xs text-[#64736f]">
                                {label as string}
                            </p>
                            <p className="mt-1 text-lg font-extrabold">
                                {value as string}
                            </p>
                        </TakdaPanel>
                    );
                })}
            </div>
        </PortalPage>
    );
}
