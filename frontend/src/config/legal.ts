import { TERMS_OF_SERVICE } from '@/content/legal/terms-of-service';
import { PRIVACY_POLICY } from '@/content/legal/privacy-policy';

export type PolicyKey = 'terms' | 'privacy';

export interface PolicySection {
  title: string;
  content: string;
}

export interface PolicyContent {
  version: string;
  effectiveDate: string;
  sections: PolicySection[];
}

export interface PolicyMetadata {
  title: string;
  description: string;
  version: string;
  shortCode: string;
  content: PolicyContent;
}

export const POLICY_METADATA: Record<PolicyKey, PolicyMetadata> = {
  terms: {
    title: 'Terms of Service',
    description:
      'Please review the RestaurantIQ Terms of Service. These terms define how we provide our platform and what is expected when you use it.',
    version: TERMS_OF_SERVICE.version,
    shortCode: 'tos-2025-11',
    content: TERMS_OF_SERVICE,
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'Please review the RestaurantIQ Privacy Policy to understand how we collect, use, and protect your data.',
    version: PRIVACY_POLICY.version,
    shortCode: 'pp-2025-11',
    content: PRIVACY_POLICY,
  },
};

export interface PolicyAcceptance {
  policy: PolicyKey;
  acceptedAt: string;
  version: string;
  shortCode: string;
  pageCount?: number;
}


