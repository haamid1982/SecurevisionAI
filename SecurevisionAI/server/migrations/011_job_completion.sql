create table if not exists job_completion_records (
  job_id uuid primary key references jobs(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  checklist jsonb not null default '[]'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  work_summary text not null default '',
  further_work_required text not null default '',
  customer_name varchar(160) not null default '',
  customer_signature text,
  signed_at timestamptz,
  completed_by text references app_users(firebase_uid),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  caption varchar(240) not null default '',
  mime_type varchar(80) not null,
  image_data bytea not null,
  uploaded_by text not null references app_users(firebase_uid),
  created_at timestamptz not null default now()
);

create index if not exists job_completion_company_idx on job_completion_records(company_id,completed_at);
create index if not exists job_photos_job_idx on job_photos(company_id,job_id,created_at);
