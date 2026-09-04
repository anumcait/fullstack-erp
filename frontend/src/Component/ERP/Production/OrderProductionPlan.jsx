import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, MenuItem, Button, Chip, Divider, Alert, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from "@mui/material";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import FactoryIcon from "@mui/icons-material/Factory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const PROD_API = "/api/erp/engineering/products";
const ORDER_API = "/api/erp/marketing/orders";
const PLAN_API = "/api/erp/production/order-plan";
const JO_API = "/api/erp/production/job-orders";

export default function OrderProductionPlan() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productId, setProductId] = useState("");
  const [salesOrderId, setSalesOrderId] = useState("");
  const [qty, setQty] = useState(100);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [savedLinks, setSavedLinks] = useState(null);
  const [prDialog, setPrDialog] = useState({ open: false, items: [], remarks: "", required_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), saving: false });
  const prApiRef = useGridApiRef();

  useEffect(() => {
    axios.get(PROD_API).then(({ data }) => setProducts(Array.isArray(data) ? data : data.rows || [])).catch(() => {});
    axios.get(ORDER_API).then(({ data }) => setOrders(Array.isArray(data) ? data : data.rows || [])).catch(() => {});
  }, []);

  const buildPlan = async () => {
    if (!productId && !salesOrderId) return showToast("Select Product or Sales Order", "warning");
    if (!qty || qty <= 0) return showToast("Enter order qty", "warning");
    setLoading(true);
    try {
      const params = { qty };
      if (productId) params.product_id = productId;
      if (salesOrderId) params.sales_order_id = salesOrderId;
      const { data } = await axios.get(PLAN_API, { params });
      setPlan(data);
    } catch (e) { showToast(e.response?.data?.error || "Failed to build plan", "error"); }
    finally { setLoading(false); }
  };

  const createJobOrder = async () => {
    if (!plan) return;
    let makeItems = plan.items.filter(i => !String(i.item_id).startsWith("ASM-") && i.make_buy === "Make");
    let useShort = true;
    let filtered = makeItems.filter(i => Number(i.production_qty) > 0);
    if (!filtered.length && makeItems.length) {
      const useFull = window.confirm(`All Make items have sufficient stock (short = 0). So 100 × BOM is already in stock.\n\nClick OK to still create Production Order for FULL Total Need (${makeItems.reduce((a,b)=>a+Number(b.total_need||0),0)}), or Cancel to abort.\n\nTip: Set item make_buy=Make in Stores > Item Master for sub-assemblies you manufacture.`);
      if (!useFull) return;
      filtered = makeItems.map(i => ({ ...i, production_qty: i.total_need }));
      useShort = false;
    }
    if (!filtered.length) return showToast("No Make items found — mark sub-assemblies with make_buy=Make in Item Master, or check BOM", "warning");
    try {
      const payload = { product_code: plan.summary.product.code, product_name: plan.summary.product.name, planned_quantity: plan.summary.order_qty, bom_id: plan.summary.bom_id || null, order_type: "Production Order", remarks: salesOrderId ? `SO:${plan.summary.sales_order?.order_no}` : `Order Plan ${plan.summary.product.code} x${plan.summary.order_qty} [${useShort ? "short" : "full"}]`, items: filtered.map(i => ({ item_id: Number(i.item_id), item_code: i.item_code, item_name: i.item_name, quantity: Number(i.production_qty), required_quantity: Number(i.production_qty), unit_id: i.unit_id || null, remarks: i.item_description || "" })) };
      console.log("Create Production payload:", payload);
      const { data } = await axios.post(JO_API, payload);
      console.log("Create Production response:", data, "items:", data.items);
      if (!data.items || !data.items.length) showToast(`Production Order ${data.order_no} created but NO items saved — check BOM Make/Buy or stock`, "warning");
      else showToast(`Production Order ${data.order_no} created (${data.items.length} items, ${useShort ? "short" : "full"}) — stays here, view in Production > Orders`, "success");
      setSavedLinks(s => ({ ...(s||{}), jo: data.order_no, joId: data.id }));
    } catch (e) { const msg = (e.response?.data?.error ? e.response.data.error + (e.response?.data?.details ? ` — ${e.response.data.details}` : "") : e.response?.data?.message) || e.message || "Failed to create production order"; showToast(msg, "error"); console.error("Create JO error:", e.response?.data || e); }
  };
  const openPrDialog = () => {
    if (!plan) return;
    const buyItems = plan.items.filter(i => i.purchase_qty > 0 && !String(i.item_id).startsWith("ASM-")).map(i => ({ ...i, pr_qty: i.purchase_qty, required_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) }));
    if (!buyItems.length) return showToast("No purchase items short", "info");
    setPrDialog({ open: true, items: buyItems, remarks: `Auto from Order Plan ${plan.summary.product.code} x${plan.summary.order_qty} ${salesOrderId ? `SO:${plan.summary.sales_order?.order_no}` : ""}`, required_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), saving: false });
  };
  const createPR = async () => openPrDialog();
  const savePrDialog = async () => {
    const payloadItems = prDialog.items.filter(i => i.pr_qty > 0).map(i => ({ item_id: i.item_id, quantity: Number(i.pr_qty), required_date: i.required_date || prDialog.required_date }));
    if (!payloadItems.length) return showToast("No items to requisition", "warning");
    setPrDialog(d => ({ ...d, saving: true }));
    try {
      const { data } = await axios.post("/api/erp/purchase/requisitions", { remarks: prDialog.remarks, required_date: prDialog.required_date, items: payloadItems });
      setSavedLinks(s => ({ ...s, pr: data.pr_no || data.id, prId: data.id }));
      setPrDialog(d => ({ ...d, open: false, saving: false }));
      showToast(`PR ${data.pr_no || data.id} created (${payloadItems.length} items) — stays here, also in Purchase > Requisitions`, "success");
    } catch (e) { setPrDialog(d => ({ ...d, saving: false })); showToast(e.response?.data?.error || "Failed to create PR", "error"); }
  };
  const savePlan = () => {
    localStorage.setItem("orderPlan:" + (salesOrderId || productId), JSON.stringify({ plan, ts: Date.now() }));
    showToast("Plan saved locally — reflected to Production (JO) & PR via buttons above", "success");
  };

  const columns = [
    { field: "item_code", headerName: "Item Code", width: 135, renderCell: p => <Box sx={{ pl: (p.row.level || 0) * 2, fontFamily: "monospace", fontWeight: p.row.level > 0 ? 600 : 700, color: p.row.level > 0 ? "#64748b" : "inherit" }}>{p.row.level > 0 ? "↳ " : ""}{p.value}</Box> },
    { field: "item_name", headerName: "Item Name", width: 180, renderCell: p => <Tooltip title={p.row.item_description || ""}><span style={{ fontWeight: p.row.level > 0 ? 500 : 600 }}>{p.value}</span></Tooltip> },
    { field: "item_description", headerName: "Description (Production)", width: 260, renderCell: p => <Tooltip title={p.value}><span style={{ color: p.value ? "#1e293b" : "#94a3b8" }}>{p.value || "—"}</span></Tooltip> },
    { field: "parent_assembly", headerName: "Parent Assembly", width: 160, renderCell: p => p.value ? <Chip label={p.value} size="small" variant="outlined" /> : <span style={{ color: "#94a3b8" }}>— Top Level —</span> },
    { field: "group", headerName: "Group", width: 130, renderCell: p => <Chip label={p.value} size="small" color={p.value === "Raw Material" ? "default" : p.value === "Packing Material" ? "warning" : p.value === "Finished Goods" ? "success" : "info"} /> },
    { field: "make_buy", headerName: "Make/Buy", width: 100, renderCell: p => <Chip label={p.value} size="small" color={p.value === "Make" ? "secondary" : "primary"} /> },
    { field: "unit", headerName: "UOM", width: 80 },
    { field: "bom_qty", headerName: "BOM Qty", width: 85, type: "number" },
    { field: "effective_qty", headerName: "Eff.Qty", width: 90, type: "number", renderCell: p => <Tooltip title={`BOM Qty × Order Qty${p.row.parent_assembly ? ` (from ${p.row.parent_assembly})` : ""}`}><span>{p.value}</span></Tooltip> },
    { field: "wastage_percent", headerName: "Wast%", width: 75, type: "number" },
    { field: "total_need", headerName: "Total Need", width: 105, type: "number", cellClassName: "font-bold" },
    { field: "current_stock", headerName: "Stock", width: 95, type: "number" },
    { field: "short_qty", headerName: "Short", width: 95, type: "number", renderCell: p => <span style={{ color: p.value > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>{p.value}</span> },
    { field: "purchase_qty", headerName: "To Purchase", width: 115, type: "number", renderCell: p => p.value > 0 ? <Chip icon={<ShoppingCartIcon />} label={p.value} size="small" color="warning" /> : "-" },
    { field: "production_qty", headerName: "To Produce (Make)", width: 135, type: "number", renderCell: p => p.value > 0 ? <Tooltip title={p.row.item_description}><Chip icon={<FactoryIcon />} label={`${p.value} — ${p.row.item_description?.slice(0, 20) || ""}`} size="small" color="secondary" /></Tooltip> : "-" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Order Linked Production Plan</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Select Sales Order or Product, give qty (e.g. 100) → explodes BOM → shows purchase vs production</Typography>
      <Alert severity="success" sx={{ mb: 2, fontSize: "0.82rem" }}><strong>100-Qty Flow:</strong> 1) Select Product (or SO) → set Qty=100 → <strong>Build Plan</strong> (Total Need = BOM Qty × 100 × (1+Wastage%)) → 2) <strong>Create PR</strong> buys short Buy items → <strong>Create Production</strong> produces short Make items (fallbacks to full need if stock covers short) → 3) Production → Issue Material → Daily Entry → Complete. Need Make/Buy set in <em>Stores &gt; Item Master</em>; BOM in <em>Engineering &gt; Product Assembly Master</em>. Source: {plan?.summary?.source || "—"} {plan?.summary?.bom_id ? `(BOM #${plan.summary.bom_id})` : ""}</Alert>

      <Card sx={{ borderRadius: 3, mb: 2 }}><CardContent sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField select size="small" label="Product (PROD)" value={productId} onChange={e => setProductId(e.target.value)} sx={{ minWidth: 360 }}>
          <MenuItem value=""><em>— Select —</em></MenuItem>
          {products.map(p => <MenuItem key={p.id} value={p.id}>{p.product_code} — {p.part_name}{p.description ? ` — ${p.description}` : ""}{p.category?.name ? ` (${p.category.name})` : ""}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Sales Order (linked)" value={salesOrderId} onChange={e => setSalesOrderId(e.target.value)} sx={{ minWidth: 260 }}>
          <MenuItem value=""><em>— None —</em></MenuItem>
          {orders.map(o => <MenuItem key={o.id} value={o.id}>{o.order_no} — {o.customer?.name || o.customer_name || ""}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Order Qty" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} sx={{ width: 140 }} />
        <Button variant="contained" onClick={buildPlan} disabled={loading} startIcon={<SearchIcon />}>{loading ? "Planning..." : "Build Plan"}</Button>
        {plan && <><Button variant="outlined" onClick={savePlan}>Save Plan</Button>
        <Button variant="contained" color="secondary" startIcon={<FactoryIcon />} onClick={createJobOrder}>Create Production Order</Button>
        <Button variant="contained" color="warning" startIcon={<ShoppingCartIcon />} onClick={createPR}>Create PR (Purchase)</Button></>}
      </CardContent></Card>

      {plan && (
        <>
          <Card sx={{ borderRadius: 3, mb: 2, bgcolor: "#f8fafc" }}><CardContent sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
            <Box><Typography variant="caption" color="text.secondary">Product</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{plan.summary.product.code} — {plan.summary.product.name}{plan.summary.product.description ? ` — ${plan.summary.product.description}` : ""}</Typography><Typography variant="caption" color="text.secondary">Source: {plan.summary.source} {plan.summary.bom_id ? `· BOM #${plan.summary.bom_id}` : "· ProductItemMaster (no BOM)"}</Typography></Box>
            <Divider orientation="vertical" flexItem />
            <Box><Typography variant="caption">Order Qty</Typography><Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>{plan.summary.order_qty}</Typography></Box>
            <Box><Typography variant="caption">Items</Typography><Typography variant="h6">{plan.summary.total_items}</Typography></Box>
            <Box><Typography variant="caption" color="warning.main">To Purchase (Buy short)</Typography><Typography variant="h6" sx={{ color: "#ea580c", fontWeight: 700 }}>{plan.summary.total_purchase}</Typography></Box>
            <Box><Typography variant="caption" color="secondary.main">To Produce (Make short)</Typography><Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>{plan.summary.total_production}</Typography></Box>
            {plan.summary.sales_order && <Chip label={`SO: ${plan.summary.sales_order.order_no}`} color="info" />}
          </CardContent></Card>
          <Alert severity="info" sx={{ mb: 1 }}>Total Need = BOM Qty × Order Qty × (1+Wastage%). Short = max(0, Total Need − Stock). Purchase = short where Make=Buy, Production = short where Make=Make. If short=0 but you still want to produce 100, Create Production will prompt to use Full Need. Saved plan reflects to Production Orders & Purchase Requisitions.</Alert>
          {savedLinks && <Alert severity="success" sx={{ mb: 1, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>✓ Created — {savedLinks.jo && <><Chip label={`Production Order ${savedLinks.jo}`} color="success" size="small" /><Button size="small" variant="contained" color="success" onClick={() => navigate(`/production/orders/view/${savedLinks.joId}`)}>View Production Order</Button><Button size="small" variant="outlined" onClick={() => navigate(`/production/orders`)}>All Production Orders</Button></>} {savedLinks.pr && <><Chip label={`PR ${savedLinks.pr}`} color="warning" size="small" /><Button size="small" variant="outlined" onClick={() => navigate(`/purchase/requisitions/view/${savedLinks.prId}`)}>View PR</Button></>} — stays on this plan page; next: Issue Material → Daily Entry → Complete.</Alert>}
          <Card sx={{ borderRadius: 3, height: 520 }}><DataGrid rows={plan.items.map((r, i) => ({ id: String(r.item_id) + "-" + i, ...r }))} columns={columns} density="compact" getRowClassName={p => p.row.is_assembly_header ? "assembly-header" : ""} /></Card>
        </>
      )}
      <Dialog open={prDialog.open} onClose={() => setPrDialog(d => ({ ...d, open: false }))} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Purchase Requisition — from Order Plan {plan?.summary.product.code} x{plan?.summary.order_qty}</DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: "flex-start" }}>
            <TextField size="small" label="Required Date * ✎" type="date" value={prDialog.required_date} onChange={e => { const iso=e.target.value; setPrDialog(d=>({ ...d, required_date: iso, items: d.items.map(x=>({ ...x, required_date: iso })) })); }} helperText={prDialog.required_date ? `DD-MM-YYYY: ${(() => { const [y,m,d]=prDialog.required_date.split("-"); return `${d}-${m}-${y}`; })()}` : "DD-MM-YYYY — auto fills grid"} sx={{ bgcolor: "#fffbeb", "& fieldset": { borderColor: "#f59e0b", borderWidth: 1.5 } }} InputLabelProps={{ shrink: true }} />
            <Button size="small" variant="outlined" onClick={() => { if (!prDialog.required_date) return showToast("Enter header date first", "warning"); setPrDialog(d => ({ ...d, items: d.items.map(x => ({ ...x, required_date: d.required_date })) })); const [y,m,d]=prDialog.required_date.split("-"); showToast(`Filled ${prDialog.items.length} rows to ${d}-${m}-${y}`, "success"); }} sx={{ whiteSpace: "nowrap", mt: 0.5 }}>Fill Grid</Button>
            <TextField size="small" label="Remarks ✎" value={prDialog.remarks} onChange={e => setPrDialog(d => ({ ...d, remarks: e.target.value }))} sx={{ flex: 1, bgcolor: "#fffbeb", "& fieldset": { borderColor: "#f59e0b" } }} />
          </Stack>
            <Alert severity="info" sx={{ mb: 1 }}>✎ Yellow fields are editable. PR Qty & Req Date (DD-MM-YYYY) can be edited inline. Save creates PR.</Alert>
          <Box sx={{ height: 360, "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button": { WebkitAppearance: "none", margin: 0 }, "& input[type=number]": { MozAppearance: "textfield" }, "& .editable-highlight": { bgcolor: "#fffbeb !important", border: "1px solid #f59e0b", fontWeight: 700 } }}>
            <DataGrid apiRef={prApiRef} onCellClick={(p) => { if (p.colDef.editable) prApiRef.current.startCellEditMode({ id: p.id, field: p.field }); }} rows={prDialog.items.map((r, i) => ({ id: r.item_id, sno: i + 1, ...r }))} columns={[
              { field: "sno", headerName: "S.No", width: 65, sortable: false, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography> },
              { field: "item_code", headerName: "Code", width: 125 },
              { field: "item_name", headerName: "Item", width: 280, renderCell: p => <Box sx={{ lineHeight: 1.1 }}><Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{p.value}</Typography><Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.row.item_description || "—"}</Typography></Box> },
              { field: "unit", headerName: "UOM", width: 70 },
              { field: "pr_qty", headerName: "PR Qty ✎", width: 105, editable: true, type: "number", cellClassName: "editable-highlight", headerClassName: "editable-header" },
              { field: "current_stock", headerName: "Stock", width: 85 },
              { field: "required_date", headerName: "Req Date ✎ (DD-MM-YYYY)", width: 150, editable: true, cellClassName: "editable-highlight", renderCell: p => { const v=p.value; if(!v) return <span style={{ color: "#94a3b8" }}>—</span>; const [y,m,d]=String(v).split("-"); return <span>{`${d}-${m}-${y}`}</span>; }, valueFormatter: p => { const v=p.value; if(!v) return ""; const [y,m,d]=String(v).split("-"); return `${d}-${m}-${y}`; }, valueSetter: (params) => { const v=params.value; let iso=v; const m=String(v).match(/^(\d{2})-(\d{2})-(\d{4})$/); if(m) iso=`${m[3]}-${m[2]}-${m[1]}`; return { ...params.row, required_date: iso }; } },
              { field: "actions", headerName: "", width: 60, renderCell: p => <IconButton size="small" onClick={() => setPrDialog(d => ({ ...d, items: d.items.filter(x => x.item_id !== p.row.item_id) }))}><DeleteIcon fontSize="small" /></IconButton> },
            ]} density="compact" rowHeight={48} processRowUpdate={(newRow) => { let nd=newRow.required_date; if(nd && /^\d{2}-\d{2}-\d{4}$/.test(nd)) { const [d,m,y]=nd.split("-"); nd=`${y}-${m}-${d}`; } setPrDialog(d => ({ ...d, items: d.items.map(x => x.item_id === newRow.item_id ? { ...x, pr_qty: newRow.pr_qty, required_date: nd } : x) })); return { ...newRow, required_date: nd }; }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrDialog(d => ({ ...d, open: false }))}>Cancel</Button>
          <Button variant="contained" onClick={savePrDialog} disabled={prDialog.saving}>{prDialog.saving ? "Saving..." : "Create PR & Continue"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
