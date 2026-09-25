create sequence if not exists quote_reference_seq start 1001;
create sequence if not exists invoice_reference_seq start 1001;

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id), site_id uuid references customer_sites(id) on delete set null,
  reference varchar(30) unique not null, title varchar(180) not null, status varchar(20) not null default 'Draft' check(status in ('Draft','Sent','Accepted','Rejected','Expired')),
  subtotal numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, vat_rate numeric(5,2) not null default 20,
  vat_amount numeric(12,2) not null default 0, total numeric(12,2) not null default 0, valid_until date, notes text not null default '',
  created_by text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(), quote_id uuid not null references quotes(id) on delete cascade,
  description varchar(300) not null, quantity numeric(10,2) not null check(quantity>0), unit_price numeric(12,2) not null check(unit_price>=0), sort_order int not null default 0
);
alter table invoices add column if not exists company_id uuid references companies(id);
alter table invoices add column if not exists job_id uuid references jobs(id) on delete set null;
alter table invoices add column if not exists quote_id uuid references quotes(id) on delete set null;
alter table invoices add column if not exists subtotal numeric(12,2) not null default 0;
alter table invoices add column if not exists discount numeric(12,2) not null default 0;
alter table invoices add column if not exists vat_rate numeric(5,2) not null default 20;
alter table invoices add column if not exists vat_amount numeric(12,2) not null default 0;
alter table invoices add column if not exists balance numeric(12,2) not null default 0;
alter table invoices add column if not exists notes text not null default '';
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(), invoice_id uuid not null references invoices(id) on delete cascade,
  description varchar(300) not null, quantity numeric(10,2) not null check(quantity>0), unit_price numeric(12,2) not null check(unit_price>=0), sort_order int not null default 0
);
create table if not exists invoice_payments (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade, amount numeric(12,2) not null check(amount>0), method varchar(40) not null default 'Bank Transfer', reference varchar(100) not null default '', paid_at date not null default current_date, recorded_by text not null, created_at timestamptz not null default now()
);
create index if not exists quotes_company_idx on quotes(company_id,created_at desc);
create index if not exists invoices_company_created_idx on invoices(company_id,created_at desc);
create index if not exists invoice_payments_invoice_idx on invoice_payments(company_id,invoice_id);
