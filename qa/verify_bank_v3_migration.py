#!/usr/bin/env python3
"""Bank v3 additive migration tests. In-memory only; never connects to D1."""
import pathlib, sqlite3
sql=pathlib.Path("cloudflare/migrations/20261103_bank_v3_inventory_policy.sql").read_text()
database=sqlite3.connect(":memory:")
database.executescript(sql)
database.executescript(sql)
names={r[0] for r in database.execute("SELECT name FROM sqlite_master WHERE type='table'")}
assert len([n for n in names if n.startswith("bank_v3_")])==7,names
db=database
db.execute("INSERT INTO bank_v3_policy_versions(id,effective_from,method,citizen_percent,created_by) VALUES('p1','2026-11-03','percentage',50,'admin')")
db.execute("INSERT INTO bank_v3_policy_versions(id,effective_from,method,citizen_percent,created_by) VALUES('p2','2026-12-01','fixed_buy_price',50,'admin')")
try:
 db.execute("UPDATE bank_v3_policy_versions SET effective_from='2026-11-03' WHERE id='p2'")
 raise AssertionError("policy date uniqueness bypassed")
except sqlite3.IntegrityError:pass
db.execute("INSERT INTO bank_v3_own_events(request_key,deposited_on,checksum,note,created_by) VALUES('stock1','2026-11-03','hash','', 'admin')")
db.execute("INSERT INTO bank_v3_inventory_lots(id,owner_kind,request_key,waste_item_id,deposited_on,initial_grams,remaining_grams,created_by) VALUES('lot1','bank','stock1','waste:kardus','2026-11-03',2000,2000,'admin')")
db.execute("INSERT INTO bank_v3_batches(batch_id,policy_id,method,citizen_percent,prepared_by) VALUES('batch1','p2','fixed_buy_price',50,'admin')")
db.execute("UPDATE bank_v3_inventory_lots SET reserved_batch_id='batch1' WHERE id='lot1'")
assert db.execute("SELECT reserved_batch_id FROM bank_v3_inventory_lots WHERE id='lot1'").fetchone()[0]=='batch1'
try:
 db.execute("UPDATE bank_v3_inventory_lots SET reserved_batch_id='__LOCK_FAILURE__' WHERE id='lot1'")
 raise AssertionError("reservation lock failure sentinel bypassed")
except sqlite3.IntegrityError:pass
db.execute("UPDATE bank_v3_batches SET sale_id='sale1' WHERE batch_id='batch1'")
try:
 db.execute("UPDATE bank_v3_batches SET sale_id='__SALE_DUPLICATE__' WHERE batch_id='batch1'")
 raise AssertionError("double-sale sentinel bypassed")
except sqlite3.IntegrityError:pass
db.execute("INSERT INTO bank_v3_sale_unsold(sale_id,waste_item_id,unsold_grams,price_snapshot_rp_per_kg) VALUES('sale1','waste:kardus',400,1000)")
db.execute("INSERT INTO bank_v3_inventory_movements(sale_id,lot_id,waste_item_id,owner_kind,member_id,allocated_grams,sold_grams,stock_grams,loss_grams,sale_revenue_rp,member_right_rp) VALUES('sale1','lot1','waste:kardus','bank',NULL,2000,1500,400,100,3000,0)")
db.execute("INSERT INTO bank_v3_settlements(sale_id,batch_id,policy_id,method,citizen_percent,gross_rp,citizen_rights_rp,bank_rights_rp,weight_loss_grams,leftover_grams,note) VALUES('sale1','batch1','p2','fixed_buy_price',50,3000,0,3000,100,400,'test')")
try:
 db.execute("INSERT INTO bank_v3_settlements(sale_id,batch_id,policy_id,method,citizen_percent,gross_rp,citizen_rights_rp,bank_rights_rp,weight_loss_grams,leftover_grams,note) VALUES('sale2','batch1','p2','fixed_buy_price',50,3000,0,3000,0,0,'duplicate')")
 raise AssertionError("double confirm bypassed")
except sqlite3.IntegrityError:pass
try:
 db.execute("INSERT INTO bank_v3_inventory_movements(sale_id,lot_id,waste_item_id,owner_kind,member_id,allocated_grams,sold_grams,stock_grams,loss_grams,sale_revenue_rp,member_right_rp) VALUES('sale1','lot1','waste:kardus','bank',NULL,2000,1600,300,100,3200,0)")
 raise AssertionError("movement replay bypassed")
except sqlite3.IntegrityError:pass
try:
 db.execute("UPDATE bank_v3_inventory_lots SET remaining_grams=-1 WHERE id='lot1'")
 raise AssertionError("negative inventory bypassed")
except sqlite3.IntegrityError:pass
db.commit()
assert db.execute("SELECT COUNT(*) FROM bank_v3_inventory_movements").fetchone()[0]==1
assert db.execute("SELECT remaining_grams FROM bank_v3_inventory_lots WHERE id='lot1'").fetchone()[0]==2000
print("BANK_V3_ADDITIVE_SCHEMA_AND_UNIQUE_GUARDS_OK")
