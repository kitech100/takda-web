import { router } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Clock3,
    Download,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Save,
    Settings2,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Option = { id: string; name: string };

export type AppointmentItem = {
    id: string;
    reference: string;
    customer: string;
    customerId: string;
    service: string;
    serviceId: string;
    staff: string;
    staffId: string;
    location: string;
    locationId: string;
    status: string;
    paymentStatus: string;
    startsAt: string;
    endsAt: string;
    durationMinutes: number;
    priceMinor: number;
    notes?: string | null;
};

type AppointmentData = {
    appointments: AppointmentItem[];
    customers: Array<Option & { phone?: string | null; email: string }>;
    services: Array<
        Option & {
            durationMinutes: number;
            priceMinor: number;
            staffIds: string[];
        }
    >;
    staff: Array<Option & { serviceIds: string[]; locationIds: string[] }>;
    locations: Array<Option & { timezone: string }>;
    statuses: Array<{ value: string; label: string }>;
};

type CustomerItem = {
    id: string;
    initials: string;
    name: string;
    phone: string | null;
    email: string;
    visits: number;
    lastVisit: string | null;
    notes: string | null;
    status: string;
};

type ServiceItem = {
    id: string;
    name: string;
    description: string | null;
    categoryId: string | null;
    category: string;
    durationMinutes: number;
    priceMinor: number;
    bufferMinutes: number;
    isVisible: boolean;
};

type StaffItem = {
    id: string;
    initials: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
    isBookable: boolean;
    services: Option[];
    locations: Option[];
};

type LocationItem = {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    address: string;
    addressLine1: string;
    city: string;
    province: string | null;
    postalCode: string | null;
    timezone: string;
    openingHours: Array<{
        day: number;
        enabled: boolean;
        opens: string | null;
        closes: string | null;
    }> | null;
    isActive: boolean;
};

function formatMoney(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value / 100);
}

function formatDate(value?: string | null, includeTime = false): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat(
        'en-PH',
        includeTime
            ? { dateStyle: 'medium', timeStyle: 'short' }
            : { dateStyle: 'medium' },
    ).format(new Date(value));
}

function Modal({
    title,
    description,
    onClose,
    children,
    footer,
}: {
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <TakdaPanel className="my-6 w-full max-w-xl shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#dde7e3] p-5 dark:border-[#25413a]">
                    <div>
                        <h2 className="text-lg font-extrabold">{title}</h2>
                        {description && (
                            <p className="mt-1 text-xs text-[#64736f] dark:text-[#9fb2ad]">
                                {description}
                            </p>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Close ${title}`}
                        onClick={onClose}
                    >
                        <X />
                    </Button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-5">
                    {children}
                </div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-[#dde7e3] p-4 dark:border-[#25413a]">
                        {footer}
                    </div>
                )}
            </TakdaPanel>
        </div>
    );
}

function NativeSelect({
    label,
    value,
    onChange,
    children,
    required = true,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <select
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-[#dde7e3] bg-white px-3 text-sm outline-none focus:border-[#0f766e] dark:border-[#2d4942] dark:bg-[#172a26]"
            >
                {children}
            </select>
        </div>
    );
}

function submit(
    method: 'post' | 'patch' | 'delete',
    url: string,
    data: NonNullable<Parameters<typeof router.post>[1]> = {},
    onSuccess?: () => void,
): void {
    if (method === 'post') {
        router.post(url, data, { preserveScroll: true, onSuccess });
    } else if (method === 'patch') {
        router.patch(url, data, { preserveScroll: true, onSuccess });
    } else {
        router.delete(url, { data, preserveScroll: true, onSuccess });
    }
}

function AppointmentDrawer({
    data,
    onClose,
}: {
    data: AppointmentData;
    onClose: () => void;
}) {
    const [customerId, setCustomerId] = useState(data.customers[0]?.id ?? '');
    const [locationId, setLocationId] = useState(data.locations[0]?.id ?? '');
    const [serviceId, setServiceId] = useState(data.services[0]?.id ?? '');
    const [staffId, setStaffId] = useState('');
    const [startsAt, setStartsAt] = useState(() => {
        const date = new Date(Date.now() + 86400000);
        date.setMinutes(0, 0, 0);

        return date.toISOString().slice(0, 16);
    });
    const [notes, setNotes] = useState('');
    const validStaff = data.staff.filter(
        (staff) =>
            staff.serviceIds.includes(serviceId) &&
            staff.locationIds.includes(locationId),
    );
    const service = data.services.find((item) => item.id === serviceId);

    function create(event: FormEvent): void {
        event.preventDefault();
        submit(
            'post',
            '/business/appointments',
            {
                customer_id: customerId,
                location_id: locationId,
                service_id: serviceId,
                staff_id: staffId || validStaff[0]?.id,
                starts_at: new Date(startsAt).toISOString(),
                notes,
            },
            onClose,
        );
    }

    return (
        <Modal
            title="New Appointment"
            description="Reserve a real slot for your customer"
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <PrimaryButton
                        type="submit"
                        form="appointment-form"
                        disabled={
                            !customerId ||
                            !serviceId ||
                            !locationId ||
                            !(staffId || validStaff[0]?.id)
                        }
                    >
                        Create Appointment
                    </PrimaryButton>
                </>
            }
        >
            <form id="appointment-form" onSubmit={create} className="space-y-4">
                <NativeSelect
                    label="Customer"
                    value={customerId}
                    onChange={setCustomerId}
                >
                    {data.customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name} · {customer.email}
                        </option>
                    ))}
                </NativeSelect>
                <div className="grid gap-4 sm:grid-cols-2">
                    <NativeSelect
                        label="Location"
                        value={locationId}
                        onChange={(value) => {
                            setLocationId(value);
                            setStaffId('');
                        }}
                    >
                        {data.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect
                        label="Service"
                        value={serviceId}
                        onChange={(value) => {
                            setServiceId(value);
                            setStaffId('');
                        }}
                    >
                        {data.services.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} · {formatMoney(item.priceMinor)}
                            </option>
                        ))}
                    </NativeSelect>
                </div>
                <NativeSelect
                    label="Staff member"
                    value={staffId || validStaff[0]?.id || ''}
                    onChange={setStaffId}
                >
                    {validStaff.length ? (
                        validStaff.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.name}
                            </option>
                        ))
                    ) : (
                        <option value="">No assigned staff available</option>
                    )}
                </NativeSelect>
                <div>
                    <Label htmlFor="starts-at">Date and time</Label>
                    <Input
                        id="starts-at"
                        type="datetime-local"
                        value={startsAt}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(event) => setStartsAt(event.target.value)}
                        className="mt-2"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="appointment-notes">Notes</Label>
                    <textarea
                        id="appointment-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="mt-2 min-h-20 w-full rounded-lg border border-[#dde7e3] bg-transparent p-3 text-sm outline-none focus:border-[#0f766e] dark:border-[#2d4942]"
                    />
                </div>
                {service && (
                    <div className="rounded-lg bg-[#f1f6f4] p-4 text-sm dark:bg-[#172a26]">
                        <p className="text-[10px] font-bold text-[#64736f] uppercase">
                            Appointment summary
                        </p>
                        <div className="mt-2 flex justify-between">
                            <span>
                                {service.name} ({service.durationMinutes} min)
                            </span>
                            <strong>{formatMoney(service.priceMinor)}</strong>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
}

export function CalendarView({ data }: { data: AppointmentData }) {
    const days = useMemo(
        () =>
            Array.from({ length: 7 }, (_, index) => {
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() + index);

                return date;
            }),
        [],
    );

    return (
        <PortalPage>
            <PortalHeader
                title="Calendar"
                description="Live seven-day appointment schedule"
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {days.map((day) => {
                    const rows = data.appointments.filter(
                        (appointment) =>
                            new Date(appointment.startsAt).toDateString() ===
                            day.toDateString(),
                    );

                    return (
                        <TakdaPanel
                            key={day.toISOString()}
                            className="min-h-48 overflow-hidden"
                        >
                            <div className="border-b border-[#dde7e3] bg-[#f7faf9] p-3 dark:border-[#25413a] dark:bg-[#172a26]">
                                <p className="text-xs font-bold text-[#64736f]">
                                    {day.toLocaleDateString('en-PH', {
                                        weekday: 'long',
                                    })}
                                </p>
                                <p className="font-extrabold">
                                    {day.toLocaleDateString('en-PH', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="space-y-2 p-3">
                                {rows.length ? (
                                    rows.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="rounded-lg border-l-4 border-[#0f766e] bg-[#f7faf9] p-3 text-xs dark:bg-[#172a26]"
                                        >
                                            <div className="flex justify-between gap-2">
                                                <strong>
                                                    {new Date(
                                                        appointment.startsAt,
                                                    ).toLocaleTimeString(
                                                        'en-PH',
                                                        {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </strong>
                                                <StatusBadge
                                                    status={appointment.status}
                                                />
                                            </div>
                                            <p className="mt-2 font-bold">
                                                {appointment.service}
                                            </p>
                                            <p className="text-[#64736f]">
                                                {appointment.customer} ·{' '}
                                                {appointment.staff}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-xs text-[#879590]">
                                        No appointments
                                    </p>
                                )}
                            </div>
                        </TakdaPanel>
                    );
                })}
            </div>
        </PortalPage>
    );
}

export function AppointmentsView({ data }: { data: AppointmentData }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rows = data.appointments.filter((appointment) =>
        [
            appointment.customer,
            appointment.service,
            appointment.staff,
            appointment.reference,
        ]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase()),
    );

    return (
        <PortalPage>
            <PortalHeader
                title="Appointments"
                description="Manage, schedule, and track customer sessions"
                actions={
                    <PrimaryButton onClick={() => setDrawerOpen(true)}>
                        <Plus /> New Appointment
                    </PrimaryButton>
                }
            />
            <TakdaPanel className="p-3">
                <div className="max-w-lg">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search bookings..."
                        className="h-9 w-full rounded-lg border border-[#dde7e3] bg-[#f7faf9] px-3 text-sm dark:border-[#2d4942] dark:bg-[#172a26]"
                    />
                </div>
            </TakdaPanel>
            <TakdaPanel className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left text-xs">
                        <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                            <tr>
                                {[
                                    'Date & time',
                                    'Customer',
                                    'Service',
                                    'Staff',
                                    'Amount',
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
                            {rows.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <strong>
                                            {formatDate(
                                                appointment.startsAt,
                                                true,
                                            )}
                                        </strong>
                                        <p className="text-[10px] text-[#64736f]">
                                            {appointment.reference}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        {appointment.customer}
                                    </td>
                                    <td className="px-4 py-3">
                                        {appointment.service}
                                        <p className="text-[10px] text-[#64736f]">
                                            {appointment.location}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {appointment.staff}
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        {formatMoney(appointment.priceMinor)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            aria-label={`Status for ${appointment.reference}`}
                                            value={appointment.status}
                                            onChange={(event) =>
                                                submit(
                                                    'patch',
                                                    `/business/appointments/${appointment.id}/status`,
                                                    {
                                                        status: event.target
                                                            .value,
                                                    },
                                                )
                                            }
                                            className="rounded-md border border-[#dde7e3] bg-transparent px-2 py-1 dark:border-[#2d4942]"
                                        >
                                            {data.statuses.map((status) => (
                                                <option
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Archive appointment"
                                            onClick={() =>
                                                submit(
                                                    'delete',
                                                    `/business/appointments/${appointment.id}`,
                                                )
                                            }
                                        >
                                            <Trash2 />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!rows.length && (
                    <p className="p-8 text-center text-sm text-[#64736f]">
                        No appointments found.
                    </p>
                )}
            </TakdaPanel>
            {drawerOpen && (
                <AppointmentDrawer
                    data={data}
                    onClose={() => setDrawerOpen(false)}
                />
            )}
        </PortalPage>
    );
}

function CustomerForm({
    customer,
    onClose,
}: {
    customer?: CustomerItem;
    onClose: () => void;
}) {
    const [name, setName] = useState(customer?.name ?? '');
    const [email, setEmail] = useState(customer?.email ?? '');
    const [phone, setPhone] = useState(customer?.phone ?? '');
    const [notes, setNotes] = useState(customer?.notes ?? '');
    function save(event: FormEvent): void {
        event.preventDefault();
        submit(
            customer ? 'patch' : 'post',
            customer
                ? `/business/customers/${customer.id}`
                : '/business/customers',
            { name, email, phone, notes },
            onClose,
        );
    }

    return (
        <Modal
            title={customer ? 'Edit Customer' : 'Add Customer'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <PrimaryButton type="submit" form="customer-form">
                        Save Customer
                    </PrimaryButton>
                </>
            }
        >
            <form id="customer-form" onSubmit={save} className="space-y-4">
                <div>
                    <Label htmlFor="customer-name">Full name</Label>
                    <Input
                        id="customer-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2"
                        required
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="customer-email">Email</Label>
                        <Input
                            id="customer-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-2"
                            required
                            disabled={Boolean(customer)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="customer-phone">Phone</Label>
                        <Input
                            id="customer-phone"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            className="mt-2"
                            required
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="customer-notes">Internal notes</Label>
                    <textarea
                        id="customer-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="mt-2 min-h-24 w-full rounded-lg border border-[#dde7e3] bg-transparent p-3 text-sm dark:border-[#2d4942]"
                    />
                </div>
            </form>
        </Modal>
    );
}

export function CustomersView({
    data,
}: {
    data: { customers: CustomerItem[] };
}) {
    const [editing, setEditing] = useState<CustomerItem | 'new' | null>(null);

    return (
        <PortalPage>
            <PortalHeader
                title="Customers"
                description="Profiles, visit history, and internal notes"
                actions={
                    <PrimaryButton onClick={() => setEditing('new')}>
                        <UserPlus /> Add Customer
                    </PrimaryButton>
                }
            />
            <TakdaPanel className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-xs">
                        <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                            <tr>
                                {[
                                    'Customer',
                                    'Phone',
                                    'Email',
                                    'Visits',
                                    'Last visit',
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
                            {data.customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <InitialsAvatar
                                                initials={customer.initials}
                                            />
                                            <strong>{customer.name}</strong>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {customer.phone}
                                    </td>
                                    <td className="px-4 py-3">
                                        {customer.email}
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        {customer.visits}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatDate(customer.lastVisit)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={customer.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${customer.name}`}
                                                onClick={() =>
                                                    setEditing(customer)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Archive ${customer.name}`}
                                                className="text-[#dc554b]"
                                                onClick={() =>
                                                    submit(
                                                        'delete',
                                                        `/business/archive/customer/${customer.id}`,
                                                    )
                                                }
                                            >
                                                <Archive />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!data.customers.length && (
                    <p className="p-8 text-center text-sm text-[#64736f]">
                        Add your first customer to begin booking.
                    </p>
                )}
            </TakdaPanel>
            {editing && (
                <CustomerForm
                    customer={editing === 'new' ? undefined : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </PortalPage>
    );
}

function ServiceForm({
    service,
    categories,
    onClose,
}: {
    service?: ServiceItem;
    categories: Option[];
    onClose: () => void;
}) {
    const [name, setName] = useState(service?.name ?? '');
    const [description, setDescription] = useState(service?.description ?? '');
    const [categoryId, setCategoryId] = useState(
        service?.categoryId ?? categories[0]?.id ?? '',
    );
    const [categoryName, setCategoryName] = useState('');
    const [price, setPrice] = useState(
        String((service?.priceMinor ?? 0) / 100),
    );
    const [duration, setDuration] = useState(
        String(service?.durationMinutes ?? 60),
    );
    const [buffer, setBuffer] = useState(String(service?.bufferMinutes ?? 10));
    function save(event: FormEvent): void {
        event.preventDefault();
        submit(
            service ? 'patch' : 'post',
            service ? `/business/services/${service.id}` : '/business/services',
            {
                name,
                description,
                category_id: categoryId || null,
                category_name: categoryName || null,
                price_minor: Math.round(Number(price) * 100),
                duration_minutes: Number(duration),
                buffer_minutes: Number(buffer),
                is_visible: service?.isVisible ?? true,
            },
            onClose,
        );
    }

    return (
        <Modal
            title={service ? 'Edit Service' : 'Add Service'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <PrimaryButton type="submit" form="service-form">
                        Save Service
                    </PrimaryButton>
                </>
            }
        >
            <form id="service-form" onSubmit={save} className="space-y-4">
                <div>
                    <Label>Service name</Label>
                    <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2"
                        required
                    />
                </div>
                <div>
                    <Label>Description</Label>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-2 min-h-20 w-full rounded-lg border border-[#dde7e3] bg-transparent p-3 text-sm dark:border-[#2d4942]"
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <NativeSelect
                        label="Category"
                        value={categoryId}
                        onChange={setCategoryId}
                        required={false}
                    >
                        <option value="">Create new category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </NativeSelect>
                    {!categoryId && (
                        <div>
                            <Label>New category</Label>
                            <Input
                                value={categoryName}
                                onChange={(event) =>
                                    setCategoryName(event.target.value)
                                }
                                className="mt-2"
                                required
                            />
                        </div>
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <Label>Price (PHP)</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            className="mt-2"
                            required
                        />
                    </div>
                    <div>
                        <Label>Duration</Label>
                        <Input
                            type="number"
                            min="5"
                            value={duration}
                            onChange={(event) =>
                                setDuration(event.target.value)
                            }
                            className="mt-2"
                            required
                        />
                    </div>
                    <div>
                        <Label>Buffer</Label>
                        <Input
                            type="number"
                            min="0"
                            value={buffer}
                            onChange={(event) => setBuffer(event.target.value)}
                            className="mt-2"
                            required
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export function ServicesView({
    data,
}: {
    data: {
        categories: Array<Option & { servicesCount: number }>;
        services: ServiceItem[];
    };
}) {
    const [editing, setEditing] = useState<ServiceItem | 'new' | null>(null);
    const [archiveTarget, setArchiveTarget] = useState<ServiceItem | null>(
        null,
    );

    return (
        <PortalPage>
            <PortalHeader
                title="Services"
                description="Create and organize services customers can book"
                actions={
                    <PrimaryButton onClick={() => setEditing('new')}>
                        <Plus /> Add Service
                    </PrimaryButton>
                }
            />
            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                <TakdaPanel className="h-fit p-3">
                    <p className="px-3 py-2 text-[10px] font-bold text-[#64736f] uppercase">
                        Categories
                    </p>
                    <div className="rounded-lg bg-[#ebf1f0] px-3 py-2 text-sm font-bold text-[#0f766e] dark:bg-[#1d3832]">
                        All services{' '}
                        <span className="float-right">
                            {data.services.length}
                        </span>
                    </div>
                    {data.categories.map((category) => (
                        <div key={category.id} className="px-3 py-2 text-sm">
                            {category.name}
                            <span className="float-right text-xs text-[#64736f]">
                                {category.servicesCount}
                            </span>
                        </div>
                    ))}
                </TakdaPanel>
                <TakdaPanel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                                <tr>
                                    {[
                                        'Service',
                                        'Category',
                                        'Duration',
                                        'Price',
                                        'Buffer',
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
                                {data.services.map((service) => (
                                    <tr key={service.id}>
                                        <td className="px-4 py-3 font-bold">
                                            {service.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {service.category}
                                        </td>
                                        <td className="px-4 py-3">
                                            {service.durationMinutes} min
                                        </td>
                                        <td className="px-4 py-3 font-bold">
                                            {formatMoney(service.priceMinor)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {service.bufferMinutes} min
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={
                                                    service.isVisible
                                                        ? 'Active'
                                                        : 'Hidden'
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${service.name}`}
                                                onClick={() =>
                                                    setEditing(service)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Archive ${service.name}`}
                                                className="text-[#dc554b]"
                                                onClick={() =>
                                                    setArchiveTarget(service)
                                                }
                                            >
                                                <Archive />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TakdaPanel>
            </div>
            {editing && (
                <ServiceForm
                    service={editing === 'new' ? undefined : editing}
                    categories={data.categories}
                    onClose={() => setEditing(null)}
                />
            )}
            {archiveTarget && (
                <Modal
                    title={`Archive ${archiveTarget.name}?`}
                    description="Existing appointments remain intact and this service can be restored later."
                    onClose={() => setArchiveTarget(null)}
                    footer={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setArchiveTarget(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#dc554b] text-white"
                                onClick={() =>
                                    submit(
                                        'delete',
                                        `/business/archive/service/${archiveTarget.id}`,
                                        {},
                                        () => setArchiveTarget(null),
                                    )
                                }
                            >
                                Archive Service
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm text-[#64736f]">
                        The service will immediately disappear from new booking
                        options.
                    </p>
                </Modal>
            )}
        </PortalPage>
    );
}

function StaffForm({
    staff,
    services,
    locations,
    onClose,
}: {
    staff?: StaffItem;
    services: Option[];
    locations: Option[];
    onClose: () => void;
}) {
    const [name, setName] = useState(staff?.name ?? '');
    const [title, setTitle] = useState(staff?.title ?? '');
    const [email, setEmail] = useState(staff?.email ?? '');
    const [phone, setPhone] = useState(staff?.phone ?? '');
    const [serviceIds, setServiceIds] = useState(
        staff?.services.map((item) => item.id) ??
            services.slice(0, 1).map((item) => item.id),
    );
    const [locationIds, setLocationIds] = useState(
        staff?.locations.map((item) => item.id) ??
            locations.slice(0, 1).map((item) => item.id),
    );
    const toggle = (
        values: string[],
        setValues: (values: string[]) => void,
        id: string,
    ) =>
        setValues(
            values.includes(id)
                ? values.filter((value) => value !== id)
                : [...values, id],
        );
    function save(event: FormEvent): void {
        event.preventDefault();
        submit(
            staff ? 'patch' : 'post',
            staff ? `/business/staff/${staff.id}` : '/business/staff',
            {
                name,
                title,
                email,
                phone,
                service_ids: serviceIds,
                location_ids: locationIds,
                is_bookable: staff?.isBookable ?? true,
            },
            onClose,
        );
    }

    return (
        <Modal
            title={staff ? 'Manage Staff' : 'Add Staff Member'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <PrimaryButton form="staff-form" type="submit">
                        Save Staff
                    </PrimaryButton>
                </>
            }
        >
            <form id="staff-form" onSubmit={save} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="mt-2"
                            required
                        />
                    </div>
                    <div>
                        <Label>Title</Label>
                        <Input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="mt-2"
                        />
                    </div>
                </div>
                {!staff && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                                className="mt-2"
                            />
                        </div>
                    </div>
                )}
                <div>
                    <Label>Services</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {services.map((service) => (
                            <button
                                type="button"
                                key={service.id}
                                onClick={() =>
                                    toggle(
                                        serviceIds,
                                        setServiceIds,
                                        service.id,
                                    )
                                }
                                className={cn(
                                    'rounded-lg border px-3 py-2 text-xs',
                                    serviceIds.includes(service.id) &&
                                        'border-[#0f766e] bg-[#edf8f5] text-[#0f766e]',
                                )}
                            >
                                {service.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <Label>Locations</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {locations.map((location) => (
                            <button
                                type="button"
                                key={location.id}
                                onClick={() =>
                                    toggle(
                                        locationIds,
                                        setLocationIds,
                                        location.id,
                                    )
                                }
                                className={cn(
                                    'rounded-lg border px-3 py-2 text-xs',
                                    locationIds.includes(location.id) &&
                                        'border-[#0f766e] bg-[#edf8f5] text-[#0f766e]',
                                )}
                            >
                                {location.name}
                            </button>
                        ))}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export function StaffView({
    data,
}: {
    data: { staff: StaffItem[]; services: Option[]; locations: Option[] };
}) {
    const [editing, setEditing] = useState<StaffItem | 'new' | null>(null);

    return (
        <PortalPage>
            <PortalHeader
                title="Staff"
                description="Manage team access, services, and availability"
                actions={
                    <PrimaryButton onClick={() => setEditing('new')}>
                        <UserPlus /> Add Staff Member
                    </PrimaryButton>
                }
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.staff.map((staff) => (
                    <TakdaPanel key={staff.id} className="p-5">
                        <div className="flex gap-3">
                            <InitialsAvatar
                                initials={staff.initials}
                                className="size-11"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between gap-2">
                                    <div>
                                        <h2 className="font-extrabold">
                                            {staff.name}
                                        </h2>
                                        <p className="text-xs text-[#64736f]">
                                            {staff.title}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        status={
                                            staff.isBookable
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 border-y border-[#edf2f0] py-4 text-xs dark:border-[#25413a]">
                            {staff.phone && (
                                <p className="flex gap-2">
                                    <Phone className="size-3.5" />
                                    {staff.phone}
                                </p>
                            )}
                            {staff.email && (
                                <p className="flex gap-2">
                                    <Mail className="size-3.5" />
                                    {staff.email}
                                </p>
                            )}
                            <p className="flex gap-2">
                                <MapPin className="size-3.5" />
                                {staff.locations
                                    .map((location) => location.name)
                                    .join(', ')}
                            </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {staff.services.map((service) => (
                                <span
                                    key={service.id}
                                    className="rounded bg-[#edf5f3] px-2 py-1 text-[10px] font-semibold text-[#0f766e] dark:bg-[#1d3832]"
                                >
                                    {service.name}
                                </span>
                            ))}
                        </div>
                        <div className="mt-5 flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setEditing(staff)}
                            >
                                <Pencil /> Manage
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Archive ${staff.name}`}
                                className="text-[#dc554b]"
                                onClick={() =>
                                    submit(
                                        'delete',
                                        `/business/archive/staff/${staff.id}`,
                                    )
                                }
                            >
                                <Archive />
                            </Button>
                        </div>
                    </TakdaPanel>
                ))}
            </div>
            {editing && (
                <StaffForm
                    staff={editing === 'new' ? undefined : editing}
                    services={data.services}
                    locations={data.locations}
                    onClose={() => setEditing(null)}
                />
            )}
        </PortalPage>
    );
}

function LocationForm({
    location,
    onClose,
}: {
    location?: LocationItem;
    onClose: () => void;
}) {
    const [name, setName] = useState(location?.name ?? '');
    const [email, setEmail] = useState(location?.email ?? '');
    const [phone, setPhone] = useState(location?.phone ?? '');
    const [address, setAddress] = useState(location?.addressLine1 ?? '');
    const [city, setCity] = useState(location?.city ?? '');
    const [province, setProvince] = useState(location?.province ?? '');
    const [postal, setPostal] = useState(location?.postalCode ?? '');
    const [timezone, setTimezone] = useState(
        location?.timezone ?? 'Asia/Manila',
    );
    function save(event: FormEvent): void {
        event.preventDefault();
        submit(
            location ? 'patch' : 'post',
            location
                ? `/business/locations/${location.id}`
                : '/business/locations',
            {
                name,
                email,
                phone,
                address_line_1: address,
                city,
                province,
                postal_code: postal,
                timezone,
                opening_hours: location?.openingHours ?? null,
                is_active: location?.isActive ?? true,
            },
            onClose,
        );
    }

    return (
        <Modal
            title={location ? 'Edit Location' : 'Add Location'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <PrimaryButton type="submit" form="location-form">
                        Save Location
                    </PrimaryButton>
                </>
            }
        >
            <form id="location-form" onSubmit={save} className="space-y-4">
                <div>
                    <Label>Name</Label>
                    <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2"
                        required
                    />
                </div>
                <div>
                    <Label>Street address</Label>
                    <Input
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        className="mt-2"
                        required
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <Label>City</Label>
                        <Input
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                            className="mt-2"
                            required
                        />
                    </div>
                    <div>
                        <Label>Province</Label>
                        <Input
                            value={province}
                            onChange={(event) =>
                                setProvince(event.target.value)
                            }
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <Label>Postal code</Label>
                        <Input
                            value={postal}
                            onChange={(event) => setPostal(event.target.value)}
                            className="mt-2"
                        />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label>Phone</Label>
                        <Input
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            className="mt-2"
                            required
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-2"
                        />
                    </div>
                </div>
                <div>
                    <Label>Timezone</Label>
                    <Input
                        value={timezone}
                        onChange={(event) => setTimezone(event.target.value)}
                        className="mt-2"
                        required
                    />
                </div>
            </form>
        </Modal>
    );
}

export function LocationsView({
    data,
}: {
    data: { locations: LocationItem[] };
}) {
    const [editing, setEditing] = useState<LocationItem | 'new' | null>(null);

    return (
        <PortalPage>
            <PortalHeader
                title="Locations"
                description="Manage branches, contact details, and operating hours"
                actions={
                    <PrimaryButton onClick={() => setEditing('new')}>
                        <Plus /> Add Location
                    </PrimaryButton>
                }
            />
            <div className="grid gap-5 xl:grid-cols-2">
                {data.locations.map((location) => (
                    <TakdaPanel key={location.id} className="p-5">
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold">
                                    {location.name}
                                </h2>
                                <StatusBadge
                                    status={
                                        location.isActive
                                            ? 'Active'
                                            : 'Inactive'
                                    }
                                />
                            </div>
                            <MapPin className="text-[#0f766e]" />
                        </div>
                        <div className="mt-5 space-y-3 text-sm">
                            <p className="flex gap-2">
                                <MapPin className="size-4 text-[#0f766e]" />
                                {location.address}
                            </p>
                            <p className="flex gap-2">
                                <Phone className="size-4 text-[#0f766e]" />
                                {location.phone}
                            </p>
                            <p className="flex gap-2">
                                <Clock3 className="size-4 text-[#0f766e]" />
                                {location.timezone}
                            </p>
                        </div>
                        <div className="mt-5 flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setEditing(location)}
                            >
                                <Pencil /> Edit Location
                            </Button>
                            <Button
                                variant="ghost"
                                aria-label={`Archive ${location.name}`}
                                className="text-[#dc554b]"
                                onClick={() =>
                                    submit(
                                        'delete',
                                        `/business/archive/location/${location.id}`,
                                    )
                                }
                            >
                                Archive
                            </Button>
                        </div>
                    </TakdaPanel>
                ))}
            </div>
            {editing && (
                <LocationForm
                    location={editing === 'new' ? undefined : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </PortalPage>
    );
}

export function AnalyticsView({
    data,
}: {
    data: {
        metrics: {
            totalAppointments: number;
            completionRate: number;
            revenueMinor: number;
            newCustomers: number;
            cancelled: number;
        };
        popularServices: Array<{ name: string; bookings: number }>;
        staffUtilization: Array<{ name: string; appointments: number }>;
    };
}) {
    const maxService = Math.max(
        1,
        ...data.popularServices.map((service) => service.bookings),
    );
    const maxStaff = Math.max(
        1,
        ...data.staffUtilization.map((staff) => staff.appointments),
    );

    return (
        <PortalPage>
            <PortalHeader
                title="Analytics"
                description="Live performance calculated from your booking records"
                actions={
                    <Button variant="outline">
                        <Download /> Export coming next
                    </Button>
                }
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Total appointments"
                    value={data.metrics.totalAppointments}
                    trend="Live"
                />
                <MetricCard
                    label="Completion rate"
                    value={`${data.metrics.completionRate}%`}
                    accent="blue"
                />
                <MetricCard
                    label="Gross revenue"
                    value={formatMoney(data.metrics.revenueMinor)}
                    accent="coral"
                />
                <MetricCard
                    label="New customers"
                    value={data.metrics.newCustomers}
                    accent="amber"
                />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
                <TakdaPanel className="p-5">
                    <h2 className="font-extrabold">Popular services</h2>
                    <div className="mt-5 space-y-4">
                        {data.popularServices.map((service) => (
                            <div key={service.name}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span>{service.name}</span>
                                    <strong>{service.bookings} bookings</strong>
                                </div>
                                <div className="h-2 rounded-full bg-[#e7efed] dark:bg-[#25413a]">
                                    <div
                                        className="h-full rounded-full bg-[#0f766e]"
                                        style={{
                                            width: `${(service.bookings / maxService) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </TakdaPanel>
                <TakdaPanel className="p-5">
                    <h2 className="font-extrabold">Staff activity</h2>
                    <div className="mt-5 space-y-4">
                        {data.staffUtilization.map((staff) => (
                            <div key={staff.name}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span>{staff.name}</span>
                                    <strong>{staff.appointments}</strong>
                                </div>
                                <div className="h-2 rounded-full bg-[#e7efed] dark:bg-[#25413a]">
                                    <div
                                        className="h-full rounded-full bg-[#47a89f]"
                                        style={{
                                            width: `${(staff.appointments / maxStaff) * 100}%`,
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

export function NotificationsView({
    data,
}: {
    data: {
        notifications: Array<{
            id: string;
            title: string;
            message: string;
            status: string;
            sentAt: string;
        }>;
    };
}) {
    return (
        <PortalPage>
            <PortalHeader
                title="Notifications"
                description="Appointment messages and delivery history"
            />
            <TakdaPanel className="divide-y divide-[#dde7e3] overflow-hidden dark:divide-[#25413a]">
                {data.notifications.map((notification) => (
                    <div key={notification.id} className="flex gap-4 p-4">
                        <span className="grid size-9 place-items-center rounded-full bg-[#edf5f3] text-[#0f766e] dark:bg-[#1d3832]">
                            <Mail className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-extrabold">
                                    {notification.title}
                                </h2>
                                <StatusBadge status={notification.status} />
                            </div>
                            <p className="mt-1 text-xs text-[#64736f]">
                                {notification.message}
                            </p>
                            <p className="mt-2 text-[10px] text-[#879590]">
                                {formatDate(notification.sentAt, true)}
                            </p>
                        </div>
                    </div>
                ))}
                {!data.notifications.length && (
                    <p className="p-8 text-center text-sm text-[#64736f]">
                        Notification delivery records will appear after booking
                        activity.
                    </p>
                )}
            </TakdaPanel>
        </PortalPage>
    );
}

export function ArchivedView({
    data,
}: {
    data: {
        records: Array<{
            id: string;
            type: string;
            name: string;
            archivedAt: string;
        }>;
    };
}) {
    return (
        <PortalPage>
            <PortalHeader
                title="Archived Records"
                description="Restore soft-deleted business records"
            />
            <TakdaPanel className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-xs">
                        <thead className="bg-[#f7faf9] text-[10px] font-bold text-[#64736f] uppercase dark:bg-[#172a26]">
                            <tr>
                                <th className="px-4 py-3">Record</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Archived on</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dde7e3] dark:divide-[#25413a]">
                            {data.records.map((record) => (
                                <tr key={`${record.type}-${record.id}`}>
                                    <td className="px-4 py-4 font-bold">
                                        {record.name}
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={record.type} />
                                    </td>
                                    <td className="px-4 py-4">
                                        {formatDate(record.archivedAt, true)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-[#0f766e]"
                                            onClick={() =>
                                                submit(
                                                    'patch',
                                                    `/business/restore/${record.type.toLowerCase()}/${record.id}`,
                                                )
                                            }
                                        >
                                            <ArchiveRestore /> Restore
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!data.records.length && (
                    <p className="p-8 text-center text-sm text-[#64736f]">
                        No archived records.
                    </p>
                )}
            </TakdaPanel>
        </PortalPage>
    );
}

type BookingSettings = {
    confirmationMode: string;
    slotIntervalMinutes: number;
    bookingHorizonDays: number;
    minimumNoticeMinutes: number;
    cancellationNoticeMinutes: number;
    reminderMinutes: number[];
};

export function BookingSettingsView({
    data,
}: {
    data: { settings: BookingSettings };
}) {
    const [settings, setSettings] = useState(data.settings);
    const update = <K extends keyof BookingSettings>(
        key: K,
        value: BookingSettings[K],
    ) => setSettings((current) => ({ ...current, [key]: value }));
    function save(event: FormEvent): void {
        event.preventDefault();
        submit('patch', '/business/settings/booking-rules', {
            confirmation_mode: settings.confirmationMode,
            slot_interval_minutes: settings.slotIntervalMinutes,
            booking_horizon_days: settings.bookingHorizonDays,
            minimum_notice_minutes: settings.minimumNoticeMinutes,
            cancellation_notice_minutes: settings.cancellationNoticeMinutes,
            reminder_minutes: settings.reminderMinutes,
        });
    }

    return (
        <PortalPage>
            <PortalHeader
                title="Booking Rules"
                description="Control how customers book, reschedule, and cancel"
                actions={
                    <PrimaryButton type="submit" form="booking-settings">
                        <Save /> Save Changes
                    </PrimaryButton>
                }
            />
            <form
                id="booking-settings"
                onSubmit={save}
                className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
            >
                <div className="space-y-5">
                    <TakdaPanel className="p-5">
                        <h2 className="font-extrabold">Booking window</h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Minimum notice (minutes)</Label>
                                <Input
                                    type="number"
                                    value={settings.minimumNoticeMinutes}
                                    onChange={(event) =>
                                        update(
                                            'minimumNoticeMinutes',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label>Book up to (days)</Label>
                                <Input
                                    type="number"
                                    value={settings.bookingHorizonDays}
                                    onChange={(event) =>
                                        update(
                                            'bookingHorizonDays',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </TakdaPanel>
                    <TakdaPanel className="p-5">
                        <h2 className="font-extrabold">Appointment defaults</h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <NativeSelect
                                label="Confirmation"
                                value={settings.confirmationMode}
                                onChange={(value) =>
                                    update('confirmationMode', value)
                                }
                            >
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual review</option>
                            </NativeSelect>
                            <NativeSelect
                                label="Slot interval"
                                value={String(settings.slotIntervalMinutes)}
                                onChange={(value) =>
                                    update('slotIntervalMinutes', Number(value))
                                }
                            >
                                {[5, 10, 15, 20, 30, 60].map((value) => (
                                    <option key={value} value={value}>
                                        {value} minutes
                                    </option>
                                ))}
                            </NativeSelect>
                            <div>
                                <Label>Cancellation notice</Label>
                                <Input
                                    type="number"
                                    value={settings.cancellationNoticeMinutes}
                                    onChange={(event) =>
                                        update(
                                            'cancellationNoticeMinutes',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </TakdaPanel>
                </div>
                <TakdaPanel className="h-fit p-5">
                    <span className="grid size-10 place-items-center rounded-lg bg-[#edf5f3] text-[#0f766e] dark:bg-[#1d3832]">
                        <Settings2 />
                    </span>
                    <h2 className="mt-4 font-extrabold">
                        Current customer policy
                    </h2>
                    <ul className="mt-4 space-y-2 text-xs text-[#64736f]">
                        <li>
                            • Book up to {settings.bookingHorizonDays} days
                            ahead
                        </li>
                        <li>
                            • Minimum {settings.minimumNoticeMinutes} minutes
                            notice
                        </li>
                        <li>
                            • {settings.cancellationNoticeMinutes} minutes
                            cancellation notice
                        </li>
                        <li>
                            •{' '}
                            {settings.confirmationMode === 'automatic'
                                ? 'Automatic confirmation'
                                : 'Manual approval'}
                        </li>
                    </ul>
                </TakdaPanel>
            </form>
        </PortalPage>
    );
}
