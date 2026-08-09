<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class GoogleAuthController extends Controller
{
    public function redirect(): SymfonyRedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        abort_unless($googleUser instanceof SocialiteUser, 422, 'Google returned an invalid profile.');

        $email = $googleUser->getEmail();
        $isVerified = (bool) (
            data_get($googleUser->user, 'email_verified')
            ?? data_get($googleUser->user, 'verified_email')
            ?? false
        );

        abort_unless($email && $isVerified, 422, 'Google did not provide a verified email address.');

        $user = DB::transaction(function () use ($googleUser, $email): User {
            $socialAccount = SocialAccount::withTrashed()
                ->where('provider', 'google')
                ->where('provider_user_id', $googleUser->getId())
                ->first();

            if ($socialAccount) {
                $linkedUser = User::withTrashed()->findOrFail($socialAccount->user_id);
                abort_if($linkedUser->trashed(), 403, 'This account is archived.');

                if ($socialAccount->trashed()) {
                    $socialAccount->restore();
                }

                return $linkedUser;
            }

            abort_if(User::onlyTrashed()->where('email', $email)->exists(), 403, 'This account is archived.');

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $googleUser->getName() ?: Str::before($email, '@'),
                    'password' => Str::password(40),
                    'avatar_path' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ],
            );

            if (! $user->email_verified_at) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            $user->socialAccounts()->create([
                'provider' => 'google',
                'provider_user_id' => $googleUser->getId(),
                'provider_email' => $email,
            ]);

            return $user;
        });

        Auth::login($user, remember: true);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
