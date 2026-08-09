import { Head } from '@inertiajs/react';
import {
    AdminBusinessesView
    
    
} from '@/components/takda/admin-ui';
import type {BusinessRow, Pagination} from '@/components/takda/admin-ui';

export default function AdminBusinesses({
    businesses,
}: {
    businesses: Pagination<BusinessRow>;
}) {
    return (
        <>
            <Head title="Businesses" />
            <AdminBusinessesView businesses={businesses} />
        </>
    );
}
