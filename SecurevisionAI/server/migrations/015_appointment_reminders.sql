create table if not exists appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  scheduled_start timestamptz not null,
  recipient varchar(254) not null,
  message_id varchar(200) not null default '',
  sent_by text not null references app_users(firebase_uid),
  sent_at timestamptz not null default now(),
  unique(job_id,scheduled_start,recipient)
);

create index if not exists appointment_reminders_company_idx
  on appointment_reminders(company_id,sent_at desc);
