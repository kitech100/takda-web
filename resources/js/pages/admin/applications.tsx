import { Head } from '@inertiajs/react';
import {
    AdminApplicationsView
    
    
} from '@/components/takda/admin-ui';
import type {ApplicationRow, Pagination} from '@/components/takda/admin-ui';

export default function AdminApplications({
    applications,
    filters,
}: {
    applications: Pagination<ApplicationRow>;
    filters: { search: string; status: string };
}) {
    return (
        <>
            <Head title="Business Applications" />
            <AdminApplicationsView
                applications={applications}
                filters={filters}
            />
        </>
    );
}
