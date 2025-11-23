export type PolicyKey = 'terms' | 'privacy';

export interface PolicyMetadata {
  title: string;
  description: string;
  file: string;
  version: string;
  shortCode: string;
}

export const POLICY_METADATA: Record<PolicyKey, PolicyMetadata> = {
  terms: {
    title: 'Terms of Service',
    description:
      'Please review the RestaurantIQ Terms of Service. These terms define how we provide our platform and what is expected when you use it.',
    file: '/legal/terms-of-service.pdf',
    version: '2025-11-20',
    shortCode: 'tos-2025-11',
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'Please review the RestaurantIQ Privacy Policy to understand how we collect, use, and protect your data.',
    file: '/legal/privacy-policy.pdf',
    version: '2025-11-20',
    shortCode: 'pp-2025-11',
  },
};

export interface PolicyAcceptance {
  policy: PolicyKey;
  acceptedAt: string;
  version: string;
  shortCode: string;
  pageCount?: number;
}


