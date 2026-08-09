import { Head } from '@inertiajs/react';
import { AdminSettingsView } from '@/components/takda/admin-ui';

type System = {
    appName: string;
    environment: string;
    queue: string;
    cache: string;
    mail: string;
    users: number;
};
export default function AdminSettings({ system }: { system: System }) {
    return (
        <>
            <Head title="Platform Settings" />
            <AdminSettingsView system={system} />
        </>
    );
}
