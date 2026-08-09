import { Head } from '@inertiajs/react';
import {
    AdminDashboardView
    
} from '@/components/takda/admin-ui';
import type {ApplicationRow} from '@/components/takda/admin-ui';

type Props = {
    metrics: {
        pendingApplications: number;
        approvedBusinesses: number;
        activeCustomers: number;
        monthlyBookings: number;
    };
    applications: ApplicationRow[];
    businessHealth: { approved: number; pending: number; needsChanges: number };
};
export default function AdminDashboard(props: Props) {
    return (
        <>
            <Head title="Platform Admin" />
            <AdminDashboardView {...props} />
        </>
    );
}
