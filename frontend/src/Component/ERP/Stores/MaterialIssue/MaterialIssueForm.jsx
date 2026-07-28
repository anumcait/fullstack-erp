import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, MenuItem,
  IconButton, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment, Tooltip, Stack, Fade, useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import PrintIcon from "@mui/icons-material/Print";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TransformIcon from "@mui/icons-material/Transform";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import ItemSelectDialog from "../ItemMaster/ItemSelectDialog";
import { formatQty } from "../../../../utils/format";
import PRConversionDialog from "../MaterialRequisition/PRConversionDialog";

const API = "/api/erp/stores/material-issues";
const MR_API = "/api/erp/stores/material-requisitions";
const ITEMS_API = "/api/erp/stores/items";
const STOCK_API = "/api/erp/stores/stock";
const UNITS_API = "/api/erp/stores/units";
const EMPLOYEE_API = "/api/employees";

const DEPARTMENTS = ["Production", "Assembly", "Maintenance", "Quality", "Stores", "Engineering", "Admin"];

const emptyItem = () => ({
  tempId: Date.now() + Math.random(),
  item_id: "", item_code: "", item_name: "", unit_id: "",
  quantity: "", req_item_id: "", max_qty: 0,
});

export default function MaterialIssueForm() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;

  const cl = {
    border: theme.palette.divider,
    bgSoft: theme.palette.action.hover,
    textMuted: theme.palette.text.secondary,
    textBody: theme.palette.text.primary,
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
  };

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mrList, setMrList] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [items, setItems] = useState([emptyItem()]);
  const [selectedMr, setSelectedMr] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  const [itemDialog, setItemDialog] = useState(null);
  const [prDlgOpen, setPrDlgOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    issue_no: "", issue_date: new Date().toISOString().slice(0, 16),
    issued_to: "", department: "", req_id: "", remarks: "", status: "Draft",
  });

  var fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34, borderRadius: "8px" },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 },
  };

  const fetchNextNumber = useCallback(function () {
    if (id) return;
    axios.get(API + "/next-number").then(function (resp) {
      setForm(function (f) { return { ...f, issue_no: resp.data.issue_no || "" }; });
    }).catch(function () { });
  }, [id]);

  useEffect(function () { fetchNextNumber(); }, [fetchNextNumber]);

  useEffect(function () {
    Promise.all([
      axios.get(MR_API, { params: { status: "Approved" } }).catch(function () { return { data: [] }; }),
      axios.get(ITEMS_API).catch(function () { return { data: [] }; }),
      axios.get(STOCK_API).catch(function () { return { data: [] }; }),
      axios.get(UNITS_API).catch(function () { return { data: [] }; }),
      axios.get(EMPLOYEE_API).catch(function () { return { data: [] }; }),
    ]).then(function (results) {
      setMrList(results[0].data || []);
      setAllItems(results[1].data || []);
      var map = {};
      (results[2].data || []).forEach(function (it) { map[it.id] = Number(it.current_stock || 0); });
      setStockMap(map);
      setUnits(results[3].data || []);
      setEmployees(results[4].data || []);
    });
    if (id) {
      setLoading(true);
      axios.get(API + "/" + id).then(function (resp) {
        var data = resp.data;
        setForm({
          issue_no: data.issue_no || "", issue_date: data.issue_date ? data.issue_date.slice(0, 16) : "",
          issued_to: data.issued_to || "", department: data.department || "",
          req_id: data.req_id || "", remarks: data.remarks || "", status: data.status || "Draft",
        });
        setItems((data.items || []).map(function (i) {
          return {
            tempId: Date.now() + Math.random(),
            item_id: i.item_id || "", item_code: i.item_code || "", item_name: i.item_name || "",
            quantity: formatQty(i.quantity), req_item_id: i.req_item_id || "", unit_id: i.unit_id || "",
            max_qty: i.max_qty || i.quantity || 0,
          };
        }));
        if (data.requisition) setSelectedMr(data.requisition);
      }).catch(function () { showToast("Failed to load", "error"); })
        .finally(function () { setLoading(false); });
    }
  }, [id]);

  var handleChange = useCallback(function (field) {
    return function (e) {
      setForm(function (f) { return { ...f, [field]: e.target.value }; });
      setErrors(function (prev) { return { ...prev, [field]: "" }; });
    };
  }, []);

  var handleMrSelect = useCallback(async function (mrId) {
    if (!mrId) { setSelectedMr(null); return; }
    try {
      var { data } = await axios.get(MR_API + "/" + mrId);
      setSelectedMr(data);
      setForm(function (f) { return { ...f, req_id: mrId, issued_to: data.requested_by || f.issued_to, department: data.department || f.department }; });
      setItems((data.items || []).filter(function (it) { return Number(it.pending_quantity || 0) > 0; }).map(function (it) {
        return {
          tempId: Date.now() + Math.random(),
          item_id: it.item_id, item_code: it.item_code, item_name: it.item_name,
          quantity: Number(it.pending_quantity || 0), req_item_id: it.id, unit_id: it.unit_id,
          max_qty: Number(it.pending_quantity || 0),
        };
      }));
    } catch { showToast("Failed to load MR", "error"); }
  }, []);

  var handleItemChange = useCallback(function (idx, field) {
    return function (e) {
      setItems(function (prev) {
        var updated = prev.slice();
        updated[idx] = { ...updated[idx], [field]: e.target.value };
        if (field === "quantity") {
          var qty = parseFloat(e.target.value) || 0;
          var max = updated[idx].max_qty || 0;
          if (max > 0 && qty > max) updated[idx].quantity = max;
        }
        return updated;
      });
    };
  }, []);

  var addItem = useCallback(function () { setItems(function (prev) { return prev.concat([emptyItem()]); }); }, []);
  var removeItem = useCallback(function (idx) {
    setItems(function (prev) { return prev.length > 1 ? prev.filter(function (_, i) { return i !== idx; }) : prev; });
  }, []);

  var handleItemSelect = useCallback(function (item) {
    if (itemDialog === null || itemDialog < 0) return;
    setItems(function (prev) {
      var updated = prev.slice();
      var available = stockMap[item.id] || 0;
      updated[itemDialog] = {
        ...updated[itemDialog],
        item_id: item.id || "",
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        unit_id: item.unit_id || "",
        quantity: "",
        max_qty: 0,
      };
      return updated;
    });
    setItemDialog(null);
  }, [itemDialog, stockMap]);

  var filteredItems = useMemo(function () {
    var q = itemSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter(function (it) { return Object.values(it).some(function (v) { return String(v || "").toLowerCase().indexOf(q) >= 0; }); });
  }, [itemSearch, items]);

  var canEdit = form.status === "Draft" && !isView;
  var canSubmit = form.status === "Draft" && items.some(function (i) { return i.item_name && parseFloat(i.quantity) > 0; });

  var validate = useCallback(function () {
    var errs = {};
    if (!form.issue_date) errs.issue_date = "Required";
    if (!form.issued_to) errs.issued_to = "Required";
    if (!form.department) errs.department = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  var handleSubmit = useCallback(function (status) {
    return async function (e) {
      e.preventDefault();
      if (!validate()) { showToast("Fill required fields", "warning"); return; }
      if (!items.some(function (i) { return i.item_name && parseFloat(i.quantity) > 0; })) {
        showToast("Add at least one item with name and qty", "warning"); return;
      }
      setSaving(true);
      var doSave = async function (issueNum) {
        try {
          var payload = {
            ...form, issue_no: issueNum || form.issue_no, status: status || form.status,
            items: items.filter(function (i) { return i.item_name && parseFloat(i.quantity) > 0; }).map(function (i) {
              return { item_id: i.item_id, item_code: i.item_code, item_name: i.item_name, quantity: parseFloat(i.quantity) || 0, req_item_id: i.req_item_id || null, unit_id: i.unit_id || null };
            }),
          };
          if (isEdit) { await axios.put(API + "/" + id, payload); showToast("Updated", "success"); }
          else { await axios.post(API, payload); showToast("Created", "success"); }
          navigate("/stores/material-issues");
        } catch (err) { showToast((err.response && err.response.data && err.response.data.error) || "Failed", "error"); }
        finally { setSaving(false); }
      };
      if (!id) {
        try { var resp = await axios.get(API + "/next-number"); doSave(resp.data.issue_no); }
        catch { doSave(form.issue_no); }
      } else { doSave(form.issue_no); }
    };
  }, [form, items, isEdit, id, validate, showToast, navigate]);

  var handleConvertToPR = useCallback(function () {
    setPrDlgOpen(true);
  }, []);

  var totalQty = useMemo(function () { return items.reduce(function (a, i) { return a + (parseFloat(i.quantity) || 0); }, 0); }, [items]);

  if (loading) {
    return <Box sx={{ p: 3 }}><LinearProgress sx={{ height: 4, borderRadius: 2 }} /><Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>Loading...</Typography></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1600, fontSize: "0.95rem" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {isView ? "Material Issue Details" : isEdit ? "Edit Material Issue" : "New Material Issue"}
          {form.status && (
            <span style={{ marginLeft: 12, fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600, background: form.status === "Issued" ? "#e8f5e9" : form.status === "Draft" ? "#f5f5f5" : "#fff3e0", color: form.status === "Issued" ? "#2e7d32" : form.status === "Draft" ? "#666" : "#e65100" }}>
              {form.status}
            </span>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && (
            <>
              <Button variant="contained" color="primary" size="medium" onClick={handleSubmit("Draft")}
                startIcon={<SaveIcon />} disabled={saving}>
                {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button variant="contained" color="success" size="medium"
                startIcon={<SendIcon />} disabled={saving || !canSubmit}
                onClick={handleSubmit("Issued")}>
                {saving ? "Saving..." : "Issue Materials"}
              </Button>
            </>
          )}
          {isView && form.status === "Issued" && (
            <Button variant="contained" color="warning" size="medium"
              startIcon={<TransformIcon />} disabled={saving}
              onClick={handleConvertToPR}>
              {saving ? "Converting..." : "Create PR for Short Items"}
            </Button>
          )}
          {isView && (
            <Button variant="outlined" color="info" size="medium"
              startIcon={<PrintIcon />}
              onClick={function () { window.print(); }}>
              Print
            </Button>
          )}
          <Button variant="outlined" color="secondary" size="medium" startIcon={<ArrowBackIcon />}
            onClick={function () { navigate("/stores/material-issues"); }}>
            {isView ? "Back" : "Cancel"}
          </Button>
        </Box>
      </Box>

      <Fade in timeout={500}>
        <Card sx={{ borderRadius: "16px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", mb: 2.5, border: "1px solid " + cl.border, transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, "&:last-child": { pb: { xs: 1.5, md: 2.5 } } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#1976d2" }} />
              </Box>
              <Typography variant="subtitle2" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.05rem" }}>
                Header Information
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start", mb: 1.5 }}>
              <Box sx={{ width: 130 }}>
                <TextField label="Issue #" size="small" fullWidth value={form.issue_no} disabled InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 180 }}>
                <TextField label="Date" type="datetime-local" size="small" fullWidth value={form.issue_date}
                  onChange={handleChange("issue_date")} disabled={!canEdit}
                  error={Boolean(errors.issue_date)} helperText={errors.issue_date}
                  InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 220, minWidth: 220 }}>
                <TextField label="Department *" size="small" fullWidth select value={form.department}
                  onChange={handleChange("department")} required disabled={!canEdit}
                  error={Boolean(errors.department)} helperText={errors.department}
                  InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {DEPARTMENTS.map(function (d) { return <MenuItem key={d} value={d}>{d}</MenuItem>; })}
                </TextField>
              </Box>
              <Box sx={{ width: 250, minWidth: 220 }}>
                <TextField label="Issued To *" size="small" fullWidth select value={form.issued_to}
                  onChange={handleChange("issued_to")} disabled={!canEdit}
                  error={Boolean(errors.issued_to)} helperText={errors.issued_to}
                  InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select Employee --</MenuItem>
                  {employees.map(function (e) { return <MenuItem key={e.empid || e.id} value={e.ename}>{e.ename} - {e.empid}</MenuItem>; })}
                </TextField>
              </Box>
              <Box sx={{ width: 100 }}>
                <TextField label="Status" size="small" fullWidth value={form.status} disabled InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField label="Remarks" size="small" fullWidth value={form.remarks || ""}
                  onChange={handleChange("remarks")} disabled={!canEdit}
                  placeholder="Enter any notes..." inputProps={{ maxLength: 500 }}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
              <Box sx={{ width: 520, maxWidth: "100%" }}>
                <TextField select size="small" fullWidth label="From MR (optional)" value={form.req_id}
                  onChange={function (e) { handleMrSelect(Number(e.target.value)); }}
                  disabled={!canEdit} InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select Approved MR --</MenuItem>
                  {mrList.map(function (mr) { return <MenuItem key={mr.id} value={mr.id}>{mr.req_no} - {mr.department} ({mr.requested_by})</MenuItem>; })}
                </TextField>
                {function () {
                  if (!selectedMr) return null;
                  return (
                    <Box sx={{ mt: 0.5, px: 1.5, py: 0.75, bgcolor: cl.bgSoft, borderRadius: "8px", border: "1px solid " + cl.border }}>
                      <Typography variant="caption" sx={{ color: cl.textMuted, fontSize: "0.7rem", lineHeight: 1.4 }}>
                        <strong>{selectedMr.req_no}</strong> | {selectedMr.department} | Requested by: {selectedMr.requested_by}
                        {selectedMr.remarks ? <><br />{selectedMr.remarks}</> : ""}
                        {selectedMr.created_date ? <><br />Date: {selectedMr.created_date}</> : ""}
                      </Typography>
                    </Box>
                  );
                }()}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Fade in timeout={600}>
        <Card sx={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid " + cl.border, transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, "&:last-child": { pb: { xs: 1.5, md: 2.5 } } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#2e7d32" }} />
                </Box>
                <Typography variant="subtitle1" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.1rem" }}>Items to Issue</Typography>
                {items.length > 0 && (
                  <span style={{ fontSize: "0.7rem", padding: "1px 8px", borderRadius: 8, fontWeight: 600, background: "#e8f5e9", color: "#2e7d32" }}>
                    {items.length} items
                  </span>
                )}
              </Box>
              {canEdit && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField size="small" placeholder="Search items..." value={itemSearch}
                    onChange={function (e) { setItemSearch(e.target.value); }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
                    sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 32, width: 200, borderRadius: "8px" } }} />
                  <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addItem}
                    sx={{ height: 32, borderRadius: "8px", fontSize: "0.8rem" }}>Add Item</Button>
                </Box>
              )}
            </Box>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 40, border: "1px solid " + cl.border, textAlign: "center" }}>SL#</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 110, border: "1px solid " + cl.border }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, border: "1px solid " + cl.border }}>Description *</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 70, border: "1px solid " + cl.border, textAlign: "center" }}>Avail Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 80, border: "1px solid " + cl.border, textAlign: "center" }}>Issue Qty *</TableCell>
                    {canEdit && <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 40, border: "1px solid " + cl.border }} />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 5, border: "1px solid " + cl.border }}>
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>No items. Click "Add Item" or select an MR to load items.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {(itemSearch ? filteredItems : items).map(function (it, idx) {
                    var available = stockMap[it.item_id] ?? null;
                    var stockColor = available !== null && available === 0 ? "error.main" : available !== null && available < (parseFloat(it.quantity) || 0) ? "warning.main" : "success.main";
                    return (
                      <TableRow key={it.tempId} hover sx={{
                        verticalAlign: "top",
                        bgcolor: idx % 2 === 0 ? "#ffffff" : "#fafcff",
                        "& td": { py: 0.5, px: 0.5, border: "1px solid " + cl.border },
                        "&:hover td": { bgcolor: cl.bgSoft }
                      }}>
                        <TableCell sx={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", width: 40 }}>{idx + 1}</TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5 }}>
                          {canEdit ? (
                            <TextField size="small" fullWidth value={it.item_code}
                              onClick={function () { setItemDialog(idx); }}
                              InputProps={{
                                readOnly: true, endAdornment: (
                                  <InputAdornment position="end"><IconButton size="small" onClick={function () { setItemDialog(idx); }} sx={{ p: 0 }}><SearchIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
                                )
                              }}
                              placeholder="Select"
                              sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 40, cursor: "pointer", borderRadius: "6px" } }} />
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155" }}>{it.item_code || "-"}</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5, minWidth: 200 }}>
                          <Typography variant="body2" sx={{ fontSize: "0.84rem" }}>{it.item_name || ""}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5, textAlign: "center" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: stockColor, fontSize: "0.84rem" }}>
                            {available !== null ? available : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5, textAlign: "center" }}>
                          {canEdit ? (
                            <TextField size="small" fullWidth type="number" value={it.quantity}
                              onChange={handleItemChange(idx, "quantity")} placeholder="Qty"
                              inputProps={{ min: 0, max: it.max_qty || undefined }}
                              sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 40, borderRadius: "6px" } }} />
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: "0.9rem", fontWeight: 700, color: cl.primary }}>{formatQty(it.quantity)}</Typography>
                          )}
                        </TableCell>
                        {canEdit && (
                          <TableCell sx={{ py: 0.5, px: 0.5, textAlign: "center" }}>
                            <IconButton size="small" color="error" onClick={function () { removeItem(idx); }} disabled={items.length <= 1}
                              sx={{ height: 40, transition: "all 0.2s", "&:hover": { transform: "scale(1.15)" } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {items.length > 0 && (
                    <TableRow sx={{ bgcolor: "#e8eefc" }}>
                      <TableCell colSpan={4} sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, px: 1, border: "1px solid " + cl.border, bgcolor: "#dbeafe" }}>TOTALS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", color: cl.primary, border: "1px solid " + cl.border, bgcolor: "#c8e6c9" }}>{totalQty}</TableCell>
                      {canEdit && <TableCell sx={{ border: "1px solid " + cl.border, bgcolor: "#dbeafe" }} />}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            {items.length > 0 && (
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Qty</Typography><Typography fontWeight="bold" sx={{ color: cl.primary, fontSize: "0.9rem" }}>{totalQty}</Typography></Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Fade>

      <ItemSelectDialog open={itemDialog !== null} onClose={function () { setItemDialog(null); }}
        onSelect={handleItemSelect} title="Select Item"
        data={allItems} columns={[
          { key: "item_code", label: "Code" },
          { key: "item_name", label: "Name" },
          { key: "item_description", label: "Description" },
        ]} />

      <PRConversionDialog open={prDlgOpen} onClose={function () { setPrDlgOpen(false); }}
        title="Create Purchase Requisition from Material Issue"
        previewApi={id ? API + "/" + id + "/pr-preview" : null}
        createApi={id ? API + "/" + id + "/create-pr" : null}
        onSuccess={function () { navigate("/stores/material-issues"); }} />
    </Box>
  );
}
