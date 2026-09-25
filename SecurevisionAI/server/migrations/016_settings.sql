alter table companies add column if not exists billing_plan varchar(30) not null default 'Professional';
alter table companies add column if not exists billing_email varchar(254) not null default '';
alter table companies add column if not exists purchase_order_reference varchar(100) not null default '';
