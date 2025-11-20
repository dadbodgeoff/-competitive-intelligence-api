import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAccountSummary,
  updateModuleAccess,
  inviteAccountMember,
  assignMemberCompensation,
  setClockPin,
  clearClockPin,
} from '@/services/api/accountApi';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import { AccountOverviewCard } from '@/components/team/AccountOverviewCard';
import { ModuleAccessCard } from '@/components/team/ModuleAccessCard';
import { TeamMembersCard } from '@/components/team/TeamMembersCard';
import { InviteMemberCard } from '@/components/team/InviteMemberCard';
import { ClockPinCard } from '@/components/team/ClockPinCard';

export function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwner = user?.account_role === 'owner';

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'member'>('member');
  const [pin, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['account-summary'],
    queryFn: fetchAccountSummary,
    refetchOnWindowFocus: false,
  });
  const clockPinMutation = useMutation({
    mutationFn: (pinCode: string) => setClockPin(pinCode),
    onSuccess: () => {
      setPinValue('');
      setPinConfirm('');
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'PIN updated',
        description: 'Your kiosk PIN is ready to use.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save PIN',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const clearPinMutation = useMutation({
    mutationFn: () => clearClockPin(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'PIN removed',
        description: 'Clock-in PIN cleared successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove PIN',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    },
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
    mutationFn: (payload: { email: string; role: 'owner' | 'admin' | 'member' }) => inviteAccountMember(payload),
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

  const currentMember = data.members.find((member) => member.user_id === user?.id);
  const pinStatus = currentMember?.clock_pin;

  return (
    <div className="p-6 space-y-6">
      <AccountOverviewCard
        accountName={data.account.name}
        plan={data.account.plan}
        memberCount={data.members.length}
        ownerEmail={user?.email ?? null}
      />

      <ModuleAccessCard
        modules={data.modules}
        isOwner={Boolean(isOwner)}
        isUpdating={moduleMutation.isPending}
        onToggle={(slug, enabled) => moduleMutation.mutate({ slug, enabled })}
      />

      <ClockPinCard
        status={pinStatus}
        onSave={(value) => clockPinMutation.mutate(value)}
        onRemove={() => clearPinMutation.mutate()}
        saving={clockPinMutation.isPending}
        removing={clearPinMutation.isPending}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <TeamMembersCard
          members={data.members}
          compensationLookup={activeCompensation}
          isOwner={Boolean(isOwner)}
          onAssignCompensation={(payload) => compensationMutation.mutate(payload)}
          assigning={compensationMutation.isPending}
        />

        <InviteMemberCard
          isOwner={Boolean(isOwner)}
          isInviting={inviteMutation.isPending}
          invitations={data.invitations}
          onInvite={(payload) => inviteMutation.mutate(payload)}
        />
      </div>
    </div>
  );
}

