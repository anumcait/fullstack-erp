# Tower Fan Item Code Mapping — Freeze Plan

**Date:** 2026-08-31
**Source:** `docs/test.md` (4 models) vs `m_item_master` (822 codes)
**Order:** Normal → Doom → High Breeze → Perfume as per `test.md`

## 1. Current State
- `m_item_master` has 822 codes but ~90% have `item_name='-'` / `'.'` (blanks) — see `TFAN0001-0195` all blank.
- `test.md` defines Normal 22, Doom 22, High Breeze 24, Perfume 22 items with 2 Sub Assemblies (12 sub-parts).
- No deterministic mapping `Component → item_code` exists yet → if you freeze now, transactions will reference blank codes forever.

## 2. Distinct Components — TFAN Serial Continuation (Normal → Doom → High Breeze → Perfume)
| # | Component (as per test.md) | Model | TFAN Code | UOM | make_buy |
|---|---------------------------|-------|-----------|-----|----------|
| 1 | Normal TOP (FRONT) White | Normal 1 | TFAN0001 | PCS | Make |
| 2 | BOTTOM (BACK) White | Normal 2 | TFAN0002 | PCS | Make |
| 3 | SWING PLATE (Slider) Normal | Normal 3 | TFAN0003 | PCS | Buy |
| 4 | STOPPER PLATE | Normal 4 | TFAN0004 | PCS | Buy |
| 5 | LOWERS 2pcs | Normal 5 | TFAN0005 | PCS | Buy |
| 6 | D plate 0001 | Normal 6 Sub Assembly 1 | TFAN0006 | PCS | Buy |
| 7 | cap set bottom 0002 | Normal 6 Sub Assembly 2 | TFAN0007 | PCS | Buy |
| 8 | cap set top 0003 | Normal 6 Sub Assembly 3 | TFAN0008 | PCS | Buy |
| 9 | derlin round part 0004 | Normal 6 Sub Assembly 4 | TFAN0009 | PCS | Buy |
|10 | Nandus dipped in oil 0005 | Normal 6 Sub Assembly 5 | TFAN0010 | PCS | Buy |
|11 | spring 0006 | Normal 6 Sub Assembly 6 | TFAN0011 | PCS | Buy |
|12 | MOTOR BASE Black | Normal 7 | TFAN0012 | PCS | Make |
|13 | blower top plate 0001 | Normal 8 Sub Assembly 1 | TFAN0013 | PCS | Buy |
|14 | pin insert 0002 | Normal 8 Sub Assembly 2 | TFAN0014 | PCS | Buy |
|15 | blower bottom plate 0003 | Normal 8 Sub Assembly 3 | TFAN0015 | PCS | Buy |
|16 | blower bush rubber 0004 | Normal 8 Sub Assembly 4 | TFAN0016 | PCS | Buy |
|17 | blower sections 0005 | Normal 8 Sub Assembly 5 | TFAN0017 | PCS | Buy |
|18 | Blower balancing pins 0006 | Normal 8 Sub Assembly 6 | TFAN0018 | PCS | Buy |
|19 | Normal KNOBS White 2pcs | Normal 9 | TFAN0019 | PCS | Buy |
|20 | Normal on off Plate | Normal 10 | TFAN0020 | PCS | Buy |
|21 | RUBBER ITEMS BUSH 4+GROMET1 | Normal 11 | TFAN0021 | SET | Buy |
|22 | PACKING COVERS | Normal 12 | TFAN0022 | PCS | Buy |
|23 | MOTOR WITH 4MFD CAPACITOR | Normal 13 | TFAN0023 | PCS | Buy |
|24 | SWING MOTOR WITH BUSH | Normal 14 | TFAN0024 | PCS | Buy |
|25 | ON/OFF SWITCH ELCOM | Normal 15 | TFAN0025 | PCS | Buy |
|26 | 3 SPEED SWITCH ELCOM | Normal 16 | TFAN0026 | PCS | Buy |
|27 | POWER CORD 2.5m 2core | Normal 17 | TFAN0027 | PCS | Buy |
|28 | HARDWARE PACKING SET | Normal 18 | TFAN0028 | SET | Buy |
|29 | INNER CARTON | Normal 19 | TFAN0029 | PCS | Buy |
|30 | Outer Carton 0.5 | Normal 20 | TFAN0030 | PCS | Buy |
|31 | MANUAL & WARRANTY CARD | Normal 21 | TFAN0031 | PCS | Buy |
|32 | MRP AND OTHER LABELS | Normal 22 | TFAN0032 | PCS | Buy |
|33 | Doom TOP (FRONT) White | Doom 1 | TFAN0033 | PCS | Make |
|34 | Doom KNOBS White 2pcs | Doom 9 | TFAN0034 | PCS | Buy |
|35 | Doom on off Plate | Doom 10 | TFAN0035 | PCS | Buy |
|36 | High Breeze TOP (FRONT) White | High Breeze 1 | TFAN0036 | PCS | Make |
|37 | High Breeze SWING PLATE (Slider) | High Breeze 3 | TFAN0037 | PCS | Buy |
|38 | High Breeze LOWERS STICK 1pc | High Breeze 4 | TFAN0038 | PCS | Buy |
|39 | High Breeze LOWERS UP DOWN 2pcs | High Breeze 5 | TFAN0039 | PCS | Buy |
|40 | High Breeze LOWERS CONTROLLER SET | High Breeze 6 | TFAN0040 | PCS | Buy |
|41 | High breeze LOWERS 5pcs | High Breeze 7 | TFAN0041 | PCS | Buy |
|42 | High Breeze KNOBS White 2pcs | High Breeze 11 | TFAN0042 | PCS | Buy |
|43 | High Breeze on off Plate 2pcs | High Breeze 12 | TFAN0043 | PCS | Buy |
|44 | Perfume TOP (FRONT) White | Perfume 1 | TFAN0044 | PCS | Make |
|45 | Colored front Panel | Perfume 2 | TFAN0045 | PCS | Buy |
|46 | Perfume SWING PLATE (Slider) | Perfume 4 | TFAN0046 | PCS | Buy |
|47 | Perfume KNOBS White 2pcs | Perfume 9 | TFAN0047 | PCS | Buy |
|48 | Perfume on off Plate | Perfume 10 | TFAN0048 | PCS | Buy |

Note: D PLATE with CAP SET Assembly and BLOWER Assembly are Sub Assemblies — not item codes, children are TFAN0006-0011 and TFAN0013-0018 with serial 0001-0006 inside each.

## 3. Best Freeze Procedure
Steps:
1. Fill `docs/tower-fan-mapping.csv` — TFAN0001-0048 as above. Run `scripts/fill-tower-fan-names.sql`.
2. Validate blank TFAN 0.
3. Freeze via `ItemMaster.beforeUpdate` hook.
4. Create 4 BOMs: NORMAL (TFAN0001-0032), DOOM (reuse common + TFAN0033-0035), HIBREEZE (TFAN0036-0043), PERFUME (TFAN0044-0048).

## 4. Next Actions
- Run: `docker exec hr_postgres psql -U postgres -d erpdb -f scripts/fill-tower-fan-names.sql`
- Verify: `SELECT item_code,item_name FROM m_item_master WHERE item_code LIKE 'TFAN00%' ORDER BY item_code`
