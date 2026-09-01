# Item Master & Party Master — Corrected Comparison (live-grounded)
**Live Postgres verified 2026-08-24.** Legacy = `AUCTOR` (Oracle). Postgres is final — no writes yet.

> Both tables **already hold live data**, so the migration must be a **MERGE/UPSERT**, not an insert.
> Key for merge: `item_code` (ItemMaster unique) and `supplier_code` (PartyMaster unique) = legacy `ITEM_CODE` / `PTY_CODE`.

---

## A. M_ITEM_MASTER → ERP.ItemMaster (m_item_master)

**Live vs legacy:** PG = **810 rows**, legacy = **820 rows**. ~10 rows differ → must reconcile by `item_code` (likely 10 legacy items not yet loaded, or code mismatches). Use upsert on `item_code`.

### Exact column mapping
| Legacy (AUCTOR) | PG column | Note |
|---|---|---|
| ITEM_CODE | item_code ✅ (unique, merge key) | |
| PART_NAME | **item_name** ✅ | Corrected: PART_NAME is the part/item name, NOT brand. |
| ITEM_DESCRIPTION | item_description ✅ | |
| UOM | unit_id | ⚠️ legacy UOM is free text; PG `unit_id` is FK→`m_unit`. **Seed m_unit + build crosswalk** (UOM string→id). |
| RATE | standard_cost | legacy purchase rate |
| STOCK_QTY | current_stock | |
| REORDER_QTY | reorder_qty ✅ | |
| STATUS ('A') | is_active (bool) | |
| CREATED_BY / UPDATED_BY | created_by / updated_by | |
| CREATED_DATE / UPDATE_DATE | created_date / updated_at | |

### Missed legacy columns → **preserved in `attributes` JSON** (PG ItemMaster HAS this column ✅)
MAT_CODE, MAT_DES, TYPE, SIZE, COLOR, MODEL, FINISH, NO_OF_PCS, LENGTH, WIDTH, THICKNESS, WEIGHT, TRANSIT_QTY, IN_ASSEMBLY, ENABLE_WEIGHT_CALC, MATERIAL_SEC, IT_CAT, M_P_IND, ITEM_GROUP, ITEM_CAT, ASSEMBLY_QTY, ITEM_TYPE, REJ_QTY, RW_QTY, SCRAP_QTY, LEN, ITEM_ID.

### PG columns with NO legacy source (default/null)
group_id, subgroup_id, type_id, subtype_id, hsn_code, gst_rate, min_stock, max_stock, reorder_level, min_order_qty, lead_time_days, default_location, abc_class, valuation_method, last_purchase_cost, moving_average_cost, mrp, track_serial, track_batch, barcode, barcode_type, approved_by, authorized_by, brand, opening_stock.

✅ **ItemMaster is safe to merge** — all legacy data is either mapped or captured in `attributes`. Only the `UOM→unit_id` crosswalk is a required pre-step.

---

## B. M_PARTY → ERP.SupplierMaster (m_party_master)

**Live vs legacy:** PG = **9 suppliers / 0 customers**; legacy = **230 rows** (PTY_TYPE: `SB`=140, `SA`=90 — both supplier types). → **All 230 load into SupplierMaster** (party_type='Supplier'; keep SB/SA distinction in `attributes` or a `supplier_category` field). CustomerMaster stays empty (legacy M_PARTY has no customers).

**Merge key:** `PTY_CODE` → `supplier_code` (unique). Upsert, do not blind-insert (would clash with the 9 existing seeded rows if codes overlap — verify first).

### Exact column mapping
| Legacy (AUCTOR) | PG column | Note |
|---|---|---|
| PTY_CODE | supplier_code ✅ (unique, merge key) | |
| PTY_NAME | supplier_name ✅ | |
| PTY_TYPE (SB/SA) | party_type ('Supplier') + attributes.sb_sa | |
| PTY_ADD1 | address_line1 | |
| PTY_ADD2 | address_line2 | PTY_ADD3 → attributes (PG has only 2 address lines) |
| PIN_CODE | pincode | |
| CITY | city ✅ | |
| PTY_STATE | state ✅ | |
| PHONE_NO1 | phone | |
| PHONE_NO2 | mobile | |
| CONT_PER | contact_person ✅ | |
| E_MAIL | email ✅ | |
| C_GST_NO / STAX_NO | gstin ✅ | prefer C_GST_NO |
| C_PAN_NO | pan_no ✅ | |

### ⚠️ PROBLEM: m_party_master has **NO `attributes` JSON column**
Unlike ItemMaster, SupplierMaster/CustomerMaster cannot store the ~25 remaining legacy columns. They would be **silently lost**:
`PTY_ADD3, PTY_SGRP, CST_NO, ECC_NO, V_CODE, MATE_CODE, PTY_JOB_DES, MAIN_GRP, DELIVERY_TIME, MIN_TON, MAX_TON, EMERGENCY, REJECTED, DOCINTIME, PROMPTNESS, WITHOUCOMP, TOT_RAT, SER_RAT, V_CODE_REQ, REMARKS, CSP_FLAG, C_CUST_CODE, C_TIN_NO, C_ECC_NO, C_USERID, C_ENTRY_DATE, C_LAST_UPDATE, ADV_AMT, BILL_AMT, SANC_AMT, PAID_AMT, BAL_AMT`.

**Fix (recommended before load):** add to `m_party_master` & `m_customer_master`:
```sql
ALTER TABLE m_party_master     ADD COLUMN attributes JSONB;
ALTER TABLE m_customer_master  ADD COLUMN attributes JSONB;
```
Then park all unmapped legacy columns in `attributes`.

### Vendor-rating fields → dedicated table
`MIN_TON, MAX_TON, EMERGENCY, REJECTED, DOCINTIME, PROMPTNESS, WITHOUCOMP, TOT_RAT, SER_RAT` → **`ERP.VendorRating` (t_vendor_rating)** (already exists, FK supplier_id). One row per party.

### PG columns with NO legacy source
gst_registration_type, msme_reg_no, msme_type, payment_terms, updated_at.

---

## C. Required pre-steps before any load
1. **ItemMaster:** seed `m_unit` and build UOM-string→`unit_id` crosswalk.
2. **PartyMaster:** `ALTER TABLE` add `attributes JSONB` to `m_party_master`/`m_customer_master`.
3. **Both:** write ETL as **upsert on the unique business key** (`item_code`, `supplier_code`); do not truncate live data.
4. **Verify** 9 existing suppliers don't collide with 230 legacy `PTY_CODE`s before load.

---

### Model files scaffolded (this session, not yet migrated)
`backend/models/ERP/HSNMaster.js`, `OperationMaster.js`, `ProductRouting.js` — auto-loaded by `ERP/index.js`. Tables created only when Sequelize sync runs.
