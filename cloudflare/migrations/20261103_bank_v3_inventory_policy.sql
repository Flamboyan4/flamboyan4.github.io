-- Bank Sampah v3: add-only stock, settlement, and immutable policy versioning.
-- Never rewrites historical citizen savings or bank cash journals.
CREATE TABLE IF NOT EXISTS bank_v3_policy_versions (
 id TEXT PRIMARY KEY,
 effective_from TEXT NOT NULL UNIQUE,
 method TEXT NOT NULL CHECK(method IN ('percentage','fixed_buy_price')),
 citizen_percent INTEGER NOT NULL DEFAULT 50 CHECK(citizen_percent BETWEEN 0 AND 100),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bank_v3_inventory_lots (
 id TEXT PRIMARY KEY,
 owner_kind TEXT NOT NULL CHECK(owner_kind IN ('member','bank')),
 member_id TEXT,
 source_deposit_id TEXT,
 source_line_id TEXT UNIQUE,
 request_key TEXT,
 waste_item_id TEXT NOT NULL,
 deposited_on TEXT NOT NULL,
 initial_grams INTEGER NOT NULL CHECK(initial_grams>0),
 remaining_grams INTEGER NOT NULL CHECK(remaining_grams>=0 AND remaining_grams<=initial_grams),
 reserved_batch_id TEXT CHECK(reserved_batch_id IS NULL OR reserved_batch_id!='__LOCK_FAILURE__'),
 created_by TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK((owner_kind='member' AND member_id IS NOT NULL AND source_deposit_id IS NOT NULL AND source_line_id IS NOT NULL)
    OR (owner_kind='bank' AND member_id IS NULL AND source_deposit_id IS NULL AND source_line_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS bank_v3_bank_request_line ON bank_v3_inventory_lots(request_key,waste_item_id) WHERE owner_kind='bank';
CREATE INDEX IF NOT EXISTS bank_v3_inventory_availability ON bank_v3_inventory_lots(reserved_batch_id,remaining_grams,waste_item_id);
CREATE INDEX IF NOT EXISTS bank_v3_inventory_member ON bank_v3_inventory_lots(member_id,waste_item_id);
CREATE TABLE IF NOT EXISTS bank_v3_own_events (
 request_key TEXT PRIMARY KEY,
 deposited_on TEXT NOT NULL,
 checksum TEXT NOT NULL,
 note TEXT NOT NULL DEFAULT '',
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bank_v3_batches (
 batch_id TEXT PRIMARY KEY,
 policy_id TEXT,
 method TEXT NOT NULL CHECK(method IN ('percentage','fixed_buy_price')),
 citizen_percent INTEGER NOT NULL CHECK(citizen_percent BETWEEN 0 AND 100),
 sale_id TEXT UNIQUE CHECK(sale_id IS NULL OR sale_id!='__SALE_DUPLICATE__'),
 prepared_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 prepared_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bank_v3_sale_unsold (
 sale_id TEXT NOT NULL,
 waste_item_id TEXT NOT NULL,
 unsold_grams INTEGER NOT NULL DEFAULT 0 CHECK(unsold_grams>=0),
 price_snapshot_rp_per_kg INTEGER CHECK(price_snapshot_rp_per_kg>=0),
 PRIMARY KEY(sale_id,waste_item_id)
);
CREATE TABLE IF NOT EXISTS bank_v3_inventory_movements (
 sale_id TEXT NOT NULL,
 lot_id TEXT NOT NULL,
 waste_item_id TEXT NOT NULL,
 owner_kind TEXT NOT NULL,
 member_id TEXT,
 allocated_grams INTEGER NOT NULL CHECK(allocated_grams>=0),
 sold_grams INTEGER NOT NULL CHECK(sold_grams>=0),
 stock_grams INTEGER NOT NULL CHECK(stock_grams>=0),
 loss_grams INTEGER NOT NULL CHECK(loss_grams>=0),
 sale_revenue_rp INTEGER NOT NULL CHECK(sale_revenue_rp>=0),
 member_right_rp INTEGER NOT NULL CHECK(member_right_rp>=0),
 PRIMARY KEY(sale_id,lot_id),
 CHECK(allocated_grams=sold_grams+stock_grams+loss_grams)
);
CREATE TABLE IF NOT EXISTS bank_v3_settlements (
 sale_id TEXT PRIMARY KEY,
 batch_id TEXT NOT NULL UNIQUE,
 policy_id TEXT,
 method TEXT NOT NULL,
 citizen_percent INTEGER NOT NULL,
 gross_rp INTEGER NOT NULL CHECK(gross_rp>0),
 citizen_rights_rp INTEGER NOT NULL CHECK(citizen_rights_rp>=0),
 bank_rights_rp INTEGER NOT NULL,
 weight_loss_grams INTEGER NOT NULL CHECK(weight_loss_grams>=0),
 leftover_grams INTEGER NOT NULL CHECK(leftover_grams>=0),
 note TEXT NOT NULL DEFAULT '',
 settled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(gross_rp=citizen_rights_rp+bank_rights_rp)
);
CREATE INDEX IF NOT EXISTS bank_v3_movements_member ON bank_v3_inventory_movements(member_id,sale_id);
