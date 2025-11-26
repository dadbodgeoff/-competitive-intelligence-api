import { apiClient, safeRequest } from './client';
import type { InviteValidation } from '@/types/auth';

export interface AccountSummaryResponse {
  account: {
    id: string;
    name: string | null;
    plan: string;
    trial_ends_at: string | null;
    created_at: string;
    updated_at: string;
    clock_location_code?: string | null;
  };
  modules: Array<{
    module_slug: string;
    can_access: boolean;
    granted_at: string;
    granted_by: string | null;
    revoked_at: string | null;
  }>;
  members: Array<{
    user_id: string;
    role: string;
    status: string;
    invited_by: string | null;
    invited_at: string | null;
    joined_at: string | null;
    auth_users?: {
      id: string;
      email: string;
      first_name?: string | null;
      last_name?: string | null;
      raw_user_meta_data?: Record<string, unknown> | null;
    } | null;
    profile?: {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      subscription_tier?: string | null;
    } | null;
    clock_pin?: {
      is_set: boolean;
      updated_at?: string | null;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    token: string;
    invited_by: string | null;
    invited_at: string;
    expires_at: string;
    accepted_at: string | null;
  }>;
  compensation: Array<{
    user_id: string;
    effective_at: string;
    ends_at: string | null;
    rate_cents: number;
    currency: string;
    rate_type: string;
    notes?: string | null;
    set_by: string | null;
  }>;
}

export async function fetchAccountSummary() {
  const result = await safeRequest<AccountSummaryResponse>(() =>
    apiClient.get('/api/v1/accounts/current')
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to load account');
  }
  return result.data;
}

export async function updateModuleAccess(module_slug: string, can_access: boolean) {
  const result = await safeRequest<{ success: boolean }>(() =>
    apiClient.post('/api/v1/accounts/modules/toggle', {
      module_slug,
      can_access,
    })
  );

  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to update module');
  }

  return result.data;
}

export async function inviteAccountMember({
  email,
  role,
  expires_in_days,
  send_email = true,
}: {
  email: string;
  role: 'owner' | 'admin' | 'member';
  expires_in_days?: number;
  send_email?: boolean;
}) {
  const result = await safeRequest<{ success: boolean; token: string; expires_at: string }>(() =>
    apiClient.post('/api/v1/accounts/invitations', {
      email,
      role,
      expires_in_days,
      send_email,
    })
  );

  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to send invitation');
  }

  return result.data;
}

export async function assignMemberCompensation(payload: {
  user_id: string;
  rate: number;
  currency: string;
  rate_type: 'hourly' | 'salary' | 'contract';
  effective_at?: string;
  notes?: string;
}) {
  const result = await safeRequest<{ success: boolean }>(() =>
    apiClient.post('/api/v1/accounts/members/compensation', payload)
  );

  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to update compensation');
  }

  return result.data;
}

export async function validateAccountInvite(token: string) {
  const result = await safeRequest<InviteValidation>(() =>
    apiClient.get('/api/v1/accounts/invitations/validate', {
      params: { token },
    })
  );

  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Invitation validation failed');
  }

  return result.data;
}

export async function getClockPinStatus() {
  const result = await safeRequest<{ has_pin: boolean; updated_at?: string | null }>(() =>
    apiClient.get('/api/v1/accounts/clock-pin')
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to load PIN status');
  }
  return result.data;
}

export async function setClockPin(pin: string) {
  const result = await safeRequest<{ has_pin: boolean; updated_at?: string | null }>(() =>
    apiClient.put('/api/v1/accounts/clock-pin', { pin })
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to save PIN');
  }
  return result.data;
}

export async function clearClockPin() {
  const result = await safeRequest<{ has_pin: boolean; updated_at?: string | null }>(() =>
    apiClient.delete('/api/v1/accounts/clock-pin')
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to remove PIN');
  }
  return result.data;
}



// ============================================================================
// MEMBER MODULE ACCESS & PERMISSIONS API
// ============================================================================

export interface MemberModuleAccess {
  module_slug: string;
  module_name: string;
  module_description?: string;
  can_access: boolean;
  access_source: 'account' | 'member';
  account_level_access: boolean;
  has_override: boolean;
}

export interface FeaturePermission {
  slug: string;
  module_slug: string;
  name: string;
  description?: string;
  category: 'view' | 'edit' | 'financial' | 'admin';
  is_sensitive: boolean;
  default_for_owner: boolean;
  default_for_admin: boolean;
  default_for_member: boolean;
  sort_order: number;
}

export interface MemberPermission {
  permission_slug: string;
  permission_name: string;
  description?: string;
  module_slug: string;
  category: string;
  is_sensitive: boolean;
  is_granted: boolean;
  default_value: boolean;
  has_override: boolean;
  source: 'default' | 'override';
}

export async function getMemberModuleAccess(userId: string) {
  const result = await safeRequest<{ user_id: string; modules: MemberModuleAccess[] }>(() =>
    apiClient.get(`/api/v1/accounts/members/${userId}/modules`)
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to load module access');
  }
  return result.data;
}

export async function setMemberModuleAccess(payload: {
  user_id: string;
  module_slug: string;
  can_access: boolean;
  notes?: string;
}) {
  const result = await safeRequest<{ success: boolean }>(() =>
    apiClient.post('/api/v1/accounts/members/modules', payload)
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to update module access');
  }
  return result.data;
}

export async function clearMemberModuleOverride(userId: string, moduleSlug: string) {
  const result = await safeRequest<{ success: boolean }>(() =>
    apiClient.delete(`/api/v1/accounts/members/${userId}/modules/${moduleSlug}`)
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to clear override');
  }
  return result.data;
}

export async function getPermissionsCatalog() {
  const result = await safeRequest<{
    permissions: FeaturePermission[];
    by_module: Record<string, FeaturePermission[]>;
  }>(() => apiClient.get('/api/v1/accounts/permissions/catalog'));
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to load permissions');
  }
  return result.data;
}

export async function getMemberPermissions(userId: string) {
  const result = await safeRequest<{
    user_id: string;
    role: string;
    permissions: MemberPermission[];
  }>(() => apiClient.get(`/api/v1/accounts/members/${userId}/permissions`));
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to load permissions');
  }
  return result.data;
}

export async function setMemberPermission(payload: {
  user_id: string;
  permission_slug: string;
  is_granted: boolean;
  notes?: string;
}) {
  const result = await safeRequest<{ success: boolean }>(() =>
    apiClient.post('/api/v1/accounts/members/permissions', payload)
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to update permission');
  }
  return result.data;
}

export async function clearMemberPermissionOverride(userId: string, permissionSlug: string) {
  const result = await safeRequest<{ success: boolean }>(() =>
    apiClient.delete(`/api/v1/accounts/members/${userId}/permissions/${permissionSlug}`)
  );
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to clear override');
  }
  return result.data;
}

export async function getAllMembersPermissionsSummary() {
  const result = await safeRequest<{
    permissions: FeaturePermission[];
    members: Array<{
      user_id: string;
      role: string;
      permissions: Record<string, { is_granted: boolean; source: 'default' | 'override' }>;
    }>;
  }>(() => apiClient.get('/api/v1/accounts/members/permissions/summary'));
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to load summary');
  }
  return result.data;
}
