/**
 * Billing Settings Page
 * Manage subscription, view invoices, access customer portal
 */

import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSubscription,
  useInvoices,
  useCustomerPortal,
  useCheckout,
  formatPrice,
} from '@/hooks/useBilling';
import {
  CreditCard,
  Receipt,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function BillingSettingsPage() {
  const subscription = useSubscription();
  const invoices = useInvoices(5);
  const portal = useCustomerPortal();
  const checkout = useCheckout();

  const hasActiveSubscription =
    subscription.data?.has_subscription &&
    subscription.data?.status === 'active';

  const isPastDue = subscription.data?.status === 'past_due';
  const isCanceling = subscription.data?.cancel_at_period_end;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-slate-400 mt-1">
            Manage your subscription, payment methods, and view invoices
          </p>
        </div>

        {/* Current Plan */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-400" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32 bg-white/10" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
            ) : hasActiveSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {subscription.data?.plan_name}
                      </span>
                      <Badge
                        className={
                          isPastDue
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : isCanceling
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                        }
                      >
                        {isPastDue
                          ? 'Past Due'
                          : isCanceling
                            ? 'Canceling'
                            : 'Active'}
                      </Badge>
                    </div>
                    {subscription.data?.current_period_end && (
                      <p className="text-sm text-slate-400 mt-1">
                        {isCanceling ? 'Access until' : 'Renews'}{' '}
                        {new Date(
                          subscription.data.current_period_end
                        ).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => portal.mutate()}
                    disabled={portal.isPending}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    {portal.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Manage Subscription
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {isPastDue && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Payment failed
                      </p>
                      <p className="text-sm text-red-300/70 mt-1">
                        Please update your payment method to continue your
                        subscription.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => portal.mutate()}
                      >
                        Update Payment Method
                      </Button>
                    </div>
                  </div>
                )}

                {isCanceling && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Clock className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">
                        Subscription ending
                      </p>
                      <p className="text-sm text-yellow-300/70 mt-1">
                        Your subscription will end on{' '}
                        {new Date(
                          subscription.data?.current_period_end || ''
                        ).toLocaleDateString()}
                        . You can resubscribe anytime.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 bg-primary-500 hover:bg-primary-400 text-white"
                        onClick={() => checkout.mutate('premium_monthly')}
                      >
                        Resubscribe
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">Free</span>
                  <Badge className="bg-white/10 text-slate-300 border-white/10">
                    Current Plan
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">
                  You're on the free tier with limited usage.
                </p>

                <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary-300">
                        Upgrade to Premium
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Get unlimited invoice uploads, 50 AI generations/month,
                        and priority support for $99/month.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 bg-primary-500 hover:bg-primary-400 text-white"
                        onClick={() => checkout.mutate('premium_monthly')}
                        disabled={checkout.isPending}
                      >
                        {checkout.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Upgrade Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary-400" />
              Payment History
            </CardTitle>
            <CardDescription>Your recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-white/10" />
                ))}
              </div>
            ) : invoices.data && invoices.data.length > 0 ? (
              <div className="space-y-3">
                {invoices.data.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          invoice.status === 'succeeded'
                            ? 'bg-green-500/10'
                            : invoice.status === 'failed'
                              ? 'bg-red-500/10'
                              : 'bg-yellow-500/10'
                        }`}
                      >
                        {invoice.status === 'succeeded' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : invoice.status === 'failed' ? (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {invoice.invoice_number || 'Invoice'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {invoice.paid_at
                            ? new Date(invoice.paid_at).toLocaleDateString()
                            : new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-white">
                        {formatPrice(invoice.amount_cents, invoice.currency)}
                      </span>
                      {invoice.invoice_pdf_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                          onClick={() =>
                            window.open(invoice.invoice_pdf_url, '_blank')
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                No payment history yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Help */}
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <AlertCircle className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">
                  Need help with billing?
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Contact us at{' '}
                  <a
                    href="mailto:support@restaurantiq.us"
                    className="text-primary-400 hover:underline"
                  >
                    support@restaurantiq.us
                  </a>{' '}
                  and we'll help you out.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
