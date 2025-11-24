import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateAccountInvite } from '@/services/api/accountApi';
import { InviteValidation } from '@/types/auth';
import { useAuthStore } from '@/stores/authStore';

type InviteState = 'loading' | 'ready' | 'expired' | 'accepted' | 'invalid' | 'error';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const token = searchParams.get('token') ?? undefined;

  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [state, setState] = useState<InviteState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('invalid');
      setErrorMessage('Invitation token is missing from the link.');
      return;
    }

    let isMounted = true;
    setState('loading');
    setErrorMessage(null);

    validateAccountInvite(token)
      .then((data) => {
        if (!isMounted) return;
        setInvite(data);
        if (!data.is_valid) {
          if (data.status === 'accepted') {
            setState('accepted');
          } else if (data.is_expired) {
            setState('expired');
          } else {
            setState('invalid');
          }
          if (data.error) {
            setErrorMessage(data.error);
          }
        } else {
          setState('ready');
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setState('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to validate invitation. Please try again later.'
        );
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const inviteEmail = invite?.email ?? '';
  const accountName = invite?.account_name ?? 'this RestaurantIQ account';

  const registerSearch = useMemo(() => {
    if (!token || !inviteEmail) return '';
    const params = new URLSearchParams({ token, email: inviteEmail });
    if (invite?.account_name) {
      params.set('accountName', invite.account_name);
    }
    return params.toString();
  }, [invite?.account_name, inviteEmail, token]);

  const expiresAt = invite?.expires_at
    ? new Date(invite.expires_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />
      <div className="relative w-full max-w-xl space-y-6">
        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-white text-3xl font-bold">
              {state === 'ready' && <CheckCircle2 className="h-6 w-6 text-primary-500" />}
              {state === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-slate-300" />}
              {state !== 'ready' && state !== 'loading' && <AlertTriangle className="h-6 w-6 text-primary-500" />}
              Accept Invitation
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              {state === 'ready'
                ? 'Create your login or sign in with your invite email to finish joining the team.'
                : 'We’re checking the status of your invitation.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-slate-300">
            {state === 'loading' && (
              <div className="flex items-center gap-3 text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying invitation link&hellip;
              </div>
            )}

            {(state === 'expired' || state === 'invalid' || state === 'error' || state === 'accepted') && (
              <Alert variant="destructive" className="bg-destructive/10 border-red-500/40 text-red-200">
                <AlertDescription>
                  {state === 'expired' && (
                    <>
                      This invitation expired on {expiresAt ?? 'the specified date'}. Ask the account owner to send a new
                      invite.
                    </>
                  )}
                  {state === 'accepted' && 'This invitation has already been accepted.'}
                  {state === 'invalid' && (errorMessage ?? 'This invitation link is no longer valid.')}
                  {state === 'error' && (errorMessage ?? 'Something went wrong while validating your invitation.')}
                </AlertDescription>
              </Alert>
            )}

            {state === 'ready' && invite && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{inviteEmail}</span> has been invited to join{' '}
                    <span className="font-semibold text-white">{accountName}</span> as{' '}
                    <span className="font-semibold text-white">{invite.role}</span>.
                  </p>
                  {expiresAt && <p className="mt-2 text-xs text-slate-500">Expires {expiresAt}</p>}
                </div>

                {isAuthenticated && (
                  <Alert className="bg-primary-500/10 border-primary-600/30 text-primary-100">
                    <AlertDescription>
                      You’re already signed in. If this invite is for a different user, sign out first or open this link
                      in a private window.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    className="h-12 font-semibold"
                    disabled={!registerSearch}
                    onClick={() => {
                      if (!registerSearch) return;
                      navigate(`/register?${registerSearch}`);
                    }}
                  >
                    Create new login
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 border-white/20 text-slate-100 hover:bg-white/10"
                    disabled={!registerSearch}
                    onClick={() => {
                      if (!registerSearch) return;
                      navigate(`/login?${registerSearch}`);
                    }}
                  >
                    I already have a login
                  </Button>
                </div>
              </div>
            )}

            {(state === 'expired' || state === 'invalid' || state === 'accepted' || state === 'error') && (
              <div className="space-y-3">
                <Button className="w-full h-12 font-semibold" onClick={() => navigate('/')}>
                  Go back to RestaurantIQ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

