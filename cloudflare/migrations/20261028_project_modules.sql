-- Additive project-module schema; preserves all existing cash, Jersey and project records.
-- Each project owns a virtual order/contribution list by project_id (no table per project).
-- Existing portal_project_cards originally stores only title/description/media/link/order/active.
-- These are additive metadata columns; existing project records remain intact.
-- Apply only once on the staging/production D1 database with the corresponding Worker update.
ALTER TABLE portal_project_cards ADD COLUMN project_kind TEXT NOT NULL DEFAULT 'informasi';
ALTER TABLE portal_project_cards ADD COLUMN fund_source TEXT;
ALTER TABLE portal_project_cards ADD COLUMN fund_target_rp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE portal_project_cards ADD COLUMN linked_key TEXT;

CREATE TABLE IF NOT EXISTS portal_project_orders (
 id TEXT PRIMARY KEY,
 project_id TEXT NOT NULL,
 resident TEXT NOT NULL,
 item_name TEXT NOT NULL,
 quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0 AND quantity <= 10000),
 unit_price_rp INTEGER NOT NULL DEFAULT 0 CHECK(unit_price_rp >= 0),
 amount_due_rp INTEGER NOT NULL DEFAULT 0 CHECK(amount_due_rp >= 0),
 paid_rp INTEGER NOT NULL DEFAULT 0 CHECK(paid_rp >= 0),
 payment_method TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','dibatalkan')),
 notes TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_orders_project ON portal_project_orders(project_id, status, created_at);
CREATE TABLE IF NOT EXISTS portal_project_contributions (
 id TEXT PRIMARY KEY,
 project_id TEXT NOT NULL,
 contributor TEXT NOT NULL,
 amount_rp INTEGER NOT NULL DEFAULT 0 CHECK(amount_rp >= 0),
 payment_method TEXT NOT NULL DEFAULT '',
 contributed_on TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','dibatalkan')),
 notes TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_contributions_project ON portal_project_contributions(project_id, status, contributed_on);
