import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, TrendingUp, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { RegisterData } from '@/types/auth';
import { parseAuthError } from '@/utils/errorMessages';
import { supabase, isSupabaseEnabled } from '@/utils/supabase';
import { toast } from '@/hooks/use-toast';
import {
  PolicyAgreementDialog,
} from '@/components/legal/PolicyAgreementDialog';
import {
  POLICY_METADATA,
  type PolicyAcceptance,
  type PolicyKey,
} from '@/config/legal';
import { Badge } from '@/design-system/shadcn/components/badge';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    invite_token: z.string().optional(),
    terms_accepted: z.literal(true, {
      errorMap: () => ({
        message: 'You must agree to the Terms of Service to create an account.',
      }),
    }),
    terms_version: z.string().min(1),
    terms_accepted_at: z.string().min(1),
    privacy_accepted: z.literal(true, {
      errorMap: () => ({
        message: 'You must agree to the Privacy Policy to create an account.',
      }),
    }),
    privacy_version: z.string().min(1),
    privacy_accepted_at: z.string().min(1),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [dialogPolicy, setDialogPolicy] = useState<PolicyKey | null>(null);
  const [consents, setConsents] = useState<Record<PolicyKey, PolicyAcceptance | null>>({
    terms: null,
    privacy: null,
  });

  const inviteToken = searchParams.get('token') ?? undefined;
  const inviteEmail = searchParams.get('email') ?? undefined;
  const inviteAccountName = searchParams.get('accountName') ?? undefined;
  const isInviteFlow = Boolean(inviteToken);
  const consentFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  );

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      invite_token: inviteToken,
    terms_accepted: false,
    terms_version: '',
    terms_accepted_at: '',
    privacy_accepted: false,
    privacy_version: '',
    privacy_accepted_at: '',
    },
  });

  useEffect(() => {
    if (inviteEmail) {
      form.setValue('email', inviteEmail);
    }
    if (inviteToken) {
      form.setValue('invite_token', inviteToken);
    }
  }, [form, inviteEmail, inviteToken]);

  const formatConsentTimestamp = (timestamp?: string) => {
    if (!timestamp) {
      return '';
    }
    try {
      return consentFormatter.format(new Date(timestamp));
    } catch (formatError) {
      console.warn('Failed to format consent timestamp', formatError);
      return timestamp;
    }
  };

  const handlePolicyAccepted = (acceptance: PolicyAcceptance) => {
    const { policy, acceptedAt, version } = acceptance;

    if (policy === 'terms') {
      form.setValue('terms_accepted', true, { shouldDirty: true, shouldValidate: true });
      form.setValue('terms_version', version, { shouldDirty: true });
      form.setValue('terms_accepted_at', acceptedAt, { shouldDirty: true });
    } else {
      form.setValue('privacy_accepted', true, { shouldDirty: true, shouldValidate: true });
      form.setValue('privacy_version', version, { shouldDirty: true });
      form.setValue('privacy_accepted_at', acceptedAt, { shouldDirty: true });
    }

    setConsents((previous) => ({
      ...previous,
      [policy]: acceptance,
    }));
  };

  const onSubmit = async (data: RegisterData) => {
    try {
      clearError();
      const response = await register({
        ...data,
        invite_token: inviteToken,
      });
      
      // Check if email verification is required
      if (response && response.user && response.user.email_confirmed === false) {
        // Redirect to verify email page
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        // Email already confirmed (shouldn't happen with new flow, but handle it)
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseEnabled || !supabase) {
      toast({
        title: 'Google sign-in unavailable',
        description: 'Google sign-in is disabled in this environment. Use email instead.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: 'Unable to sign in with Google. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Sign in failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <span className="text-2xl font-bold">RestaurantIQ</span>
          </Link>
        </div>

        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Start analyzing your competition in minutes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (() => {
              const errorDetails = parseAuthError({ message: error }, 'register');
              return (
                <Alert
                  variant="destructive"
                  className="bg-red-500/10 border-red-500/50 text-red-400"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">{errorDetails.title}</p>
                      <p className="text-sm">{errorDetails.description}</p>
                      {errorDetails.title === 'Email Already Registered' && (
                        <Link to="/login" className="text-sm underline hover:text-red-300 block mt-2">
                          Go to login →
                        </Link>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })()}

            {/* Google Sign In Button */}
            {isInviteFlow && (
              <Alert className="bg-emerald-500/10 border-emerald-500/40 text-emerald-100">
                <AlertDescription>
                  {inviteAccountName
                    ? `You're joining ${inviteAccountName}. Finish creating your login to access the account.`
                    : 'This invitation will add you to an existing RestaurantIQ account once you finish creating your login.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
              onClick={handleGoogleSignIn}
              disabled={isLoading || !isSupabaseEnabled}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card-dark px-2 text-slate-500">Or sign up with email</span>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
        <input type="hidden" {...form.register('terms_version')} />
        <input type="hidden" {...form.register('terms_accepted_at')} />
        <input type="hidden" {...form.register('privacy_version')} />
        <input type="hidden" {...form.register('privacy_accepted_at')} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200 font-medium">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John"
                            className="h-11 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            autoComplete="given-name"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200 font-medium">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Doe"
                            className="h-11 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            autoComplete="family-name"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@restaurant.com"
                          className="h-11 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="email"
                          readOnly={isInviteFlow}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 8 characters with special char"
                            className="h-11 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter your password"
                            className="h-11 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 rounded-2xl border border-white/10 bg-obsidian/50 p-4">
                  <h3 className="text-lg font-semibold text-white">Review &amp; agree to continue</h3>
                  <p className="text-sm text-slate-400">
                    We need your acknowledgement of the RestaurantIQ policies before creating your workspace.
                  </p>

                  <FormField
                    control={form.control}
                    name="terms_accepted"
                    render={({ field }) => {
                      const consent = consents.terms;
                      return (
                        <FormItem className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <FormLabel className="flex items-center gap-2 text-slate-200">
                                <FileText className="h-4 w-4 text-emerald-400" />
                                {POLICY_METADATA.terms.title}
                              </FormLabel>
                              <p className="text-sm text-slate-400">
                                Review version {POLICY_METADATA.terms.version} and agree to continue.
                              </p>
                              {field.value && consent && (
                                <p className="flex items-center gap-2 text-xs text-emerald-300">
                                  <ShieldCheck className="h-4 w-4" />
                                  Accepted {formatConsentTimestamp(consent.acceptedAt)}
                                </p>
                              )}
                              {!field.value && (
                                <p className="text-xs text-amber-300">Awaiting acknowledgement.</p>
                              )}
                            </div>
                            <div className="flex items-end justify-end gap-3 lg:flex-col lg:items-end">
                              <Badge
                                className={
                                  field.value
                                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200'
                                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                }
                              >
                                {field.value ? 'Accepted' : 'Required'}
                              </Badge>
                              <Button
                                type="button"
                                variant={field.value ? 'outline' : 'default'}
                                className={
                                  field.value
                                    ? 'border-slate-700 text-slate-200 hover:text-white'
                                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                }
                                onClick={() => setDialogPolicy('terms')}
                              >
                                {field.value ? 'View document' : 'Review & agree'}
                              </Button>
                            </div>
                          </div>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="privacy_accepted"
                    render={({ field }) => {
                      const consent = consents.privacy;
                      return (
                        <FormItem className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <FormLabel className="flex items-center gap-2 text-slate-200">
                                <FileText className="h-4 w-4 text-emerald-400" />
                                {POLICY_METADATA.privacy.title}
                              </FormLabel>
                              <p className="text-sm text-slate-400">
                                Review version {POLICY_METADATA.privacy.version} before you proceed.
                              </p>
                              {field.value && consent && (
                                <p className="flex items-center gap-2 text-xs text-emerald-300">
                                  <ShieldCheck className="h-4 w-4" />
                                  Accepted {formatConsentTimestamp(consent.acceptedAt)}
                                </p>
                              )}
                              {!field.value && (
                                <p className="text-xs text-amber-300">Awaiting acknowledgement.</p>
                              )}
                            </div>
                            <div className="flex items-end justify-end gap-3 lg:flex-col lg:items-end">
                              <Badge
                                className={
                                  field.value
                                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200'
                                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                }
                              >
                                {field.value ? 'Accepted' : 'Required'}
                              </Badge>
                              <Button
                                type="button"
                                variant={field.value ? 'outline' : 'default'}
                                className={
                                  field.value
                                    ? 'border-slate-700 text-slate-200 hover:text-white'
                                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                }
                                onClick={() => setDialogPolicy('privacy')}
                              >
                                {field.value ? 'View document' : 'Review & agree'}
                              </Button>
                            </div>
                          </div>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card-dark px-2 text-slate-500">
                  Already registered?
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {dialogPolicy && (
          <PolicyAgreementDialog
            policy={dialogPolicy}
            open={Boolean(dialogPolicy)}
            onOpenChange={(open) => {
              if (!open) {
                setDialogPolicy(null);
              }
            }}
            onAccept={(acceptance) => {
              handlePolicyAccepted(acceptance);
              setDialogPolicy(null);
            }}
          />
        )}
      </div>
    </div>
  );
}