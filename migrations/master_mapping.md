# Masters-Only Comparison & Column Gap Analysis
**Source:** `AUCTOR` Oracle masters · **Target:** Postgres (final — analysis only, no writes)
**Scope:** Only master/reference tables. `M_EMP_MASTER` **excluded per instruction.** Transactions omitted.

---

## 0. Masters in scope (with live row counts)

| AUCTOR master | Rows | PG target | Fit |
|---|---|---|---|
| M_ITEM_MASTER | 820 | `ERP.ItemMaster` | ✅ strong (excess → `attributes` JSON) |
| M_PARTY | 230 | `ERP.SupplierMaster` + `ERP.CustomerMaster` | ✅ strong (split by PTY_TYPE) |
| M_PRODUCT_MASTER | 36 | `ERP.ProductMaster` | ✅ strong |
| M_PRODUCT_ITEM_MASTER | 1270 | `ERP.ProductItemMaster` | ✅ good |
| M_MACHINE | 7 | `ERP.MaintenanceMachine` | ✅ good |
| M_USERS | 36 | `HR.User` | ⚠️ blocked by EmployeeMaster exclusion |
| HSCODES_MASTER | 163 | *(none — fold into ItemMaster)* | ⚠️ partial |
| M_PARAM | 297 | *(scattered settings)* | ⚠️ mostly missed |
| M_OPN | 509 | *(none — operations)* | ❌ fully missed |
| M_LASTNO | 27 | internal sequence | 🗑️ skip |
| M_EMP_MASTER | 86 | `HR.EmployeeMaster` | 🚫 EXCLUDED |

---

## 1. M_ITEM_MASTER → ERP.ItemMaster (m_item_master)  [820 rows]

**Mapped:**
| Legacy | PG | Legacy | PG |
|---|---|---|---|
| ITEM_CODE | item_code ✅ | STOCK_QTY | current_stock |
| ITEM_DESCRIPTION | item_description | REORDER_QTY | reorder_qty ✅ |
| PART_NAME | brand (loose) | STATUS('A') | is_active |
| UOM | unit_id *via m_unit crosswalk* | CREATED_BY/UPDATED_BY | created_by/updated_by |
| RATE | standard_cost | CREATED_DATE/UPDATE_DATE | created_date/updated_at |

**Missed legacy columns (no PG column → store in `attributes` JSONB, which PG ItemMaster already has):**
PART_NAME (if not brand), MAT_CODE, MAT_DES, TYPE, SIZE, COLOR, MODEL, FINISH, NO_OF_PCS, LENGTH, WIDTH, THICKNESS, WEIGHT, TRANSIT_QTY, IN_ASSEMBLY, ENABLE_WEIGHT_CALC, MATERIAL_SEC, IT_CAT, M_P_IND, ITEM_GROUP, ITEM_CAT, ASSEMBLY_QTY, ITEM_TYPE, REJ_QTY, RW_QTY, SCRAP_QTY, LEN, ITEM_ID.

**PG columns with NO legacy source (default/null):** group_id, subgroup_id, type_id, subtype_id, unit_id (FK), hsn_code, gst_rate, min_stock, max_stock, reorder_level, min_order_qty, lead_time_days, default_location, abc_class, valuation_method, moving_average_cost, mrp, track_serial, track_batch, barcode, barcode_type, approved_by, authorized_by.

⚠️ **UOM/TYPE/ITEM_GROUP are strings in legacy but FKs (`unit_id`,`type_id`,`group_id`) in PG** — must seed `m_unit`/`m_item_type`/`m_item_group` and build a crosswalk, or store as text in `attributes`.

---

## 2. M_PARTY → ERP.SupplierMaster (m_party_master) + ERP.CustomerMaster (m_customer_master)  [230 rows]

Split rule: `PTY_TYPE='S'` → SupplierMaster, `PTY_TYPE='C'` → CustomerMaster.

**Mapped (SupplierMaster shown; CustomerMaster analogous):**
| Legacy | PG | Legacy | PG |
|---|---|---|---|
| PTY_CODE | supplier_code ✅ | C_PAN_NO | pan_no ✅ |
| PTY_NAME | supplier_name ✅ | C_GST_NO / STAX_NO | gstin ✅ |
| PTY_TYPE | party_type ✅ | ADV_AMT/BILL_AMT/PAID_AMT/BAL_AMT | *payment ledger (missed)* |
| PTY_ADD1 | address_line1 | CONT_PER | contact_person ✅ |
| PTY_ADD2 | address_line2 | E_MAIL | email ✅ |
| PIN_CODE | pincode | PHONE_NO1 | phone ✅ |
| CITY | city ✅ | PHONE_NO2 | mobile |
| PTY_STATE | state ✅ | C_STATUS | is_active |

**Missed legacy columns → `attributes` JSON (or `ERP.VendorRating` for ratings):**
PTY_ADD3, CST_NO, ECC_NO, V_CODE, MATE_CODE, PTY_JOB_DES, MAIN_GRP, DELIVERY_TIME, MIN_TON, MAX_TON, EMERGENCY, REJECTED, DOCINTIME, PROMPTNESS, WITHOUCOMP, TOT_RAT, SER_RAT, V_CODE_REQ, REMARKS, CSP_FLAG, C_CUST_CODE, C_TIN_NO, C_ECC_NO, C_USERID, C_ENTRY_DATE, C_LAST_UPDATE.
→ Vendor-rating fields (MIN_TON…TOT_RAT, SER_RAT) map cleanly to **`ERP.VendorRating` (t_vendor_rating)**.

**PG columns with NO legacy source:** gst_registration_type, msme_reg_no, msme_type, payment_terms, updated_at (CustomerMaster: credit_limit, credit_days → null).

---

## 3. M_PRODUCT_MASTER → ERP.ProductMaster (m_product_master)  [36 rows]

**Mapped:**
| Legacy | PG | Legacy | PG |
|---|---|---|---|
| PRODUCT_UCODE | product_uid ✅ | PART_NAME | part_name |
| PRODUCT_TYPE | product_type ✅ | PRODUCT_COLOR | color ✅ |
| PRODUCT_CODE | product_code ✅ | FINISH_TYPE | finish_type ✅ |
| DESCRIPTION | description ✅ | ASSEMBLY_QTY | assembly_qty ✅ |
| CREATED_BY/UPDATE_BY | created_by | CREATED_DATE/UPDATE_DATE | created_date/updated_at |

**Missed legacy columns (→ `attributes` JSON, PG has no columns):** PRODUCT_SIZE, PRODUCT_MATERIAL, PRODUCT_MODEL (unless folded into description).

**PG columns with NO legacy source (default):** node_type, parent_id, category_id, item_id, qty_per_pallet, is_active.

---

## 4. M_PRODUCT_ITEM_MASTER → ERP.ProductItemMaster (m_product_item_master)  [1270 rows]

**Mapped:**
| Legacy | PG | Legacy | PG |
|---|---|---|---|
| PRODUCT_ID | product_id ✅ | CREATED_DATE | created_date |
| ITEM_ID | item_id ✅ | QTY | quantity ✅ |
| PRODUCT_ITEM_ID | *(legacy id)* | | |

**Missed legacy columns (no PG column):** WEIGHT, ITEM_TYPE, ADD_IN_ASSEMBLY, SR_NO, QTY_PER_PALLET → store in `attributes` or add columns.

**PG columns with NO legacy source:** item_code, item_name (derive by joining ITEM_ID→m_item_master), unit_id, wastage_percent.

---

## 5. M_MACHINE → ERP.MaintenanceMachine (m_maintenance_machine)  [7 rows]

**Mapped:**
| Legacy | PG | Legacy | PG |
|---|---|---|---|
| MACHINE_NO | machine_code ✅ | MODEL | model_no ✅ |
| MACHINE_DES | machine_name ✅ | MACHINE_DATE | installation_date ✅ |
| MAKE | manufacturer ✅ | STATUS | status ✅ |
| MACHINE_TYPE | machine_type ✅ | DEPT_CD | department ✅ |

**Missed legacy columns (→ `attributes` JSON, no PG column):** HUR_RAT, IST_COST, NO_HUR, MCH_GRP, SUB_GRP, SUB_TYP, TRAVERSES, SAFELOAD, MANFACT_YEAR, HP, NO_OF_SHIFTS, MACHINE_ONO, UNIT, MACHINE_GRP.

**PG columns with NO legacy source:** location, serial_no, notes, updated_at.

*(Note: `ERP.ProductionMachine` m_production_machine also exists and is near-identical — pick one target, don't duplicate.)*

---

## 6. M_USERS → HR.User (Users)  [36 rows]  ⚠️ BLOCKER

**Mapped:**
| Legacy | PG | Legacy | PG |
|---|---|---|---|
| C_USER_NAME | username ✅ | C_APEX_ADMIN / C_APEX_USER | permissions (JSONB) ✅ |
| C_PASSWORD | password_hash | C_LAST_LOGON | last_login ✅ |
| C_GEMPID | empid **(FK → EmployeeMaster, EXCLUDED)** | C_PSW_CHG_DT | password_changed_at ✅ |
| C_USRID | id (legacy) | C_SHIFT_STATUS / C_DEPT… | *attributes* |

🔴 **Blocker:** `empid` is a FK to `employee_master`, which is excluded. Options:
1. Load M_USERS with `empid` **nullable** (keep legacy GEMPID as plain reference, no FK) — recommended if users are still needed for login.
2. Skip M_USERS entirely.

🔴 **Security (AGENTS.md):** `C_PASSWORD` is plaintext in legacy → **must bcrypt-hash** before insert; never copy verbatim.

**Missed legacy columns → `attributes`:** C_UNO, C_DIVNO, C_EMP_CAT, C_DEPT, C_UNIT, C_DIVISION, C_DEPARTMENT, EMPTYPE, C_APEX_ADMIN/USER already → permissions.
**PG no-source:** role (derive from EMPTYPE/C_EMP_CAT), created_at/updated_at, login_count, failed_attempts.

---

## 7. HSCODES_MASTER → *(no standalone target)*  [163 rows]  ⚠️

PG has **no `hsn_master`**. Only `ItemMaster.hsn_code` + `gst_rate` (scalar) exist.

| Legacy | Where it can go |
|---|---|
| C_HSCODE | ItemMaster.hsn_code (via ITEM_CODE crosswalk) |
| C_GST_RATE / C_CGST_RATE / C_SGST_RATE / C_IGST_RATE | ItemMaster.gst_rate (CGST+SGST only; IGST lost) |
| C_MATERIAL / C_SUB_GROUP / C_GROUP / C_SNO / C_REMARKS / C_EMPID / C_STATUS | **MISSED** — no model |

➡️ **Recommendation:** create a small `hsn_master` (hsn_code PK, material, group, sub_group, cgst/sgst/igst rates, status) and let `ItemMaster.hsn_code` reference it. Otherwise ~half the 163 rows' descriptive data is lost.

---

## 8. M_PARAM → *(scattered)*  [297 rows]  ⚠️

Columns: TYPE, CODE, DES, TYPE_DES, STATUS, MC_NO1, UT_REQ, LEAD_TIME, TOT_AVAIL_HRS.
No single PG model. `TYPE/CODE/DES` loosely resemble `m_*_settings` key/value rows (e.g. `m_engineering_settings`). **Most columns missed** unless folded into settings tables. Low priority for migration.

---

## 9. M_OPN → *(no target)*  [509 rows]  ❌

Columns: CODE, OPN_NO, OPN_DES, OPN_CODE, STATUS. **Operations master has no PG equivalent** — operations appear only as `opn1..opn5` text on issue/DC rows. All 509 rows missed unless a new `operation_master` model is created.

---

## 10. Cross-cutting notes

1. **`attributes` JSONB is the safety net** — ItemMaster, ProductMaster, etc. already have it, so "missed" columns are *preserved*, not dropped.
2. **String→FK conversions** (UOM, TYPE, ITEM_GROUP, DEPT_CD, PTY_TYPE) require seeding the referenced PG masters + a legacy→PG crosswalk table **before** load.
3. **Fiscal `YR`** absent from masters (only in transactions) — no action for masters.
4. **Passwords** (M_USERS) must be hashed; **PII** (party/employee addresses, GST/PAN) must be handled per security rules.
5. **M_LASTNO / M_EMP_MASTER** excluded/skipped.

---

### ✅ Decisions finalized (user, 2026-08-24)
- **M_USERS:** **SKIP** — no action.
- **HSCODES_MASTER (2a):** create new **`hsn_master`** model (spec below).
- **M_OPN (2b):** create new **`operation_master`** model (spec below).
- **M_PARAM (3):** **FOLD into settings** — `m_engineering_settings` (key/value) + `attributes` JSON; no dedicated model.

> Postgres DB still unchanged — these are finalized model *specs* only, awaiting your go-ahead to scaffold.

---

## 11. FINAL MODEL SPECS (to be created when migration is approved)

### 11a. `hsn_master`  (absorbs HSCODES_MASTER — 163 rows)
```text
hsn_master
  id              INTEGER PK
  hsn_code        STRING  NOT NULL   <- C_HSCODE
  material        TEXT                <- C_MATERIAL
  sub_group       STRING             <- C_SUB_GROUP
  group           STRING             <- C_GROUP
  gst_rate        DECIMAL            <- C_GST_RATE
  cgst_rate       DECIMAL            <- C_CGST_RATE
  sgst_rate       DECIMAL            <- C_SGST_RATE
  igst_rate       DECIMAL            <- C_IGST_RATE
  remarks         TEXT               <- C_REMARKS
  status          STRING             <- C_STATUS ('1'=active)
  created_by      INTEGER            <- C_EMPID
  created_date    DATE               <- C_CREATE_DT
```
`ERP.ItemMaster.hsn_code` becomes a FK → `hsn_master.hsn_code` (currently free-text). Crosswalk: `ItemMaster.hsn_code = hsn_master.hsn_code`.

### 11b. `operation_master`  (absorbs M_OPN — 509 rows)
Operation **definitions** — the catalogue of operations a product can need.
```text
operation_master
  id              INTEGER PK
  opn_code        STRING  NOT NULL   <- OPN_CODE (unique)
  opn_no          INTEGER            <- OPN_NO
  opn_des         STRING             <- OPN_DES (what the operation does)
  code            STRING             <- CODE
  department      STRING             <- (new) owning dept / work centre
  machine_type    STRING             <- (new) required machine type
  is_inspection   BOOLEAN           <- (new) marks a QC/inspection op
  std_time_min    DECIMAL           <- (new) standard cycle time (SOP timing)
  status          STRING             <- STATUS ('1'=active)
  attributes      JSON              <- future extensibility
```

### 11b-2. `product_routing`  ★ NEW IDEA — SOP / flow of work per product
A product needs an *ordered* set of operations = its SOP / work flow. This is the
"which operation + in what sequence" the user described. `opn1..opn5` on legacy
issue/DC rows become a proper, queryable routing instead of 5 loose text columns.
```text
product_routing
  id              INTEGER PK
  product_id      INTEGER FK -> m_product_master   (the product)
  product_item_id INTEGER FK -> m_product_item_master (nullable, finer level)
  operation_id    INTEGER FK -> operation_master   (the step)
  sequence_no     INTEGER NOT NULL  <- order in the flow (1,2,3…)
  station         STRING            <- work centre / bench
  is_inspection   BOOLEAN           <- QC gate at this step
  std_time_min    DECIMAL           <- planned time for this step
  routing_version STRING            <- SOP revision (e.g. v1, v2)
  is_active       BOOLEAN
  remarks         TEXT
```
Result: `SELECT operation_id, sequence_no FROM product_routing WHERE product_id=? ORDER BY sequence_no`
returns the full SOP / manufacturing flow for that product.

> Legacy `opn1..opn5` on `T_STKISS` / `T_DCHLN` / `T_JOBREQ` rows map to
> `product_routing` entries (one row per populated opnN), replacing the flat columns.

### 11c. M_PARAM → fold into settings
- Rows where `TYPE` denotes an engineering/machine param → insert into `m_engineering_settings` (key=CODE, value=DES/TYPE_DES) or a generic `m_app_settings` key/value table.
- Per-row extras (`MC_NO1`, `UT_REQ`, `LEAD_TIME`, `TOT_AVAIL_HRS`, `STATUS`) → store in an `attributes` JSON column on the settings row.
- No dedicated `m_param` model; 297 rows preserved as settings key/values.

---

## 12. Updated masters scope (final)

| AUCTOR master | Rows | Action |
|---|---|---|
| M_ITEM_MASTER | 820 | → ItemMaster (excess→attributes) |
| M_PARTY | 230 | → SupplierMaster + CustomerMaster |
| M_PRODUCT_MASTER | 36 | → ProductMaster |
| M_PRODUCT_ITEM_MASTER | 1270 | → ProductItemMaster |
| M_MACHINE | 7 | → MaintenanceMachine |
| HSCODES_MASTER | 163 | → **new hsn_master** (GST: HSN + CGST/SGST/IGST rates) |
| M_OPN | 509 | → **new operation_master** + **product_routing** (SOP/flow) |
| M_PARAM | 297 | → **fold into settings** |
| M_USERS | 36 | 🚫 SKIP |
| M_EMP_MASTER | 86 | 🚫 EXCLUDED |
| M_LASTNO | 27 | 🗑️ skip (internal) |

*No data written to Postgres. This is review-only.*
