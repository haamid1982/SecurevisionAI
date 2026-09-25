create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  sku varchar(80) not null,
  name varchar(180) not null,
  category varchar(80) not null default 'Equipment',
  manufacturer varchar(120) not null default '',
  supplier varchar(160) not null default '',
  supplier_email varchar(254) not null default '',
  unit_cost numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  quantity integer not null default 0,
  reorder_level integer not null default 0,
  location varchar(160) not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,sku)
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  item_id uuid not null references inventory_items(id) on delete cascade,
  movement_type varchar(30) not null check(movement_type in ('Received','Used','Adjustment','Returned')),
  quantity_change integer not null check(quantity_change <> 0),
  reference varchar(160) not null default '',
  notes text not null default '',
  recorded_by text not null references app_users(firebase_uid),
  created_at timestamptz not null default now()
);

create index if not exists inventory_items_company_idx on inventory_items(company_id,is_active,name);
create index if not exists inventory_movements_item_idx on inventory_movements(company_id,item_id,created_at desc);
