alter table app_users add column if not exists is_active boolean not null default true;

create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email varchar(254) not null,
  full_name varchar(120) not null default '',
  role user_role not null,
  status varchar(20) not null default 'Pending' check(status in ('Pending','Accepted','Cancelled','Expired')),
  invited_by text not null,
  expires_at timestamptz not null default now()+interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists team_invitations_pending_email_idx
on team_invitations(company_id,lower(email)) where status='Pending';
create index if not exists team_invitations_company_idx on team_invitations(company_id,created_at desc);
