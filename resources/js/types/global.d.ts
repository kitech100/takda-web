import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            workspace: {
                id: string;
                name: string;
                status: string;
                role: string;
                location: string | null;
                notificationCount: number;
            } | null;
            platform: {
                pendingApplications: number;
            } | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
