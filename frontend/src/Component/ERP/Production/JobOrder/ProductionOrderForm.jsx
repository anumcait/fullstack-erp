import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Chip, LinearProgress, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, IconButton, Tooltip, Alert, Divider, MenuItem, Tabs, Tab } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import FactoryIcon from "@mui/icons-material/Factory";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/production/job-orders";
const PROD_API = "/api/erp/engineering/products";
const PLAN_API = "/api/erp/production/order-plan";

const STATUS_COLOR = { Planning: "default", Released: "primary", "In Progress": "warning", Completed: "success", Cancelled: "error" };

export default function ProductionOrderForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = !!id && !isView;
  const isAdd = !id;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [tab, setTab] = useState(0);
  const [header, setHeader] = useState({
    order_no: "", product_code: "", product_name: "", planned_quantity: 100, bom_id: null, status: "Planning", order_type: "Production Order",
    start_date: "", end_date: "", remarks: "", jo_date: new Date().toISOString().slice(0, 10),
    machine_id: "", work_center: "", shift: "", priority: "Medium", scheduled_start: "", scheduled_end: "", estimated_hours: "", instructions: "",
  });
  const [operations, setOperations] = useState([]);
  const [items, setItems] = useState([]);
  const [qtyToLoad, setQtyToLoad] = useState(100);
  const [prodIdToLoad, setProdIdToLoad] = useState("");

  useEffect(() => {
    axios.get(PROD_API).then(({ data }) => setProducts(Array.isArray(data) ? data : data.rows || [])).catch(() => {});
    axios.get("/api/erp/production/machines").then(({ data }) => setMachines(Array.isArray(data) ? data : data.rows || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`${API}/${id}`).then(({ data }) => {
      setHeader({
        order_no: data.order_no || "",
        product_code: data.product_code || "",
        product_name: data.product_name || "",
        planned_quantity: Number(data.planned_quantity) || 0,
        bom_id: data.bom_id || null,
        status: data.status || "Planning",
        order_type: data.order_type || "Production Order",
        start_date: data.start_date ? data.start_date.slice(0, 10) : "",
        end_date: data.end_date ? data.end_date.slice(0, 10) : "",
        remarks: data.remarks || data.notes || "",
        jo_date: data.jo_date ? data.jo_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        machine_id: data.machine_id || "",
        work_center: data.work_center || "",
        shift: data.shift || "",
        priority: data.priority || "Medium",
        scheduled_start: data.scheduled_start ? data.scheduled_start.slice(0, 16) : "",
        scheduled_end: data.scheduled_end ? data.scheduled_end.slice(0, 16) : "",
        estimated_hours: data.estimated_hours || "",
        instructions: data.instructions || "",
      });
      if (data.operations?.length) setOperations(data.operations);
      else if (data.machine_id) setOperations([{ step: 10, operation: "Main Operation", machine_id: data.machine_id, work_center: data.work_center || "", instruction: data.instructions || "", est_hours: data.estimated_hours || "" }]);
      if (data.items?.length) setItems(data.items.map(it => ({
        item_id: it.item_id, item_code: it.item_code, item_name: it.item_name,
        quantity: Number(it.required_quantity ?? it.quantity) || 0,
        issued_quantity: Number(it.issued_quantity) || 0,
        remarks: it.remarks || "",
      })));
    }).catch(() => showToast("Failed to load Production Order", "error")).finally(() => setLoading(false));
  }, [id]);

  const loadFromPlan = async () => {
    const pid = prodIdToLoad || products.find(p => p.product_code === header.product_code)?.id;
    if (!pid) return showToast("Select Product first", "warning");
    if (!qtyToLoad || qtyToLoad <= 0) return showToast("Enter Qty", "warning");
    try {
      const { data } = await axios.get(PLAN_API, { params: { product_id: pid, qty: qtyToLoad } });
      setHeader(h => ({ ...h, product_code: data.summary.product.code, product_name: data.summary.product.name, planned_quantity: data.summary.order_qty, bom_id: data.summary.bom_id }));
      const makeItems = data.items.filter(i => !String(i.item_id).startsWith("ASM-") && i.make_buy === "Make" && Number(i.production_qty || i.total_need) > 0);
      if (!makeItems.length) {
        const allMake = data.items.filter(i => !String(i.item_id).startsWith("ASM-") && i.make_buy === "Make");
        if (allMake.length) {
          setItems(allMake.map(i => ({ item_id: Number(i.item_id), item_code: i.item_code, item_name: i.item_name, quantity: Number(i.total_need), issued_quantity: 0, remarks: i.item_description || "" })));
          showToast(`Loaded ${allMake.length} Make items (full need — short was 0)`, "info");
        } else showToast("No Make items in BOM — set make_buy=Make in Item Master", "warning");
        return;
      }
      setItems(makeItems.map(i => ({ item_id: Number(i.item_id), item_code: i.item_code, item_name: i.item_name, quantity: Number(i.production_qty), issued_quantity: 0, remarks: i.item_description || "" })));
      showToast(`Loaded ${makeItems.length} items from BOM × ${qtyToLoad}`, "success");
    } catch (e) { showToast(e.response?.data?.error || "Failed to explode BOM", "error"); }
  };

  const updateStatus = async (status) => {
    try {
      await axios.put(`${API}/${id}/status`, { status, produced_quantity: status === "Completed" ? header.planned_quantity : undefined });
      showToast(`Status → ${status}`, "success");
      setHeader(h => ({ ...h, status }));
    } catch (e) { showToast(e.response?.data?.error || "Status update failed", "error"); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!header.product_code) return showToast("Product is required — load from BOM or select", "warning");
    if (!header.planned_quantity || header.planned_quantity <= 0) return showToast("Planned Qty required", "warning");
    if (!items.length) return showToast("Add at least one production item (Make item)", "warning");
    setSaving(true);
    try {
      const payload = {
        product_code: header.product_code, product_name: header.product_name, planned_quantity: Number(header.planned_quantity),
        bom_id: header.bom_id || null, order_type: "Production Order", status: header.status || "Planning",
        start_date: header.start_date || null, end_date: header.end_date || null, jo_date: header.jo_date || null,
        machine_id: header.machine_id ? Number(header.machine_id) : null, work_center: header.work_center || "", shift: header.shift || "", priority: header.priority || "Medium",
        scheduled_start: header.scheduled_start || null, scheduled_end: header.scheduled_end || null, estimated_hours: header.estimated_hours ? Number(header.estimated_hours) : null,
        instructions: header.instructions || "", operations: operations.filter(o => o.operation),
        remarks: header.remarks || "", notes: header.remarks || "",
        items: items.filter(i => i.item_name).map(i => ({
          item_id: Number(i.item_id), item_code: i.item_code, item_name: i.item_name,
          quantity: Number(i.quantity) || 0, required_quantity: Number(i.quantity) || 0, remarks: i.remarks || "",
        })),
      };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
        showToast("Production Order updated", "success");
      } else {
        const { data } = await axios.post(API, payload);
        showToast(`Production Order ${data.order_no} created`, "success");
        navigate(`/production/orders/view/${data.id}`, { replace: true });
        return;
      }
      navigate("/production/orders");
    } catch (err) { showToast(err.response?.data?.error || err.response?.data?.details || "Save failed", "error"); }
    finally { setSaving(false); }
  };

  const totalReq = items.reduce((a, b) => a + (Number(b.quantity) || 0), 0);
  const totalIssued = items.reduce((a, b) => a + (Number(b.issued_quantity) || 0), 0);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => navigate("/production/orders")} sx={{ bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
              <FactoryIcon color="success" />{isView ? "Production Order" : isEdit ? "Edit Production Order" : "New Production Order"}
              {header.order_no && <Chip label={header.order_no} color="success" size="small" sx={{ fontWeight: 700 }} />}
            </Typography>
            <Typography variant="caption" color="text.secondary">Production-only · BOM explosion · Make items · Issue → Daily Entry → Complete</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          {id && <Chip label={header.status} color={STATUS_COLOR[header.status] || "default"} sx={{ fontWeight: 700 }} />}
          {isView ? (
            <>
              {header.status === "Planning" && <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />} onClick={() => updateStatus("Released")}>Release</Button>}
              {header.status === "Released" && <Button variant="contained" color="warning" startIcon={<PlayArrowIcon />} onClick={() => updateStatus("In Progress")}>Start</Button>}
              {(header.status === "Released" || header.status === "In Progress") && <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => updateStatus("Completed")}>Complete</Button>}
              {header.status !== "Cancelled" && header.status !== "Completed" && <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => updateStatus("Cancelled")}>Cancel</Button>}
              <Button variant="outlined" onClick={() => navigate(`/production/orders/edit/${id}`)}>Edit</Button>
            </>
          ) : (
            <>
              <Button variant="outlined" onClick={() => navigate("/production/orders")}>Cancel</Button>
              <Button type="submit" form="prod-order-form" variant="contained" color="success" startIcon={<SaveIcon />} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Create Production Order"}</Button>
            </>
          )}
        </Box>
      </Box>

      {isView && header.status === "Planning" && <Alert severity="info" sx={{ mb: 2 }}>Release to allow Material Issue → Daily Production entry. Complete will close the order.</Alert>}
      {isView && !items.length && <Alert severity="warning" sx={{ mb: 2 }}>No Make items — this order has nothing to produce. Recreate from <b>Production → Order Plan</b> after setting <b>make_buy=Make</b> for sub-assemblies in Stores → Item Master.</Alert>}

      <form id="prod-order-form" onSubmit={handleSave}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", mb: 2.5, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 2, letterSpacing: 0.3 }}>ORDER DETAILS</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} md={3}>
                <TextField label="Order No" size="small" fullWidth value={header.order_no} placeholder="Auto on save" InputProps={{ readOnly: true }} sx={{ bgcolor: "#f8fafc" }} />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField label="Product Code *" size="small" fullWidth value={header.product_code} onChange={e => setHeader({ ...header, product_code: e.target.value })} disabled={isView} placeholder="e.g. FG-1001" required />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField label="Product Name" size="small" fullWidth value={header.product_name} onChange={e => setHeader({ ...header, product_name: e.target.value })} disabled={isView} placeholder="Finished Good Name" />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Planned Qty *" type="number" size="small" fullWidth value={header.planned_quantity} onChange={e => setHeader({ ...header, planned_quantity: Number(e.target.value) })} disabled={isView} inputProps={{ min: 1 }} required />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="BOM" size="small" fullWidth value={header.bom_id ? `#${header.bom_id}` : "—"} InputProps={{ readOnly: true }} sx={{ bgcolor: "#f8fafc" }} helperText={header.bom_id ? "Linked" : "via Order Plan"} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Status" select size="small" fullWidth value={header.status} onChange={e => setHeader({ ...header, status: e.target.value })} disabled={isView}>
                  {["Planning", "Released", "In Progress", "Completed", "Cancelled"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Order Date" type="date" size="small" fullWidth value={header.jo_date} onChange={e => setHeader({ ...header, jo_date: e.target.value })} disabled={isView} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Start Date" type="date" size="small" fullWidth value={header.start_date} onChange={e => setHeader({ ...header, start_date: e.target.value })} disabled={isView} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="End Date" type="date" size="small" fullWidth value={header.end_date} onChange={e => setHeader({ ...header, end_date: e.target.value })} disabled={isView} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Remarks / Production Notes" size="small" fullWidth multiline minRows={2} value={header.remarks} onChange={e => setHeader({ ...header, remarks: e.target.value })} disabled={isView} placeholder="e.g. SO-00123 · 100 qty · urgent" />
              </Grid>
            </Grid>

            {!isView && (
              <Box sx={{ mt: 2.5, p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", letterSpacing: 0.5 }}>QUICK LOAD FROM BOM (for manual orders)</Typography>
                <Box sx={{ display: "flex", gap: 1.5, mt: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <TextField select size="small" label="Product" value={prodIdToLoad} onChange={e => setProdIdToLoad(e.target.value)} sx={{ minWidth: 260, bgcolor: "#fff" }}>
                    <MenuItem value=""><em>— Select Product —</em></MenuItem>
                    {products.map(p => <MenuItem key={p.id} value={p.id}>{p.product_code} — {p.part_name}</MenuItem>)}
                  </TextField>
                  <TextField size="small" label="Qty" type="number" value={qtyToLoad} onChange={e => setQtyToLoad(Number(e.target.value))} sx={{ width: 110, bgcolor: "#fff" }} inputProps={{ min: 1 }} />
                  <Button variant="contained" color="success" startIcon={<FactoryIcon />} onClick={loadFromPlan}>Load Make Items from BOM</Button>
                  <Typography variant="caption" color="text.secondary">Explodes BOM → fills table below · Or use <b>Production → Order Plan</b> for full purchase/production split</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ bgcolor: "#f1f5f9", borderRadius: 2, p: 0.5, "& .MuiTab-root": { minHeight: 36, fontWeight: 700, fontSize: "0.78rem" } }}>
            <Tab icon={<AssignmentIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Items (${items.length})`} />
            <Tab icon={<PrecisionManufacturingIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Machine & Instructions (${operations.length || (header.machine_id ? 1 : 0)})`} />
            <Tab icon={<ScheduleIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Scheduling" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Card sx={{ mt: 2, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>PRODUCTION ITEMS — TO PRODUCE (Make) · {items.length} · Total Req {totalReq}</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {isView && items.length > 0 && <Chip label={`Issued ${totalIssued} / ${totalReq}`} size="small" color={totalIssued >= totalReq ? "success" : "warning"} variant="outlined" />}
                  {!isView && <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setItems([...items, { item_id: "", item_code: "", item_name: "", quantity: 1, issued_quantity: 0, remarks: "" }])}>Add Row</Button>}
                </Box>
              </Box>
              <Divider />
              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f8fafc", fontWeight: 800, fontSize: "0.73rem", color: "#475569", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" } }}>
                      <TableCell width={40}>#</TableCell>
                      <TableCell width={130}>Item Code</TableCell>
                      <TableCell>Item Name *</TableCell>
                      <TableCell width={100} align="right">Required Qty *</TableCell>
                      <TableCell width={100} align="right">Issued</TableCell>
                      <TableCell width={100} align="right">Balance</TableCell>
                      <TableCell width={180}>Remarks</TableCell>
                      {!isView && <TableCell width={50}></TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((row, idx) => (
                      <TableRow key={idx} hover sx={{ "& td": { py: 0.5 } }}>
                        <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</TableCell>
                        <TableCell>
                          {isView ? <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>{row.item_code}</Typography>
                            : <TextField size="small" fullWidth value={row.item_code} onChange={e => { const u = [...items]; u[idx].item_code = e.target.value; setItems(u); }} placeholder="ITM-001" />}
                        </TableCell>
                        <TableCell>
                          {isView ? <Box><Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.84rem" }}>{row.item_name}</Typography><Typography variant="caption" color="text.secondary">{row.remarks}</Typography></Box>
                            : <TextField size="small" fullWidth value={row.item_name} onChange={e => { const u = [...items]; u[idx].item_name = e.target.value; setItems(u); }} placeholder="Item name" required />}
                        </TableCell>
                        <TableCell align="right">
                          {isView ? <Chip label={row.quantity} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                            : <TextField size="small" type="number" value={row.quantity} onChange={e => { const u = [...items]; u[idx].quantity = Number(e.target.value); setItems(u); }} inputProps={{ min: 0, style: { textAlign: "right" } }} sx={{ width: 100 }} />}
                        </TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ color: row.issued_quantity > 0 ? "#059669" : "#94a3b8" }}>{row.issued_quantity}</Typography></TableCell>
                        <TableCell align="right"><Chip label={(Number(row.quantity) - Number(row.issued_quantity)).toFixed(2)} size="small" color={Number(row.quantity) - Number(row.issued_quantity) <= 0 ? "success" : "warning"} variant="outlined" /></TableCell>
                        <TableCell>
                          {isView ? <Typography variant="caption" color="text.secondary">{row.remarks || "—"}</Typography>
                            : <TextField size="small" fullWidth value={row.remarks} onChange={e => { const u = [...items]; u[idx].remarks = e.target.value; setItems(u); }} placeholder="—" />}
                        </TableCell>
                        {!isView && <TableCell><Tooltip title="Remove"><IconButton size="small" color="error" onClick={() => setItems(items.filter((_, i) => i !== idx))}><DeleteIcon fontSize="small" /></IconButton></Tooltip></TableCell>}
                      </TableRow>
                    ))}
                    {!items.length && (
                      <TableRow><TableCell colSpan={isView ? 7 : 8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        <FactoryIcon sx={{ fontSize: 32, color: "#cbd5e1", mb: 1 }} /><Typography variant="body2" sx={{ fontStyle: "italic" }}>No Make items yet.</Typography>
                        {!isView && <><Typography variant="caption" color="text.secondary">Use <b>Load Make Items from BOM</b> above or create from <b>Order Plan (100 qty)</b> for auto explosion.</Typography><br /><Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => navigate("/production/order-plan")}>Go to Order Plan</Button></>}
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3, px: 3, py: 1.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="text.secondary">Total Required</Typography><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{totalReq.toFixed(2)}</Typography></Box>
                <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="text.secondary">Total Issued</Typography><Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#059669" }}>{totalIssued.toFixed(2)}</Typography></Box>
                <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="text.secondary">Balance</Typography><Typography variant="subtitle2" sx={{ fontWeight: 800, color: totalReq - totalIssued <= 0 ? "#059669" : "#d97706" }}>{(totalReq - totalIssued).toFixed(2)}</Typography></Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {tab === 1 && (
          <Card sx={{ mt: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}><CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}><PrecisionManufacturingIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />MACHINE & INSTRUCTIONS</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField select size="small" fullWidth label="Primary Machine" value={header.machine_id} onChange={e => setHeader({ ...header, machine_id: e.target.value })} disabled={isView}>
                  <MenuItem value=""><em>— Select Machine —</em></MenuItem>
                  {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.machine_code} — {m.machine_name} ({m.machine_type || "—"})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField size="small" fullWidth label="Work Center" value={header.work_center} onChange={e => setHeader({ ...header, work_center: e.target.value })} disabled={isView} placeholder="e.g. SHOP-A / WC-01" />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField select size="small" fullWidth label="Shift" value={header.shift} onChange={e => setHeader({ ...header, shift: e.target.value })} disabled={isView}>
                  <MenuItem value="">—</MenuItem><MenuItem value="Day">Day</MenuItem><MenuItem value="Night">Night</MenuItem><MenuItem value="General">General</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField size="small" fullWidth multiline minRows={3} label="Machine Instructions" value={header.instructions} onChange={e => setHeader({ ...header, instructions: e.target.value })} disabled={isView} placeholder="Set RPM, tool, fixture, safety checks, QC steps..." />
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 800, mt: 2.5, display: "block", color: "#334155" }}>OPERATION STEPS (Routing)</Typography>
            <TableContainer sx={{ mt: 1, border: "1px solid #e2e8f0", borderRadius: 2, maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead><TableRow sx={{ "& th": { bgcolor: "#f1f5f9", fontWeight: 800, fontSize: "0.72rem" } }}>
                  <TableCell width={60}>Step</TableCell><TableCell>Operation *</TableCell><TableCell width={180}>Machine</TableCell><TableCell width={150}>Work Center</TableCell><TableCell>Instruction</TableCell><TableCell width={90} align="right">Est. Hrs</TableCell>{!isView && <TableCell width={50}></TableCell>}
                </TableRow></TableHead>
                <TableBody>
                  {operations.map((op, i) => (
                    <TableRow key={i}>
                      <TableCell>{isView ? op.step : <TextField size="small" type="number" value={op.step} onChange={e => { const u = [...operations]; u[i].step = Number(e.target.value); setOperations(u); }} sx={{ width: 60 }} />}</TableCell>
                      <TableCell>{isView ? op.operation : <TextField size="small" fullWidth value={op.operation} onChange={e => { const u = [...operations]; u[i].operation = e.target.value; setOperations(u); }} placeholder="e.g. Cutting" />}</TableCell>
                      <TableCell>{isView ? (machines.find(m => m.id === Number(op.machine_id))?.machine_name || op.machine_id || "—") : <TextField select size="small" fullWidth value={op.machine_id || ""} onChange={e => { const u = [...operations]; u[i].machine_id = e.target.value; setOperations(u); }}><MenuItem value=""><em>—</em></MenuItem>{machines.map(m => <MenuItem key={m.id} value={m.id}>{m.machine_code}</MenuItem>)}</TextField>}</TableCell>
                      <TableCell>{isView ? op.work_center || "—" : <TextField size="small" fullWidth value={op.work_center || ""} onChange={e => { const u = [...operations]; u[i].work_center = e.target.value; setOperations(u); }} />}</TableCell>
                      <TableCell>{isView ? op.instruction || "—" : <TextField size="small" fullWidth value={op.instruction || ""} onChange={e => { const u = [...operations]; u[i].instruction = e.target.value; setOperations(u); }} />}</TableCell>
                      <TableCell align="right">{isView ? op.est_hours || "—" : <TextField size="small" type="number" value={op.est_hours || ""} onChange={e => { const u = [...operations]; u[i].est_hours = e.target.value; setOperations(u); }} sx={{ width: 80 }} inputProps={{ style: { textAlign: "right" } }} />}</TableCell>
                      {!isView && <TableCell><IconButton size="small" color="error" onClick={() => setOperations(operations.filter((_, x) => x !== i))}><DeleteIcon fontSize="small" /></IconButton></TableCell>}
                    </TableRow>
                  ))}
                  {!operations.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary", fontStyle: "italic" }}>No operation steps yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
            {!isView && <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={() => setOperations([...operations, { step: (operations.length + 1) * 10, operation: "", machine_id: header.machine_id || "", work_center: header.work_center || "", instruction: "", est_hours: "" }])}>Add Operation Step</Button>}
          </CardContent></Card>
        )}

        {tab === 2 && (
          <Card sx={{ mt: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}><CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}><ScheduleIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />SCHEDULING</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField type="datetime-local" size="small" fullWidth label="Scheduled Start" value={header.scheduled_start} onChange={e => setHeader({ ...header, scheduled_start: e.target.value })} disabled={isView} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField type="datetime-local" size="small" fullWidth label="Scheduled End" value={header.scheduled_end} onChange={e => setHeader({ ...header, scheduled_end: e.target.value })} disabled={isView} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField select size="small" fullWidth label="Priority" value={header.priority} onChange={e => setHeader({ ...header, priority: e.target.value })} disabled={isView}>
                  <MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem><MenuItem value="Urgent">Urgent</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField size="small" fullWidth label="Estimated Hours" type="number" value={header.estimated_hours} onChange={e => setHeader({ ...header, estimated_hours: e.target.value })} disabled={isView} inputProps={{ min: 0, step: 0.5 }} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Alert severity={header.priority === "Urgent" || header.priority === "High" ? "warning" : "info"} sx={{ py: 0.5 }}>{header.priority === "Urgent" ? "Will be prioritized in Planning → Capacity" : header.priority === "High" ? "High priority scheduling" : "Normal scheduling"} · Duration: {header.scheduled_start && header.scheduled_end ? `${((new Date(header.scheduled_end) - new Date(header.scheduled_start)) / 36e5).toFixed(1)} hrs` : "—"}</Alert>
              </Grid>
            </Grid>
          </CardContent></Card>
        )}

        {!isView && <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2.5 }}>
          <Button variant="outlined" onClick={() => navigate("/production/orders")}>Cancel</Button>
          <Button type="submit" variant="contained" color="success" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : isEdit ? "Update Production Order" : "Create Production Order"}</Button>
        </Box>}
      </form>

      {isView && id && (
        <Card sx={{ mt: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", alignSelf: "center" }}>NEXT STEPS:</Typography>
            <Button size="small" variant="outlined" onClick={() => navigate("/stores/material-issues")}>Issue Material</Button>
            <Button size="small" variant="outlined" onClick={() => navigate("/production/daily-entry")}>Daily Entry</Button>
            <Button size="small" variant="outlined" onClick={() => navigate("/production/machines")}>Machines</Button>
            <Button size="small" onClick={() => navigate("/production/order-plan")}>New Order Plan (100 qty)</Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
