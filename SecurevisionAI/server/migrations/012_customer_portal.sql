alter table app_users add column if not exists customer_id uuid references customers(id) on delete set null;
alter table team_invitations add column if not exists customer_id uuid references customers(id) on delete cascade;

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  site_id uuid references customer_sites(id) on delete set null,
  subject varchar(180) not null,
  description text not null,
  priority varchar(20) not null default 'Normal' check(priority in ('Low','Normal','High','Urgent')),
  status varchar(30) not null default 'Submitted' check(status in ('Submitted','Reviewing','Scheduled','Resolved','Closed')),
  submitted_by text not null references app_users(firebase_uid),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_users_customer_idx on app_users(company_id,customer_id);
create index if not exists service_requests_customer_idx on service_requests(company_id,customer_id,created_at desc);
