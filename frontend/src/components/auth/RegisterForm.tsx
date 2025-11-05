import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, TrendingUp } from 'lucide-react';
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

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      clearError();
      await register(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
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

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
      </div>
    </div>
  );
}