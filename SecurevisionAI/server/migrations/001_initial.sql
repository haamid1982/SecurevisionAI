create extension if not exists pgcrypto;
do $$ begin
  create type user_role as enum ('admin','engineer','customer');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type customer_status as enum ('Active','Lead','Inactive');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type job_status as enum ('Pending','Scheduled','In Progress','Completed','Cancelled');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type job_priority as enum ('Low','Medium','High','Urgent');
exception when duplicate_object then null;
end $$;
create sequence if not exists job_reference_seq start 1043;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text unique not null,
  full_name text not null,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  company_name varchar(160) not null,
  contact_name varchar(120) not null,
  email varchar(254) not null,
  phone varchar(40) not null default '',
  address varchar(300) not null default '',
  status customer_status not null default 'Lead',
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_sites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  name varchar(160) not null,
  address varchar(300) not null,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  reference varchar(30) unique not null,
  customer_id uuid not null references customers(id),
  title varchar(180) not null,
  description text not null default '',
  engineer_name varchar(120) not null default 'Unassigned',
  due_date date not null,
  status job_status not null default 'Pending',
  priority job_priority not null default 'Medium',
  created_by text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  reference varchar(30) unique not null,
  status varchar(30) not null default 'Draft',
  total numeric(12,2) not null default 0,
  issued_at date,
  due_at date,
  created_at timestamptz not null default now()
);

create index if not exists customers_company_name_idx on customers using gin (to_tsvector('english',company_name));
create index if not exists jobs_customer_id_idx on jobs(customer_id);
create index if not exists jobs_due_date_idx on jobs(due_date);
create index if not exists jobs_status_idx on jobs(status);
