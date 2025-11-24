import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const fromLogin = searchParams.get('from') === 'login';
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    // TODO: Implement resend verification email API call
    setResendCooldown(60); // 60 second cooldown
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-primary-500 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold">RestaurantIQ</span>
          </Link>
        </div>

        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {fromLogin ? (
              <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Email Verification Required</p>
                    <p className="text-sm">
                      Your account exists but your email address hasn't been verified yet. 
                      Please check your inbox and click the verification link to access your account.
                    </p>
                    {email && (
                      <p className="text-sm mt-2">
                        Verification email sent to: <span className="font-medium">{email}</span>
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-primary-500/10 border-white/10 text-primary-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Account created successfully!</p>
                    {email && (
                      <p className="text-sm">
                        We sent a verification email to <span className="font-medium">{email}</span>
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 text-slate-300">
              <h3 className="font-semibold text-white">Next steps:</h3>
              <ol className="space-y-3 list-decimal list-inside text-sm">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here and sign in to your account</li>
              </ol>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                asChild
                className="w-full h-12 text-base font-semibold bg-gradient-to-r bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/25"
              >
                <Link to="/login">
                  Go to Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  className="text-sm border-white/10 text-slate-300 hover:text-white hover:border-primary-500/50"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend verification email'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-sm text-slate-400 space-y-2">
                <p className="font-medium text-slate-300">Having trouble?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• The verification link expires in 24 hours</li>
                </ul>
              </div>
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
