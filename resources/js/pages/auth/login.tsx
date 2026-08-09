import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { redirect as googleRedirect } from '@/routes/auth/google';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Sign in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-8"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[13px] leading-4 font-semibold text-[#172522] dark:text-[#e8f2ef]"
                                >
                                    Work Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@business.com"
                                    aria-invalid={Boolean(errors.email)}
                                    className="h-11 rounded-lg border-[#dde7e3] bg-white px-4 py-3 text-sm text-[#172522] shadow-none placeholder:text-[#64736f] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/15 aria-invalid:border-[#e11d48] aria-invalid:ring-[#e11d48]/10 dark:border-[#2d4942] dark:bg-[#172a26] dark:text-[#f3f8f6] dark:placeholder:text-[#849892] dark:focus-visible:border-[#5eead4] dark:focus-visible:ring-[#5eead4]/15"
                                />
                                <InputError
                                    message={errors.email}
                                    className="text-xs leading-4 text-[#e11d48] dark:text-[#e11d48]"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-[13px] leading-4 font-semibold text-[#172522] dark:text-[#e8f2ef]"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    toggleMode="label"
                                    aria-invalid={Boolean(errors.password)}
                                    className="h-11 rounded-lg border-[#dde7e3] bg-white px-4 py-3 text-sm text-[#172522] shadow-none placeholder:text-[#64736f] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/15 aria-invalid:border-[#e11d48] aria-invalid:ring-[#e11d48]/10 dark:border-[#2d4942] dark:bg-[#172a26] dark:text-[#f3f8f6] dark:placeholder:text-[#849892] dark:focus-visible:border-[#5eead4] dark:focus-visible:ring-[#5eead4]/15"
                                />
                                <InputError
                                    message={errors.password}
                                    className="text-xs leading-4 text-[#e11d48] dark:text-[#e11d48]"
                                />
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="w-fit text-[13px] leading-4 font-semibold text-[#0f766e] no-underline hover:text-[#115e59] hover:underline dark:text-[#5eead4] dark:hover:text-[#99f6e4]"
                                        tabIndex={3}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-[46px] w-full rounded-lg bg-[#0f766e] px-4 py-3.5 text-sm font-bold text-white shadow-none hover:bg-[#115e59] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/25"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && (
                                    <img
                                        src="/assets/figma/login-spinner.svg"
                                        alt=""
                                        className="size-4 animate-spin"
                                    />
                                )}
                                {processing ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/assets/figma/login-divider.svg"
                                    alt=""
                                    className="h-px min-w-0 flex-1 dark:opacity-20"
                                />
                                <span className="text-[13px] leading-4 text-[#64736f] dark:text-[#9fb2ad]">
                                    or
                                </span>
                                <img
                                    src="/assets/figma/login-divider.svg"
                                    alt=""
                                    className="h-px min-w-0 flex-1 dark:opacity-20"
                                />
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="h-[46px] w-full rounded-lg border-[#e2e8f0] bg-white px-4 py-3.5 text-sm font-semibold text-[#172522] shadow-none hover:bg-[#f7faf9] hover:text-[#172522] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/15 dark:border-[#2d4942] dark:bg-[#172a26] dark:text-[#e8f2ef] dark:hover:bg-[#203630] dark:hover:text-white dark:focus-visible:border-[#5eead4] dark:focus-visible:ring-[#5eead4]/15"
                            >
                                <a href={googleRedirect.url()} tabIndex={5}>
                                    <img
                                        src="/assets/figma/login-google.svg"
                                        alt=""
                                        className="size-[18px] dark:invert"
                                    />
                                    Continue with Google
                                </a>
                            </Button>
                        </div>

                        <p className="text-center text-[13px] leading-4 text-[#64736f] dark:text-[#9fb2ad]">
                            Don&apos;t have a business account?{' '}
                            <TextLink
                                href={register()}
                                className="font-semibold text-[#0f766e] no-underline hover:text-[#115e59] hover:underline dark:text-[#5eead4] dark:hover:text-[#99f6e4]"
                                tabIndex={6}
                            >
                                Register
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>

            {status && (
                <div className="text-center text-sm font-medium text-[#0f766e]">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Sign in to your business',
    description: 'Manage appointments, staff, and clients seamlessly',
};
