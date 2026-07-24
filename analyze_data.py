import json, sys

with open(r'D:\fullstack-erp-app\temp\sanctions.json') as f:
    sanctions = json.load(f)
with open(r'D:\fullstack-erp-app\temp\pos.json') as f:
    pos = json.load(f)

print("=== SANCTIONS ===")
for s in sanctions if isinstance(sanctions, list) else [sanctions]:
    req = s.get('requisition') or {}
    pr_item = s.get('prItem') or {}
    print(f"  sanction id={s.get('id')}: pr_item_id={s.get('pr_item_id')}, req_id={req.get('id')}, req_no={req.get('req_no')}, item_code={pr_item.get('item_code')}, qty={s.get('sanctioned_qty')}")

print("\n=== POs ===")
for p in pos if isinstance(pos, list) else [pos]:
    items = p.get('items') or []
    item_info = [(i.get('pr_item_id'), i.get('pr_no')) for i in items]
    print(f"  PO id={p.get('id')} no={p.get('po_no')} supplier_id={p.get('supplier_id')} pr_no={p.get('pr_no')} items={item_info}")
