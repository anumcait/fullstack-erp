# Product & Item Master — Design (Strong, Reliable Foundation)

This document describes the canonical data model for the **Item Master**, **Product
Master (assembly / sub-assembly)**, the 4-level item classification
(Group → Sub Group → Type → Sub Type) and their relationships. It is the single
source of truth for stores, MRP, BOM, costing and sales.

The design deliberately **keeps three structures** (chosen by the team):
1. `m_product_master` — the engineering product/assembly **tree**
2. `t_bom` / `t_bom_item` — the manufacturing **Bill of Materials** (versioned) per node
3. `m_product_item_master` — a **denormalized component cache** of a product

---

## 1. Item classification (4 levels)

| Level | Table | Notes |
|------|-------|-------|
| 1 | `m_item_group` | e.g. Finished Goods, Sub Assembly, Raw Material, Spares, Consumables, Packing Material |
| 2 | `m_item_subgroup` | belongs to a Group |
| 3 | `m_item_type` | belongs to a Sub Group |
| 4 | `m_item_subtype` | belongs to a Type |

`ItemMaster` stores **denormalized FKs** to all four levels (`group_id`,
`subgroup_id`, `type_id`, `subtype_id`) so queries can filter at any level without
joins. **Integrity is enforced in `itemController`**: a child FK must belong to its
parent (e.g. `subtype → type → subgroup → group`). This prevents the "blank / wrong
group" problems seen in the legacy cleanup (`item_master_cleanup.md`).

---

## 2. Item Master (`m_item_master`) — the stockable entity

One row = one stockable/purchasable item (raw material, component, sub-assembly,
finished good, spare, packing, service).

### Reliability-critical fields added
- **`make_buy`** `enum(Buy, Make, Phantom)` — the heart of planning:
  - `Buy` → purchased, not manufactured (raw material, component, packing, spares)
  - `Make` → manufactured in-house (assembly / sub-assembly / finished good)
  - `Phantom` → non-stocked sub-assembly; its components are pulled straight into the parent BOM
- **`is_purchase_item` / `is_sales_item` / `is_stock_item`** — derived from `make_buy`
  via a `beforeValidate` hook so downstream modules never re-derive the rule:
  - `Make` → purchase=false, stock=true
  - `Phantom` → purchase=false, stock=false
  - `Buy` → purchase=true, stock=true
- **`drawing_no`, `revision`** — engineering traceability.
- **`default_warehouse_id`** — FK to `m_warehouse`.
- **`alt_unit_id` + `conversion_factor`** — alternate UOM (purchase vs stock).
- Indexes: `(group_id, is_active)`, `(make_buy)`, `(subtype_id)`.

The controller validates `make_buy` and emits **warnings** when group and nature
disagree (e.g. a "Finished Goods" item set to `Buy`, or a "Raw Material" set to
`Make`), guiding users to correct data without hard-blocking.

---

## 3. Product Master (`m_product_master`) — the assembly tree

One row = one node in the product structure. `parent_id` forms the hierarchy.

### `node_type` (constrained enum)
| Value | Meaning |
|-------|---------|
| `ROOT` | top-level finished product |
| `ASSEMBLY` | manufactured assembly (has a BOM, is stocked) |
| `SUB_ASSEMBLY` | manufactured sub-assembly (has a BOM, may be stocked) |
| `PHANTOM` | non-stocked sub-assembly (components roll up) |
| `SKU` | leaf / saleable unit (no further BOM) |

### Reliability-critical fields added
- **`level`** — computed depth from root (via `computeLevel`), kept for fast tree queries.
- **`sort_order`** — ordering of siblings.
- **`is_subassembly`** — derived from `node_type` (true for ASSEMBLY/SUB_ASSEMBLY/PHANTOM).
- **`default_bom_id`** — pins the active BOM version for the node.
- **`drawing_no`, `revision`**.
- Indexes: `(parent_id)`, `(node_type)`, `(item_id)`.

### Cycle safety
`productController.create` / `update` reject a parent change that would create a
cycle (`isAncestor` walks the ancestor chain, depth-capped at 50) and reject
self-parenting. `delete` blocks deletion while child nodes exist.

`item_id` links each product node to its `ItemMaster` row (the stockable
representation). A `Make`/`Phantom` node should have an `ItemMaster`; a `Buy`
component is just an item referenced from BOM lines.

---

## 4. BOM (`t_bom` / `t_bom_item`) — manufacturing definition

`BOM.belongsTo(ProductMaster, product_id)` — each manufactured node may have one or
more **versioned** BOMs. `BOMItem` supports:
- direct `item_id` components,
- `component_product_id` → a sub-product (sub-assembly) reference,
- `sub_bom_id` → nested BOM (multi-level explosion),
- `parent_item_id` / `children` → section hierarchy within a BOM,
- `is_phantom`, `wastage_percent`, `operation`, costing fields.

`productController.getProductBOM(id)` returns the effective BOM: the pinned
`default_bom_id` BOM, else the latest `Active` BOM. `bomController.explode` /
`costing` already handle multi-level roll-up.

---

## 5. How the three structures relate (no contradiction)

```
            m_item_master  (the thing you buy / stock / sell)
                 ▲ item_id
                 │
            m_product_master  (engineering tree, parent_id → children)
                 │ node_type = ROOT/ASSEMBLY/SUB_ASSEMBLY/PHANTOM/SKU
                 │ product_id
                 ▼
            t_bom  →  t_bom_item   (manufacturing BOM; item_id OR component_product_id)
                 │
                 ▼ (denormalized cache, read-optimized)
            m_product_item_master  (product_id → item_id + qty)
```

- **Product Master** = *what the product is made of structurally* (tree of nodes).
- **BOM** = *how to manufacture a node* (components + ops + cost, versioned).
- **ProductItemMaster** = a flattened component list kept for quick lookups/reports.

Rule of thumb: edit the BOM / tree as the source of truth; treat
`ProductItemMaster` as a derived cache.

---

## 6. API surface

### Item classification & master (Stores)
`GET/POST/PUT/DELETE /api/erp/groups|subgroups|item-types|subtypes`
`GET/POST/PUT/DELETE /api/erp/items` (+ `/items/next-code`, `/items/check-duplicate`)

### Product & assembly (Engineering)
`GET/POST/PUT/DELETE /api/erp/products`
`GET /api/erp/products/:id/assembly-tree` — recursive product/assembly tree
`GET /api/erp/products/:id/bom` — effective BOM for a node
`GET/POST/PUT/DELETE /api/erp/categories`
`GET/POST/PUT/DELETE /api/erp/bom` (+ `/bom/:id/explode`, `/bom/:id/costing`)

---

## 7. Migration / sync

All new columns are added via Sequelize `sync` (non-destructive `alter`). Existing
rows get safe defaults (`make_buy='Buy'`, `node_type='SKU'`, `is_subassembly=false`).
No data is dropped. The legacy `item_master_cleanup.md` reclassification remains a
separate, review-first exercise.
