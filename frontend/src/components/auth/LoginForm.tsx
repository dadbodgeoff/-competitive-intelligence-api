import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { LoginCredentials } from '@/types/auth';
import { parseAuthError } from '@/utils/errorMessages';
import { supabase, isSupabaseEnabled } from '@/utils/supabase';
import { toast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  invite_token: z.string().optional(),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const inviteToken = searchParams.get('token') ?? undefined;
  const inviteEmail = searchParams.get('email') ?? undefined;
  const inviteAccountName = searchParams.get('accountName') ?? undefined;
  const isInviteFlow = Boolean(inviteToken);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      invite_token: inviteToken,
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

  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearError();
      await login({
        ...data,
        invite_token: inviteToken,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-primary-500 transition-colors">
            <TrendingUp className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold">RestaurantIQ</span>
          </Link>
        </div>

        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Sign in to access your restaurant intelligence
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (() => {
              const errorDetails = parseAuthError({ message: error }, 'login');
              return (
                <Alert variant="destructive" className="bg-destructive/10 border-red-500/50 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">{errorDetails.title}</p>
                      <p className="text-sm">{errorDetails.description}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })()}
            
            {isInviteFlow && (
              <Alert className="bg-primary-500/10 border-white/10 text-primary-100">
                <AlertDescription>
                  {inviteAccountName
                    ? `Welcome back. Sign in to join ${inviteAccountName}.`
                    : 'Use the email address that received this invitation to finish joining the account.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
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
                <span className="bg-card-dark px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@restaurant.com"
                          className="h-12 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20"
                          autoComplete="email"
                          data-testid="email-input"
                          readOnly={isInviteFlow}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="h-12 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20 pr-12"
                            autoComplete="current-password"
                            data-testid="password-input"
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
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/25 transition-all duration-200"
                  disabled={isLoading}
                  data-testid="login-button"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card-dark px-2 text-slate-500">New here?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-500 hover:text-primary-300 transition-colors"
                >
                  Create one free
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
      </div>
    </div>
  );
}