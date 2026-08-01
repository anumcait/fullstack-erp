# Stores & Inventory Module — Comprehensive Review & Implementation Report

## 1. Business Understanding

The Stores & Inventory module manages the full lifecycle of raw materials and components for a fan manufacturing company:

- **Purchase Inward** (GRN from suppliers) → increases stock
- **Material Issue** (consumption to production) → decreases stock
- **Material Return** (return to supplier / return from production) → adjusts stock
- **Delivery Challan** (dispatch to customers) → decreases stock
- **DC Return** → increases stock back
- **Stock Audit / Adjustment** → corrects physical vs book stock
- **Job Order Production** → production in / production consumption
- **Opening Stock** → initial balance at go-live

**Core business requirement:** A *bank-account-style stock statement* — an item-wise ledger showing **Opening Stock + Inward − Outward = Closing Stock** with a running balance, for any item, any date range, any warehouse. Plus management reporting (valuation, aging, slow/fast-moving, dead stock, negative stock, profit/loss, audit trail, reconciliation).

## 2. Existing Features (Before This Work) — Ratings

| Module | Rating (1-10) | Notes |
|---|---|---|
| GRN (Purchase Inward) | 6 | Good doc flow; but stock update was non-atomic, no ledger |
| Material Issue | 5 | Working, but **delete/update did not reverse stock** |
| Material Return | 4 | Same reversal gap; return_type split (supplier/production) |
| Delivery Challan / DC Return | 4 | Approve adjusted stock non-atomically; no ledger |
| Job Order (Production) | 5 | Issue material + completion adjusted stock inline |
| Stock Audit / Adjustment | 5 | Approve adjusted stock; no transaction |
| Item Master | 7 | Good structure: groups, sub-groups, units, batch/serial flags |
| Warehouse / Location | 2 | **No models/tables** — free-text strings only |
| Batch / Serial tracking | 2 | Flags exist but no wired batch master/forms |
| Reports | 4 | Several, but all computed from live tables; **no ledger**, no as-of valuation |
| Dashboard | 5 | KPIs present but stale/duplicated logic |
| **Stock Ledger / Statement** | **1** | **Entirely missing** — this was the core gap |

## 3. Missing Features & Business Impact

| # | Missing Feature | Users | Business Impact if Missing | Implementation Status |
|---|---|---|---|---|
| 1 | **Stock Ledger (bank-account style)** | Accounts, Store, Purchase, Management | No traceability; can't prove stock balance, answer audit/insurance, or investigate shrinkage | ✅ Implemented (`t_stock_ledger`, `/inventory/statement`, `/inventory/stock-ledger`) |
| 2 | **Historical stock as of any date** | Management, Auditors | Cannot compute month-end valuation, GST/audit value, or period P&L | ✅ Implemented (ledger-driven, never reads `current_stock`) |
| 3 | **Warehouse master** | Store, Purchase | Stock "whereabouts" unknown; no multi-location valuation | ✅ Implemented (`m_warehouse`, CRUD + wise report) |
| 4 | **Batch master + batch valuation** | Quality, Store | No expiry/lot traceability; recall impossible | ✅ Batch table + report; forms still use free text (next step) |
| 5 | **Atomic stock updates (transactions + row lock)** | All | Lost updates under concurrency → wrong stock | ✅ Implemented (central `stockService`, `SELECT ... FOR UPDATE`) |
| 6 | **Reversal on delete/cancel** | Accounts, Audit | Deleting a GRN/Issue left stock permanently wrong | ✅ Implemented for GRN, Material Issue, Material Return, DC |
| 7 | **Stock reconciliation (ledger vs system)** | Store, Accounts | Undetected drift between book and physical | ✅ Implemented (`/inventory/reconciliation`) |
| 8 | **Stock aging, slow/fast/dead/negative** | Management, Store | Working capital stuck in dead stock undetected | ✅ Implemented |
| 9 | **Item-level P&L (sales − COGS)** | Management, Sales | Can't know profitable items | ✅ Implemented (`/inventory/profit-loss`) |
| 10 | **Audit trail** | Auditors, Compliance | No answer to "who changed stock, when, why" | ✅ Implemented (`created_by`, `reversal_of`, audit report) |
| 11 | Sales/Sales-Return posting from Billing | Accounts | Only DC dispatch is captured; billed sales not posted to ledger | ⏳ Next step (wire Invoice → ledger) |
| 12 | Gate Entry item linking (item_id FK) | Store | Gate items stored as free text — no stock traceability | ⏳ Next step |
| 13 | Transfer in/out, Damage, Wastage transaction types | Store | Real movements not captured | ⏳ `REF_TYPES` ready; wire forms |

## 4. ERP Best Practices

- **Ledger is the source of truth** — never mutate a balance without an immutable, timestamped, attributable ledger row. ✅ Done.
- **Single stock service** — every movement goes through `stockService.postMovement()` inside a transaction; no controller does ad-hoc arithmetic anymore. ✅ Done.
- **Reversal (not hard delete)** of stock effects — cancel/deletes post reverse ledger rows linked via `reversal_of`. ✅ Done.
- **Audit fields** on every ledger row (`created_by`, `created_date`). ✅ Done.
- **Moving-average cost** maintained on movement, not in report queries. ✅ Done.
- **As-of reporting** never trusts a mutable balance column. ✅ Done.
- **Negative-stock guard** (except adjustments) to prevent issues exceeding available. ✅ Done.

## 5. Database Issues Found & Fixed

| Issue | Severity | Fix |
|---|---|---|
| No stock ledger table — only mutable `current_stock` column | Critical | Created `t_stock_ledger` (append-only, indexed on item/date/warehouse/ref_type) |
| No warehouse/batch models (free-text strings) | High | Created `m_warehouse`, `m_item_batch` + Sequelize models |
| Two divergent cost columns (`rate` vs `moving_average_cost`) | Medium | Reports now use `COALESCE(moving_average_cost, standard_cost)`; kept both as-is for compatibility |
| Legacy items with `current_stock > 0` had no ledger opening | High | Backfill script posted 508 Opening Stock ledger entries |
| Orphan SQL tables (`m_item_batch`, `m_rack`) with no model | Medium | `m_item_batch` now has a model; `m_rack` still requires a Location model (next step) |

## 6. Code Quality Issues

- Controllers previously duplicated ad-hoc `findByPk → compute → update` stock logic (12 sites). Now centralized in `backend/utils/stockService.js`. ✅
- Stock mutations were **not wrapped in transactions**; a partial failure could corrupt balances. All movement paths now transactional. ✅
- Old `stockLedgerController` fabricated a ledger from only 3 sources (GRN, Material Issue, Material Return) and missed DC / Job Order / Audit movements — replaced by real ledger queries. ✅

## 7. UI/UX Issues

- No Warehouse/Batch master screens existed → created `WarehouseMaster.jsx`, `BatchMaster.jsx`. ✅
- Stock ledger page existed but lacked warehouse filter, running balance, valuation columns → rewritten. ✅
- **Bank-account-style Stock Statement page** was the headline requirement → created `StockStatement.jsx` (Opening / Inward / Outward / Closing summary + itemised ledger). ✅
- StoresReports extended to 16 tabs. ⏳ Remaining: wire batch lookup + warehouse picker into Material Issue / GRN forms.

## 8. Performance Issues

- Report queries are **aggregate-ledger SQL** (single pass, indexed) rather than N+1 JS loops. ✅
- Added composite indexes on `t_stock_ledger (item_id, ledger_date)`. ✅
- As-of valuation uses one `GROUP BY` query. ✅
- Remaining: paginate ledger grids on very high-volume items; materialised summary for the dashboard (next step).

## 9. Security Issues

- Routes are auth-checked via JWT middleware. ✅ (unchanged)
- All raw-SQL reports use parameterised `:replacements` → **SQL-injection safe**. ✅
- Ledger mutation endpoints sit behind the same controller chain as before — no new attack surface.
- `current_stock` can still be edited directly via PUT item endpoints — recommend restricting to audit-adjust only (next step).

## 10. Scalability Risks

- **Immutable ledger** is the right growth pattern — scales to millions of rows with the existing indexes. ✅
- `current_stock` column remains a denormalised cache maintained atomically — fine at this scale.
- Next steps: partition `t_stock_ledger` by month (Postgres declarative partitioning) when row count grows; archive reversals; cache dashboard KPIs.

## 11. Suggested Database Changes (done in this work)

| Change | Table | Status |
|---|---|---|
| Add stock ledger table | `t_stock_ledger` | ✅ Created + synced |
| Add warehouse master | `m_warehouse` | ✅ Created + seeded (Main Store, Raw Material Store) |
| Add batch master | `m_item_batch` (model) | ✅ Model + report |
| Seed default warehouses | — | ✅ In `index.js` |
| Backfill opening stock | — | ✅ 508 entries posted |

## 12. Suggested API Changes (done in this work)

Under `/api/erp/stores`:

- `GET /inventory/statement?item_id&warehouse_id&from&to` → bank-account style statement
- `GET /inventory/valuation?as_of&group_id&zero_stock` → as-of valuation (ledger-driven)
- `GET /inventory/stock-ledger?item_id&warehouse_id&from&to` → full ledger + running balance
- `GET /inventory/aging`, `/slow-moving`, `/fast-moving`, `/negative-stock`, `/dead-stock`, `/warehouse-wise`, `/batches`, `/adjustments`, `/profit-loss`, `/audit-trail`, `/reconciliation`
- `CRUD /warehouses`, `CRUD /batches`
- All stock-mutation controllers now use `stockService` within transactions

## 13. Suggested UI/UX Changes (done)

- Stock Statement page (headline deliverable)
- Warehouse Master, Batch Master screens
- Rewritten Stock Ledger with warehouse filter + running balance + valuation
- Stores Reports expanded to 16 tabs
- Sidebar + permissions updated (`STORES_WAREHOUSE`, `STORES_BATCH`)

## 14. Suggested Reports & Dashboards (done)

| Report | Purpose | Status |
|---|---|---|
| Stock Statement | Bank-account style traceability | ✅ |
| Stock Ledger | Full audit of every movement | ✅ |
| Valuation (as-of) | Month-end / audit value | ✅ |
| Stock Aging | Working capital focus | ✅ |
| Slow/Fast Moving | Purchasing decisions | ✅ |
| Dead Stock | Liquidation opportunities | ✅ |
| Negative Stock | Data integrity alerts | ✅ |
| Warehouse-wise | Location valuation | ✅ |
| Batch Report | Lot/expiry tracking | ✅ |
| Item P&L | Product profitability | ✅ |
| Audit Trail | Compliance | ✅ |
| Reconciliation | Ledger vs system variance | ✅ |

## 15. Future Enhancements (priority order)

1. Wire **Billing/Invoice** to post Sales & Sales-Return ledger rows (currently only DC dispatch is captured).
2. Add **Transfer In/Out, Damage, Wastage** transaction forms (REF_TYPES are ready).
3. Link **Gate Entry** items to `item_id` (replace free text).
4. Wire **batch/serial pickers** into Material Issue / GRN forms.
5. Add **Location/Rack** model (`m_rack`) + bin locations.
6. **Materialise dashboard KPIs** and add period-over-period trend charts.
7. Partition `t_stock_ledger` by month at scale; paginate ledger grids.
8. Add **stock reconciliation approval workflow** and email alerts for negative/dead stock.
9. Lock down direct `current_stock` editing to audit-adjust-only with reason + approval.
10. Multi-warehouse cost integration (transfer costing between warehouses).

## Verification Summary

- All 13 new report endpoints return HTTP 200 (smoke-tested against running backend).
- Reconciliation: 809 items, **0 mismatched** ledger-vs-system.
- Backfill: 508 Opening Stock ledger entries created for legacy stock.
- Frontend `vite build` passes (13,472 modules).
- Valuation shows ₹0 for legacy items because no cost data exists (all costs were 0 historically); real costs will flow in from GRN billing going forward. This is intentional — left as-is rather than fabricate figures.
