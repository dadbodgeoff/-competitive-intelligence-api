-- Add consent tracking fields for policy acknowledgements
alter table if exists public.users
    add column if not exists terms_version text,
    add column if not exists terms_accepted_at timestamptz,
    add column if not exists privacy_version text,
    add column if not exists privacy_accepted_at timestamptz;

comment on column public.users.terms_version is 'Version identifier of the Terms of Service accepted by the user';
comment on column public.users.terms_accepted_at is 'Timestamp when the user accepted the Terms of Service';
comment on column public.users.privacy_version is 'Version identifier of the Privacy Policy accepted by the user';
comment on column public.users.privacy_accepted_at is 'Timestamp when the user accepted the Privacy Policy';

