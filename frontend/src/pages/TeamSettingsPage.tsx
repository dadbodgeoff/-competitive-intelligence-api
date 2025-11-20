import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAccountSummary,
  updateModuleAccess,
  inviteAccountMember,
  assignMemberCompensation,
} from '@/services/api/accountApi';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwner = user?.account_role === 'owner';

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'member'>('member');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['account-summary'],
    queryFn: fetchAccountSummary,
    refetchOnWindowFocus: false,
  });

  const moduleMutation = useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) =>
      updateModuleAccess(slug, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'Module updated',
        description: 'Module access updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update module',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteAccountMember({
        email: inviteEmail,
        role: inviteRole,
      }),
    onSuccess: () => {
      setInviteEmail('');
      setInviteRole('member');
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'Invitation sent',
        description: 'The invite email has been sent to the user.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send invite',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const compensationMutation = useMutation({
    mutationFn: ({
      user_id,
      rate,
      notes,
    }: {
      user_id: string;
      rate: number;
      notes?: string;
    }) =>
      assignMemberCompensation({
        user_id,
        rate,
        currency: 'USD',
        rate_type: 'hourly',
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'Pay rate updated',
        description: 'Compensation saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update pay rate',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Loading account details…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load account information.</p>
      </div>
    );
  }

  const activeCompensation = new Map<string, { rate: number; currency: string; rate_type: string }>();
  data.compensation.forEach((record) => {
    if (!record.ends_at) {
      activeCompensation.set(record.user_id, {
        rate: record.rate_cents / 100,
        currency: record.currency,
        rate_type: record.rate_type,
      });
    }
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Account Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-100">Account:</span>
            <span>{data.account.name ?? 'Untitled Account'}</span>
            <Badge variant="secondary" className="ml-2 capitalize">
              {data.account.plan}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-slate-100">Members:</span>{' '}
            <span>{data.members.length}</span>
          </div>
          <div>
            <span className="font-medium text-slate-100">Owner:</span>{' '}
            <span>{user?.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Module Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.modules.map((module) => (
            <div
              key={module.module_slug}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
            >
              <div>
                <p className="text-white font-medium">{module.module_slug.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-400">
                  {module.can_access ? 'Enabled for all members' : 'Disabled'}
                </p>
              </div>
              <Switch
                checked={module.can_access}
                onCheckedChange={(checked) =>
                  moduleMutation.mutate({ slug: module.module_slug, enabled: checked })
                }
                disabled={!isOwner || moduleMutation.isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white">Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.members.map((member) => {
              const rawMeta = member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined;
              const firstName =
                member.auth_users?.first_name ??
                member.profile?.first_name ??
                (rawMeta?.first_name as string | undefined) ??
                '';
              const lastName =
                member.auth_users?.last_name ??
                member.profile?.last_name ??
                (rawMeta?.last_name as string | undefined) ??
                '';
              const currentRate = activeCompensation.get(member.user_id);
              return (
                <div
                  key={member.user_id}
                  className="rounded-lg border border-white/5 bg-white/5 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {(firstName || lastName) ? `${firstName} ${lastName}`.trim() : member.auth_users?.email || 'Member'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {member.role}
                      </p>
                    </div>
                    <Badge
                      variant={member.status === 'active' ? 'secondary' : 'outline'}
                      className="capitalize"
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-300">
                    Current rate:{' '}
                    {currentRate
                      ? `$${currentRate.rate.toFixed(2)} ${currentRate.currency} (${currentRate.rate_type})`
                      : 'Not set'}
                  </div>
                  {isOwner && member.status === 'active' && (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const rate = Number(formData.get('rate'));
                        const notes = String(formData.get('notes') || '');
                        if (Number.isNaN(rate) || rate <= 0) {
                          toast({
                            title: 'Invalid rate',
                            description: 'Enter a rate greater than zero.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        compensationMutation.mutate({
                          user_id: member.user_id,
                          rate,
                          notes,
                        });
                        event.currentTarget.reset();
                      }}
                    >
                      <div className="flex flex-1 items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`rate-${member.user_id}`} className="text-xs text-slate-400">
                            Rate ($/hr)
                          </Label>
                          <Input
                            id={`rate-${member.user_id}`}
                            name="rate"
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-9 w-28 bg-obsidian/70 text-white border-white/10"
                            placeholder="25.00"
                          />
                        </div>
                        <Input
                          name="notes"
                          placeholder="Notes (optional)"
                          className="h-9 bg-obsidian/70 text-white border-white/10"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={compensationMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-500"
                      >
                        Save
                      </Button>
                    </form>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-card-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white">Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="invite-email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="manager@restaurant.com"
                className="bg-obsidian/70 text-white border-white/10"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                disabled={!isOwner || inviteMutation.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invite-role" className="text-slate-300">
                Role
              </Label>
              <select
                id="invite-role"
                className="w-full rounded-md border border-white/10 bg-obsidian/70 px-3 py-2 text-sm text-white"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as 'owner' | 'admin' | 'member')}
                disabled={!isOwner || inviteMutation.isPending}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={!isOwner || inviteMutation.isPending || !inviteEmail}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Send Invite
            </Button>

            <div className="text-xs text-slate-400">
              Invited users will receive an email with a link to join this account. Existing Supabase
              accounts matching the email will be added immediately.
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Pending invitations</h3>
              {data.invitations.length === 0 && (
                <p className="text-xs text-slate-500">No pending invites.</p>
              )}
              {data.invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between text-sm text-slate-300">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-xs text-slate-500">
                      {invite.role} • expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={invite.status === 'pending' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {invite.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

