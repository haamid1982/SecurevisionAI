alter table companies add column if not exists logo_data bytea;
alter table companies add column if not exists logo_mime varchar(40);
alter table companies add column if not exists logo_updated_at timestamptz;
