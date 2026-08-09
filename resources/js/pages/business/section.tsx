import { Head } from '@inertiajs/react';
import {
    AnalyticsView,
    AppointmentsView,
    ArchivedView,
    BookingSettingsView,
    CalendarView,
    CustomersView,
    LocationsView,
    NotificationsView,
    ServicesView,
    StaffView,
} from '@/components/takda/business-views';

type Props = {
    section: string;
    title: string;
    description: string;
    data: never;
};

export default function BusinessSection({ section, title, data }: Props) {
    return (
        <>
            <Head title={title} />
            {section === 'calendar' && <CalendarView data={data} />}
            {section === 'appointments' && <AppointmentsView data={data} />}
            {section === 'customers' && <CustomersView data={data} />}
            {section === 'services' && <ServicesView data={data} />}
            {section === 'staff' && <StaffView data={data} />}
            {section === 'locations' && <LocationsView data={data} />}
            {section === 'analytics' && <AnalyticsView data={data} />}
            {section === 'notifications' && <NotificationsView data={data} />}
            {section === 'archived' && <ArchivedView data={data} />}
            {section === 'settings' && <BookingSettingsView data={data} />}
        </>
    );
}
