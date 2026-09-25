create table if not exists document_deliveries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  document_type varchar(10) not null check(document_type in ('quote','invoice')),
  document_id uuid not null,
  recipient_email varchar(254) not null,
  status varchar(20) not null default 'Preparing' check(status in ('Preparing','Sent','Failed','Accepted','Rejected')),
  provider_message_id text,
  access_token text not null unique default encode(gen_random_bytes(32),'hex'),
  error_message text,
  sent_by text references app_users(firebase_uid),
  sent_at timestamptz,
  decided_at timestamptz,
  decision_name varchar(160),
  decision_ip inet,
  created_at timestamptz not null default now()
);

create index if not exists document_deliveries_company_idx on document_deliveries(company_id,created_at desc);
create index if not exists document_deliveries_document_idx on document_deliveries(document_type,document_id);
