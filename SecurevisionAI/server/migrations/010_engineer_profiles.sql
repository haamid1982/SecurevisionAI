create table if not exists engineer_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_uid text unique references app_users(firebase_uid) on delete set null,
  email varchar(254) not null,
  full_name varchar(160) not null,
  job_title varchar(160) not null default 'Security Engineer',
  phone varchar(40) not null default '',
  skills text[] not null default '{}',
  status varchar(30) not null default 'Invited' check(status in ('Invited','Available','On Job','Off Duty','Inactive')),
  created_by text not null references app_users(firebase_uid),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,email)
);

alter table jobs add column if not exists engineer_profile_id uuid references engineer_profiles(id) on delete set null;
create index if not exists engineer_profiles_company_idx on engineer_profiles(company_id,status);
create index if not exists jobs_engineer_profile_idx on jobs(company_id,engineer_profile_id);

insert into engineer_profiles(company_id,user_uid,email,full_name,status,created_by)
select u.company_id,u.firebase_uid,u.email,u.full_name,'Available',u.firebase_uid
from app_users u
where u.role='engineer' and u.company_id is not null
on conflict(company_id,email) do update set user_uid=excluded.user_uid,status=case when engineer_profiles.status='Invited' then 'Available' else engineer_profiles.status end;
