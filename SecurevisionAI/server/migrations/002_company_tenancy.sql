create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  email varchar(254) not null default '',
  phone varchar(40) not null default '',
  website varchar(300) not null default '',
  address varchar(300) not null default '',
  timezone varchar(80) not null default 'Europe/London',
  currency varchar(3) not null default 'GBP',
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_services (
  company_id uuid not null references companies(id) on delete cascade,
  service varchar(100) not null,
  primary key(company_id,service)
);

alter table app_users add column if not exists company_id uuid references companies(id);
alter table customers add column if not exists company_id uuid references companies(id);
alter table customer_sites add column if not exists company_id uuid references companies(id);
alter table jobs add column if not exists company_id uuid references companies(id);
alter table invoices add column if not exists company_id uuid references companies(id);

create index if not exists app_users_company_id_idx on app_users(company_id);
create index if not exists customers_company_id_idx on customers(company_id);
create index if not exists jobs_company_id_idx on jobs(company_id);
create index if not exists invoices_company_id_idx on invoices(company_id);
