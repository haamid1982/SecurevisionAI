alter table jobs add column if not exists quote_id uuid references quotes(id) on delete set null;
create unique index if not exists jobs_quote_unique_idx on jobs(quote_id) where quote_id is not null;
