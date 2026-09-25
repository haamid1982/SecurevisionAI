alter table jobs add column if not exists site_id uuid references customer_sites(id) on delete set null;
alter table jobs add column if not exists assigned_engineer_uid text references app_users(firebase_uid) on delete set null;
alter table jobs add column if not exists job_type varchar(60) not null default 'Installation';
alter table jobs add column if not exists scheduled_start timestamptz;
alter table jobs add column if not exists scheduled_end timestamptz;

create table if not exists job_status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  from_status job_status,
  to_status job_status not null,
  changed_by text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists job_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  author_uid text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists jobs_engineer_idx on jobs(company_id,assigned_engineer_uid);
create index if not exists jobs_schedule_idx on jobs(company_id,scheduled_start);
create index if not exists job_status_history_job_idx on job_status_history(company_id,job_id,created_at desc);
create index if not exists job_notes_job_idx on job_notes(company_id,job_id,created_at desc);
