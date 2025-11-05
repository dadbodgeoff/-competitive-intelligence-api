import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { LoginCredentials } from '@/types/auth';
import { parseAuthError } from '@/utils/errorMessages';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearError();
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-emerald-400 transition-colors">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
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
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
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
                          className="h-12 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="email"
                          data-testid="email-input"
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
                      <FormLabel className="text-slate-200 font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="h-12 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12"
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
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200"
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
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
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