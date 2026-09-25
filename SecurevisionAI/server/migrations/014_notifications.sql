create table if not exists notification_reads (
  company_id uuid not null references companies(id) on delete cascade,
  user_uid text not null references app_users(firebase_uid) on delete cascade,
  notification_key varchar(180) not null,
  read_at timestamptz not null default now(),
  primary key (company_id,user_uid,notification_key)
);

create index if not exists notification_reads_user_idx
  on notification_reads(company_id,user_uid,read_at desc);
