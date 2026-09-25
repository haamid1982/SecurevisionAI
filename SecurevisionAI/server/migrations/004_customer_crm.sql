alter table customers add column if not exists billing_email varchar(254) not null default '';
alter table customers add column if not exists notes text not null default '';

alter table customer_sites add column if not exists postcode varchar(20) not null default '';
alter table customer_sites add column if not exists access_instructions text not null default '';
alter table customer_sites add column if not exists opening_hours varchar(200) not null default '';
alter table customer_sites add column if not exists notes text not null default '';

create table if not exists customer_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  full_name varchar(120) not null,
  job_title varchar(120) not null default '',
  email varchar(254) not null default '',
  phone varchar(40) not null default '',
  contact_type varchar(30) not null default 'General',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists customer_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  site_id uuid references customer_sites(id) on delete set null,
  system_type varchar(80) not null,
  manufacturer varchar(100) not null default '',
  model varchar(100) not null default '',
  serial_number varchar(120) not null default '',
  installed_at date,
  warranty_expires_at date,
  maintenance_due_at date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_contacts_customer_idx on customer_contacts(company_id,customer_id);
create index if not exists customer_sites_tenant_customer_idx on customer_sites(company_id,customer_id);
create index if not exists customer_assets_customer_idx on customer_assets(company_id,customer_id);
