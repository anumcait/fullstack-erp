# Tower Fan Item Code Mapping — Freeze Plan

**Date:** 2026-08-31
**Source:** `docs/test.md` (4 models) vs `m_item_master` (822 codes)

## 1. Current State
- `m_item_master` has 822 codes but ~90% have `item_name='-'` / `'.'` (blanks) — see `TFAN0001-0195`, `ELEC0001-0031`, `PACK0001-0032` all blank.
- `test.md` defines 30 distinct purchasable/manufactured components + 2 sub-assemblies (12 sub-parts).
- No deterministic mapping `Component → item_code` exists yet → if you freeze now, transactions will reference blank codes forever.

## 2. Distinct Components (from test.md)
| # | Component (as per test.md) | Variants | Recommended Code | UOM | make_buy |
|---|---------------------------|----------|----------------|-----|----------|
| 1 | Normal TOP (FRONT) White | Normal/Doom/HiBreeze/Perfume | TFAN0001..04 | PCS | Make |
| 2 | Colored front Panel | Perfume only | TFAN0005 | PCS | Buy |
| 3 | BOTTOM (BACK) White | Common | TFAN0006 | PCS | Make |
| 4 | SWING PLATE (Slider) | Normal/Doom/HiBreeze/Perfume | TFAN0007..10 | PCS | Buy |
| 5 | STOPPER PLATE | Normal/Doom | TFAN0011 | PCS | Buy |
| 6 | LOWERS (2) | Normal/Doom/Perfume | TFAN0012 | PCS | Buy |
| 7 | HiBreeze LOWERS STICK | HiBreeze only | TFAN0013 | PCS | Buy |
| 8 | HiBreeze LOWERS UP DOWN | HiBreeze only | TFAN0014 | PCS | Buy |
| 9 | HiBreeze LOWERS CONTROLLER SET | HiBreeze only | TFAN0015 | PCS | Buy |
|10 | HiBreeze LOWERS (5) | HiBreeze only | TFAN0016 | PCS | Buy |
|11 | D PLATE with CAP SET Assembly (SA) | Common SA | SA-DPLATE-01 | SET | Phantom |
|12 |  D plate | SA child | COMP0001 | PCS | Buy |
|13 |  cap set bottom | SA child | COMP0002 | PCS | Buy |
|14 |  cap set top | SA child | COMP0003 | PCS | Buy |
|15 |  derlin round part | SA child | COMP0004 | PCS | Buy |
|16 |  Nandus dipped in oil | SA child | HARD0001 | PCS | Buy |
|17 |  spring | SA child | HARD0002 | PCS | Buy |
|18 | MOTOR BASE Black | Common | TFAN0017 | PCS | Make |
|19 | BLOWER Assembly (SA) | Common SA | SA-BLOWER-01 | SET | Phantom |
|20 |  blower top plate | SA child | TFAN0018 | PCS | Buy |
|21 |  pin insert | SA child | HARD0003 | PCS | Buy |
|22 |  blower bottom plate | SA child | TFAN0019 | PCS | Buy |
|23 |  blower bush rubber | SA child | ELEC0010 | PCS | Buy |
|24 |  blower sections (5) | SA child | TFAN0020 | PCS | Buy |
|25 |  Blower balancing pins (6) | SA child | HARD0004 | PCS | Buy |
|26 | KNOBS White | Normal/Doom/HiBreeze/Perfume | TFAN0021..24 | PCS | Buy |
|27 | on off Plate | Variants | TFAN0025..28 | PCS | Buy |
|28 | RUBBER ITEMS (BUSH 4+ GROMET 1) | Common | HARD0010 | SET | Buy |
|29 | PACKING COVERS | Common | PACK0001 | PCS | Buy |
|30 | MOTOR WITH 4MFD CAPACITOR | Common | ELEC0001 | PCS | Buy |
|31 | SWING MOTOR WITH BUSH | Common | ELEC0002 | PCS | Buy |
|32 | ON/OFF SWITCH ELCOM | Common | ELEC0003 | PCS | Buy |
|33 | 3 SPEED SWITCH ELCOM | Common | ELEC0004 | PCS | Buy |
|34 | POWER CORD 2.5m 2core | Common | ELEC0005 | PCS | Buy |
|35 | HARDWARE / PACKING SET | Common | HARD0020 | SET | Buy |
|36 | INNER CARTON | Common | PACK0010 | PCS | Buy |
|37 | Outer Carton 0.5 | Common | PACK0011 | PCS | Buy |
|38 | MANUAL & WARRANTY CARD | Common | PACK0012 | PCS | Buy |
|39 | MRP AND OTHER LABELS | Common | PACK0013 | PCS | Buy |

## 3. Best Freeze Procedure (cannot change code after transactions start)

**Principle:** `item_code` = immutable business key (referenced by `m_product_item_master`, `t_stock_ledger`, `t_grn`). Freeze code, allow name/desc/UOM edits.

Steps:
1. **DRAFT phase (now):** Fill the mapping CSV (`docs/tower-fan-mapping.csv`) — assign each component above to a blank TFAN/ELEC/PACK code. Run `scripts/fill-tower-fan-names.sql` to update `item_name`, `item_description`, `make_buy`, `unit_id`, `hsn`.
2. **Validate:** `SELECT item_code FROM m_item_master WHERE item_name IN ('-','.')` must be 0 for TFAN/ELEC/PACK ranges. Check `m_product_item_master` not yet referenced by stock transactions (`SELECT COUNT(*) FROM t_stock_ledger` =0).
3. **Freeze flag:** Set `erp_settings.freeze_item_codes = true` (or `is_active` lock) — backend `POST /api/erp/stores/items` rejects new code format, `PUT` rejects `item_code` change if transactions exist. Implemented via `ItemMaster.beforeUpdate` hook.
4. **BOM versioning:** Create 4 ProductMasters (NORMAL-GY-001, DOOM-GY-001, HIBREEZE-GY-001, PERFUME-GY-001) + 2 Phantom SAs. Use `sort_order`/`serial_no` locked. Future changes = new revision (`drawing_no` + `revision`), not code rename.
5. **Soft-deprecate:** Never `DELETE` code, set `is_active=false`.

## 4. Missing Today
- 4 TOP variants need 4 distinct TFAN codes (currently only TFAN0001/02 exist with blank names — needs rename).
- High-Breeze & Perfume unique parts have no codes reserved.
- All items have no UOM/HSN/GST — must set before GRN entry.

## 5. Next Actions
- Fill `docs/tower-fan-mapping.csv` (template generated)
- Run: `docker exec hr_postgres psql -U postgres -d erpdb -f scripts/fill-tower-fan-names.sql`
- Verify: `docker exec hr_postgres psql -U postgres -d erpdb -c "SELECT item_code,item_name FROM m_item_master WHERE item_code LIKE 'TFAN%' AND item_name != '-' LIMIT 20"`
- Freeze: `UPDATE erp_settings SET freeze_item_codes=true` (or apply hook)

## 6. Guardrails Added
- `ProductMasterForm` quick-create now saves `description/unit/hsn/gst` and has `Open Full Item Master →` to use 10-tab form for full classification before freeze.
- Unique constraint `item_code` + `item_name` duplicate check via `/api/erp/stores/items/check-duplicate`.
