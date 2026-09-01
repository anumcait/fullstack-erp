# Database Comparison — AUCTOR (Legacy Oracle ERP) vs Postgres App Target

> **Scope:** Analysis only. Postgres is the *final* version — nothing here is written to it.
> **Source:** `AUCTOR` schema, Oracle XE 21c, Data Pump schema export `20260824_093001.dmp` (42 tables + 2 internal).
> **Target:** Postgres 17, 146 Sequelize models across `HR.*`, `ERP.*`, `Accounts.*` (see `target_inventory.md`).
> **Reference data:** `migrations/legacy/ddl/source_schema.md`, `migrations/legacy/ddl/count_rows.sql` (row counts).

---

## 1. Headline Verdict

| Area | Verdict |
|---|---|
| Master data (Item / Party / Employee / User / Product / Machine) | ✅ Strong overlap — migratable with column mapping |
| Stores transactions (Indent, GRN, Issue, DC, Debit Bill) | ⚠️ Concept overlaps but **structure differs** (legacy uses `*_MAIN` + detail + fiscal `YR` partitioning; PG uses surrogate `id` + header/detail) |
| Production / Manufacturing execution (Job Orders, BOM, Production, Reject, Scrap, MRS) | ⚠️ Partial — header-level maps, but several execution tables have **no PG target** |
| Costing / Box / Daily stock balance / Operations masters / Amendments | ❌ No target model — new models required if full migration is chosen |

**Bottom line:** The PG app already covers the *masters* and the *stores/GRN/DC/invoice* lifecycle well. The legacy ERP's **manufacturing execution layer** (production entry, reject, scrap, MRS, job-works, job-dev, cost) and several standalone trackers (box, daily open-balance, operations, amendments) are **not represented** in the current PG model set.

---

## 2. Table-by-Table Mapping (with row counts)

Legend: ✅ direct match · ⚠️ partial/concept match · ❌ no target · 🗑️ internal/junk (ignore)

| # | AUCTOR table | Rows | Best PG target | Status | Notes |
|---|---|---|---|---|---|
| 1 | M_ITEM_MASTER | 820 | `ERP.ItemMaster` (m_item_master) | ✅ | item_code, item_description, uom, hsn→hsn_code, gst_rate, reorder_qty→reorder_qty. `MAT_CODE/DES`, `LENGTH/WIDTH/THICKNESS/WEIGHT`, `STOCK_QTY`, `REJ_QTY/RW_QTY/SCRAP_QTY`, `ASSEMBLY_QTY`, `ITEM_GROUP/CAT` map well. |
| 2 | M_PARTY | 230 | `ERP.SupplierMaster` (m_party_master) + `ERP.CustomerMaster` | ✅ | PTY_CODE→supplier_code, PTY_NAME→supplier_name, PTY_TYPE splits supplier vs customer. Address/contact/GST/PAN all present in target. Legacy also carries vendor-rating columns (MIN_TON…TOT_RAT) → `ERP.VendorRating`. |
| 3 | M_EMP_MASTER | 86 | `HR.EmployeeMaster` (employee_master) | ✅ | Near 1:1. EMPID→empid (PK), ENAME, FNAME, DOB, GENDER, MARITAL_STATUS, addresses, PHOTO→photo_blob, EMPLOYEE_PROFILE, SUMMARY, C_EMP_LEFT_*→left_date/left_reason. Legacy uses NUMBER/CHAR; PG uses INTEGER/STRING. |
| 4 | M_EMP | 0 | `HR.EmployeeMaster` | ✅ | Empty duplicate/legacy of M_EMP_MASTER — skip. |
| 5 | M_USERS | 36 | `HR.User` (Users) | ✅ | C_USRID→PK, C_USER_NAME, C_PASSWORD, C_DEPT/C_DIVISION/C_DEPARTMENT, C_GEMPID→gempid. **Security:** legacy `C_PASSWORD` is plaintext/VARCHAR2(512) — must be **bcrypt-hashed** before load (AGENTS.md security rule). |
| 6 | M_USER_PAGE_ACCESS | 27 | (no direct model) | ⚠️ | Page/role access. Could map to a new `user_role`/`user_page_access` model or RBAC table. PG currently has no equivalent. |
| 7 | M_PRODUCT_MASTER | 36 | `ERP.ProductMaster` (m_product_master) | ✅ | PRODUCT_ID, PRODUCT_CODE, PRODUCT_TYPE, PRODUCT_MODEL, DESCRIPTION, SIZE/COLOR/MATERIAL, FINISH_TYPE, ASSEMBLY_QTY all present. |
| 8 | M_PRODUCT_ITEM_MASTER | 1270 | `ERP.ProductItemMaster` (m_product_item_master) | ✅ | PRODUCT_ITEM_ID, PRODUCT_ID, ITEM_ID, QTY, WEIGHT, ITEM_TYPE present. Link via product_id/item_id FKs. |
| 9 | M_MACHINE | 7 | `ERP.ProductionMachine` (m_production_machine) / `ERP.MaintenanceMachine` | ✅ | MACHINE_NO, MACHINE_DES, MAKE, STATUS, DEPT_CD, MODEL, MANFACT_YEAR, HP, NO_OF_SHIFTS all present. |
| 10 | HSCODES_MASTER | 163 | `ERP.ItemMaster.hsn_code` (lookup) | ⚠️ | No standalone HS-code model in PG. The `C_HSCODE/C_GST_RATE/C_CGST_RATE…` values are stored *denormalized* on each ItemMaster row. Migrate as a reference to populate `hsn_code`+`gst_rate` on items, or create a new `hsn_master`. |
| 11 | T_OPN | 509 | (no target) | ❌ | Operations master (OPN_NO/OPN_DES/OPN_CODE). PG has no "operation" entity; operations appear only as `opn1..opn5` free-text-ish on issue/DC rows. **Gap — new `operation_master` model if operations must be first-class.** |
| 12 | M_PARAM | 297 | `ERP.*Settings` (partial) | ⚠️ | Machine/param reference data (TYPE/CODE/DES/LEAD_TIME). Spreads across `m_*_settings` tables; no single target. Mostly reference/config — low priority. |
| 13 | M_LASTNO | 27 | (internal) | 🗑️ | Sequence/number generator for legacy docs. Not needed in PG (uses SERIAL/auto-inc). Skip. |
| 14 | T_JOBREQ | 1551 | `ERP.MaterialRequisition` (t_material_requisition) | ⚠️ | INDENT_NO→req_no, INDENT_DT→req_date, INDENT_BY→requested_by, DEPT_CD/SUB_DEPT→department, STATUS. Rich columns (OPN_1..5, QTY, RATE, WO_NO, PTY_CODE, purpose, sanction fields) overflow the slim PG requisition header — excess goes to the **item** row or is dropped. |
| 15 | T_JOBREQ_MAIN | 955 | `ERP.MaterialRequisition` (header) | ⚠️ | Header of T_JOBREQ (INDENT_NO, DEPT_CD, YR, STATUS). Consolidate into one requisition row in PG (legacy splits header/detail across tables). |
| 16 | T_JOBREQ_DRAFT | 1583 | `ERP.MaterialRequisition` (draft) | ⚠️ | Draft version of T_JOBREQ. Map to requisitions with `status='DRAFT'` or a separate draft flag. |
| 17 | T_AMDJOBREQ | 71 | `ERP.PRAmendment` (t_pr_amendment) | ⚠️ | Indent amendment. PG `t_pr_amendment` is PR-focused; looser fit. **Partial gap.** |
| 18 | T_IR | 1320 | `ERP.GRN` (ir) + `ERP.GRNItem` (t_ir_item) | ⚠️ | MIS_NO→ir_no, MIS_DT→ir_date, PTY_CODE→supplier_id, ITEM_CODE, QTY_SUPP/ACCP/REJ, RATE/VALUE, WO_NO, DC_NO. Very close to GRN + GRNItem. Extra columns (BOX_NO, KG_*, VAN_* ratings, dimensions) need mapping or drop. |
| 19 | T_IR_MAIN | 833 | `ERP.GRN` (header) | ⚠️ | GRN header (MIS_NO, DEPT_CD, YR, PTY_CODE, INWARD_DT, STATUS). Consolidate with T_IR. |
| 20 | T_STKISS | 956 | `ERP.MaterialIssue` (t_material_issue) + Item | ⚠️ | ISS_NO→issue_no, ISS_DT→issue_date, DEPT_NO→department, INDENT_TNO→req_id, ITEM_CODE, QTY_REQ/ISS, WO_NO, PR_NO. Close to MaterialIssue + Item. |
| 21 | T_STKISS_MAIN | 908 | `ERP.MaterialIssue` (header) | ⚠️ | Issue header. Consolidate. |
| 22 | T_DCDESP | 18 | `ERP.DeliveryChallan` (t_delivery_challan) + Item | ⚠️ | DC_NO→dc_no, DC_DT→dc_date, PTY_CODE→party_id, WO_NO, ITEM_CODE, QTY_ISS/REJ, ORDER_NO, JO_NO, STATUS, cancellation fields. Strong match. |
| 23 | T_DCDESP_MAIN | 9 | `ERP.DeliveryChallan` (header) | ⚠️ | DC header. Consolidate. |
| 24 | T_DCHLN | 15 | `ERP.DeliveryChallan` (t_delivery_challan) | ⚠️ | Challan (DC_TYP, PTY_CD, JO_NO, ITEM_CODE, BOX_NO, QTY_SUPP, UOM, RATE). Overlaps T_DCDESP — likely legacy "challan" vs "despatch" distinction. Map both to DeliveryChallan with `dc_type`. |
| 25 | T_DCHLN_MAIN | 10 | `ERP.DeliveryChallan` (header) | ⚠️ | Challan header. Consolidate. |
| 26 | T_DBILL | 1241 | `ERP.Invoice` (t_invoice) + Item **or** `Accounts.Voucher` | ⚠️ | Debit bill (purchase-side). PTY_CODE→party_id, BILL_NO→invoice_no, BILL_DT, ITEM_CODE, QTY_ACCP, RATE, CGST/SGST/IGST, BASIC_AMT. Closest to `Invoice` (type=debit/purchase) or a purchase `Voucher`. **Decision needed:** invoice vs voucher. |
| 27 | T_DBILL_MAIN | 767 | `ERP.Invoice` (header) | ⚠️ | Debit-bill header (SYS_NO, DEPT_CD, BILL_TYPE, YR). Consolidate. |
| 28 | T_CSTMRR | 17 | `ERP.MaterialReturn` (t_material_return) ⚠️ | ❌/⚠️ | Customer return/rejection (MRR_NO, DC_NO, PTY_CODE, JO_NO, QTY, VALUE). PG `MaterialReturn` is stores-return; a customer-return module is **absent**. Partial via MaterialReturn or new model. |
| 29 | T_CSTMRR_MAIN | 9 | `ERP.MaterialReturn` (header) | ⚠️ | Customer-return header. Consolidate. |
| 30 | M_JO | 491 | `ERP.JobOrder` (t_production_order) | ⚠️ | JO_NO→order_no, JO_DT→jo_date, PTY_CODE→party_id, GRD_TOT/BILL_AMT/AMT_PAID, terms/payment/insurance/freight all present; very close to JobOrder. |
| 31 | M_JOITM | 849 | `ERP.JobOrderItem` (t_production_order_item) | ⚠️ | JO item (JO_NO, ITEM_CODE, JO_QTY→required_quantity, RATE/VALUE, dimensions, taxes). Strong match to JobOrderItem. |
| 32 | M_JOB_ORDER | 87 | `ERP.JobOrder` (t_production_order) | ⚠️ | Alternate JO table (WO_NO, ITEM_DES, QTY, RATE, taxes, cancel status). May duplicate M_JO — confirm which is authoritative. |
| 33 | M_JOBORDER_INFO | 21 | `ERP.JobOrder` (extra info) | ⚠️ | JO descriptive/terms (SUBJECT, REFERENCE, QCA_REQ, PAY_TERM, etc.). Maps to JobOrder text columns. |
| 34 | M_JOAMD | 102 | (no direct) | ❌ | Job-order amendment (AMD_NO, JO_NO, INDENT_NO, ITEM_CODE, taxes). **Gap — no JO-amendment model in PG.** |
| 35 | M_JOAMDAS | 102 | (no direct) | ❌ | JO amendment (audit/as-made). Same gap as M_JOAMD. |
| 36 | T_PRODUCT_ITEM_BOM | 39 | `ERP.BOM` (t_bom) + `ERP.BOMItem` (t_bom_item) | ⚠️ | BOM (BOM_NO, PRODUCT_ID, BOM_QTY, ITEM_CODE, ITEM_QTY, WEIGHT, STATUS). Maps to BOM + BOMItem. |
| 37 | T_ORDER_DETAILS | 13 | `ERP.SalesOrder` (t_sales_orders) + Item | ⚠️ | Sales order (PTY_CODE, ORDER_NO, ORDER_DATE, PRODUCT_ID, ORDER_QTY, dispatch/schedule, UOM). Maps to SalesOrder + Item. |
| 38 | T_NEWBOX | 4 | (no direct) | ❌ | Box / WT tracking (BOX_NO, QTY_PROD/ACCP/RW/REJ, IN/OUT_TIME, PLND/ACT). **Gap — no box-tracking model.** |
| 39 | M_ITEM_OPENBAL_DAY_INFO | 76 | `ERP.ItemMaster.opening_stock` (scalar) ⚠️ | ❌ | Daily opening/prod/issue/balance ledger per item. PG stores only a scalar `opening_stock` — **no day-wise ledger**. Gap or use `ERP.StockLedger`. |
| 40 | T_POAMD | 2 | (no direct) | ❌ | PO amendment (AMD_NO, PO_NO, subject/body). **Gap — no PO-amendment model.** |
| 41 | W_JO | 0 | (no direct) | ❌ | Work-order header. **Gap** (empty in source). |
| 42 | W_JOITM | 15 | (no direct) | ❌ | Work-order items. **Gap.** |
| — | T_MISCOST / T_MISCOST_MAIN | 0 | (no direct) | ❌ | Misc costing. **Gap** (empty). |
| — | T_PRODUCTION / T_PRODUCTION_ENTRY / T_PRODUCTION_MAIN | 0 | `ERP.ProductionDailyEntry`? | ❌ | Production entry. PG has `t_production_daily_entry` but legacy structure differs; **Gap** (empty). |
| — | T_REJECT / T_REJECT_MAIN | 0 | (no direct) | ❌ | Reject tracking. **Gap** (empty). |
| — | T_SCRAP / T_SCRAP_MAIN | 0 | (no direct) | ❌ | Scrap tracking. **Gap** (empty). |
| — | T_MRS_MAIN / T_MRS_DET | 0 | (no direct) | ❌ | Material Return/Shipment (MRS). **Gap** (empty). |
| — | T_JOBWORKS / T_JOBWORKS_MAIN | 0 | (no direct) | ❌ | Job works. **Gap** (empty). |
| — | T_JOBDEV / T_JOBDEV_ITEMCODES | 0 | (no direct) | ❌ | Job development. **Gap** (empty). |
| — | T_STKISS_REV_BKP | 0 | (no direct) | 🗑️ | Backup/reversal table. Skip. |
| — | TEST_TAB | 1 | — | 🗑️ | Test table. Skip. |
| — | SYS_EXPORT_SCHEMA_02 | — | — | 🗑️ | Data Pump internal metadata table. Skip. |
| — | M_MATMST / M_OPERATION | 0 | — | 🗑️ | Empty legacy masters. Skip. |

---

## 3. Category Summary

### ✅ Masters — migratable now (with column mapping)
`M_ITEM_MASTER`, `M_PARTY`, `M_EMP_MASTER`, `M_USERS`, `M_PRODUCT_MASTER`, `M_PRODUCT_ITEM_MASTER`, `M_MACHINE`.
These cover **~2,389 rows** of clean reference data and are the highest-value, lowest-risk migration.

### ⚠️ Transactions — concept matches, structure differs
`T_JOBREQ`(+MAIN/DRAFT), `T_IR`(+MAIN), `T_STKISS`(+MAIN), `T_DCDESP`(+MAIN)/`T_DCHLN`(+MAIN), `T_DBILL`(+MAIN), `T_CSTMRR`(+MAIN), `M_JO`(+ITM/INFO/`M_JOB_ORDER`), `T_PRODUCT_ITEM_BOM`, `T_ORDER_DETAILS`.
Common legacy pattern: **`*_MAIN` header + detail table + fiscal `YR`/`REFNO` columns**. PG consolidates these into a single header row (`id` PK) + a `*_item` detail table. ETL must **join header+detail and collapse `YR` into a `financial_year` reference** rather than a partitioning key.

### ❌ No target model — new models needed for full migration
`T_OPN` (operations), `M_JOAMD`/`M_JOAMDAS` (JO amendment), `T_POAMD` (PO amendment), `T_CSTMRR` full customer-return, `T_NEWBOX` (box/WT), `M_ITEM_OPENBAL_DAY_INFO` (daily stock ledger), `W_JO`/`W_JOITM` (work order), and the empty manufacturing-execution cluster (`T_PRODUCTION*`, `T_REJECT*`, `T_SCRAP*`, `T_MRS_*`, `T_JOBWORKS*`, `T_JOBDEV*`, `T_MISCOST*`).

---

## 4. Data-Type Translation (Oracle → Postgres)

| Oracle type | Postgres / Sequelize | Notes |
|---|---|---|
| `NUMBER(22)` (surrogate/key) | `BIGINT` / `INTEGER` | PG uses `INTEGER` surrogate `id` PK; legacy NUMBER keys become FKs or are dropped. |
| `NUMBER(p,s)` (money/qty) | `DECIMAL(p,s)` / `NUMERIC` | Use `DECIMAL` for rate/value/tax amounts. |
| `VARCHAR2(n)` (BYTE) | `VARCHAR(n)` / `TEXT` | BYTE→CHAR semantics; prefer `TEXT` for remarks/descriptions. |
| `CHAR(1)` / `CHAR(n)` | `STRING` / `CHAR(1)` / `ENUM` | Status flags → `ENUM` or `STRING` + check constraint. |
| `DATE` | `DATE` / `DATEONLY` | PG `DATE` (no time) vs `TIMESTAMP`. Legacy `DATE` carries time in some rows → map to `DATE` with care. |
| `TIMESTAMP` | `DATE` (Sequelize DATE = timestamp) | Direct. |
| `CLOB` | `TEXT` | Direct. |
| `BLOB` | `BYTEA` | `PHOTO`, `IMG_BLOB` → `photo_blob BYTEA`. |
| `VARCHAR2` flags like `STATUS CHAR(1)` | `STRING` | Keep as string; do not force numeric. |

**Encoding/semantics gotcha:** Legacy `VARCHAR2(n)` is **BYTE** length; PG `VARCHAR(n)` is **CHAR** length. For multilingual/CSSI data, widen or use `TEXT` to avoid truncation.

---

## 5. Key & Identity Mapping

- **Surrogate keys:** Legacy uses `NUMBER(22)` business/sequence keys (often **no explicit PK** in extracted DDL — `NOT NULL` only). PG uses `INTEGER id` PK + unique business columns. → Generate new PG `id`s; keep legacy keys as `*_legacy_id` if referential traceability is required.
- **Fiscal partitioning:** Legacy spreads data by `YR` + `REFNO` (e.g. `INDENT_NO`+`YR`). PG has no such partition — fold `YR` into a `financial_year_id` FK (target has `Accounts.FinancialYear`).
- **Composite business keys → header/detail:** `*_MAIN` (header) + detail table must be **joined** into one PG header (`t_*` table) + child (`t_*_item`) during ETL.
- **Cross references:** `PTY_CODE`→`m_party_master.supplier_code`, `ITEM_CODE`→`m_item_master.item_code`, `JO_NO`→`t_production_order.order_no`, `WO_NO`→work-order (gap). Build a **legacy→PG key-crosswalk table** before load.

---

## 6. Suggested Migration Sequence (FK-safe, *proposed only*)

1. Reference/settings: `HSCODES_MASTER`, `M_PARAM`, `M_OPN` (ops) → load first.
2. Masters: `M_PARTY` → `M_ITEM_MASTER` → `M_PRODUCT_MASTER` → `M_PRODUCT_ITEM_MASTER` → `M_MACHINE` → `M_EMP_MASTER` → `M_USERS` (hash passwords).
3. Transactions (date-asc, FK order): `T_JOBREQ*` → `T_IR*` → `T_STKISS*` → `T_DCDESP*`/`T_DCHLN*` → `T_DBILL*` → `T_CSTMRR*` → `M_JO*` → `T_PRODUCT_ITEM_BOM` → `T_ORDER_DETAILS`.
4. Gaps (only if full migration approved): create `operation_master`, `*_amendment`, `box_tracking`, `daily_stock_balance`, `work_order*` + manufacturing-execution models.

---

## 7. Row-Count Appendix (from `count_rows.sql`)

Real-data tables (non-zero):
```
HSCODES_MASTER=163   M_EMP_MASTER=86      M_ITEM_MASTER=820     M_ITEM_OPENBAL_DAY_INFO=76
M_JO=491             M_JOAMD=102          M_JOAMDAS=102         M_JOBORDER_INFO=21
M_JOB_ORDER=87       M_JOITM=849          M_LASTNO=27           M_MACHINE=7
M_PARAM=297          M_PARTY=230          M_PRODUCT_ITEM_MASTER=1270  M_PRODUCT_MASTER=36
M_USERS=36           M_USER_PAGE_ACCESS=27  T_AMDJOBREQ=71      T_CSTMRR=17
T_CSTMRR_MAIN=9      T_DBILL=1241         T_DBILL_MAIN=767      T_DCDESP=18
T_DCDESP_MAIN=9      T_DCHLN=15           T_DCHLN_MAIN=10       T_IR=1320
T_IR_MAIN=833        T_JOBREQ=1551        T_JOBREQ_DRAFT=1583   T_JOBREQ_MAIN=955
T_OPN=509            T_ORDER_DETAILS=13   T_POAMD=2             T_PRODUCT_ITEM_BOM=39
T_STKISS=956         T_STKISS_MAIN=908    T_NEWBOX=4            W_JOITM=15
```
Zero-row (structure-only / empty): `M_EMP`, `M_MATMST`, `M_OPERATION`, `T_JOBDEV`, `T_JOBDEV_ITEMCODES`, `T_JOBWORKS(+MAIN)`, `T_JOB_BILL`, `T_MISCOST(+MAIN)`, `T_MRS_DET/MAIN`, `T_PRODUCTION(+ENTRY/MAIN)`, `T_PTY_CHK`, `T_REJECT(+MAIN)`, `T_SCRAP(+MAIN)`, `T_STKISS_REV_BKP`, `W_JO`.
Junk (skip): `TEST_TAB=1`, `SYS_EXPORT_SCHEMA_02`.

---

*Generated for schema-review phase. No data was written to Postgres. Next step (on user approval): decide masters-only vs full migration and create the missing PG models for the ❌ gap tables.*
