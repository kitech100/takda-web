import { Head } from '@inertiajs/react';
import {
    AdminReviewView
    
} from '@/components/takda/admin-ui';
import type {ReviewApplication} from '@/components/takda/admin-ui';

export default function AdminReview({
    application,
}: {
    application: ReviewApplication;
}) {
    return (
        <>
            <Head title="Review Application" />
            <AdminReviewView application={application} />
        </>
    );
}
