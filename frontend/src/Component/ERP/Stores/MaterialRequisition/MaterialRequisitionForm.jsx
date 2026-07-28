import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, MenuItem,
  IconButton, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment, Tooltip, Stack, Fade, useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TransformIcon from "@mui/icons-material/Transform";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import ItemSelectDialog from "../ItemMaster/ItemSelectDialog";
import { formatQty } from "../../../../utils/format";
import PRConversionDialog from "./PRConversionDialog";

const API = "/api/erp/stores/material-requisitions";
const ITEMS_API = "/api/erp/stores/items";
const STOCK_API = "/api/erp/stores/stock";
const UNITS_API = "/api/erp/stores/units";
const EMPLOYEE_API = "/api/employees";

const DEPARTMENTS = ["Production", "Assembly", "Maintenance", "Quality", "Stores", "Engineering", "Admin"];

const emptyItem = () => ({ item_id: "", item_code: "", item_name: "", unit_id: "", uom: "NOS", quantity: "", remarks: "", issued_quantity: 0, pending_quantity: 0 });

export default function MaterialRequisitionForm() {
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
  const [items, setItems] = useState([emptyItem()]);
  const [allItems, setAllItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [itemSearch, setItemSearch] = useState("");
  const [itemDialog, setItemDialog] = useState(null);
  const [prDlgOpen, setPrDlgOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    req_no: "", req_date: new Date().toISOString().split('T')[0],
    department: "", requested_by: "", remarks: "", status: "Draft",
  });

  var fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34, borderRadius: "8px" },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 },
  };

  const fetchNextNumber = useCallback(function () {
    if (id) return;
    axios.get(API + "/next-number").then(function (resp) {
      setForm(function (f) { return { ...f, req_no: resp.data.req_no || "" }; });
    }).catch(function () { });
  }, [id]);

  useEffect(function () { fetchNextNumber(); }, [fetchNextNumber]);

  useEffect(function () {
    Promise.all([
      axios.get(ITEMS_API).catch(function () { return { data: [] }; }),
      axios.get(STOCK_API).catch(function () { return { data: [] }; }),
      axios.get(UNITS_API).catch(function () { return { data: [] }; }),
      axios.get(EMPLOYEE_API).catch(function () { return { data: [] }; }),
    ]).then(function (results) {
      setAllItems(results[0].data || []);
      var map = {};
      (results[1].data || []).forEach(function (it) { map[it.id] = Number(it.current_stock || 0); });
      setStockMap(map);
      setUnits(results[2].data || []);
      setEmployees(results[3].data || []);
    });
    if (id) {
      setLoading(true);
      axios.get(API + "/" + id).then(function (resp) {
        var data = resp.data;
        setForm({
          req_no: data.req_no || "", req_date: data.req_date ? data.req_date.slice(0, 16) : "",
          department: data.department || "", requested_by: data.requested_by || "",
          remarks: data.remarks || "", status: data.status || "Draft",
        });
        setItems((data.items || []).map(function (i) {
          return {
            item_id: i.item_id || "", item_code: i.item_code || "", item_name: i.item_name || "",
            unit_id: i.unit_id || "", uom: i.uom || "NOS",
            quantity: formatQty(i.quantity),
            remarks: i.remarks || "",
            issued_quantity: i.issued_quantity || 0,
            pending_quantity: i.pending_quantity || 0,
          };
        }));
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

  var handleItemChange = useCallback(function (idx, field) {
    return function (e) {
      setItems(function (prev) {
        var updated = prev.slice();
        updated[idx][field] = e.target.value;
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
      updated[itemDialog] = {
        ...updated[itemDialog],
        item_id: item.id || "",
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        uom: item.uom || "NOS",
        unit_id: item.unit_id || "",
      };
      return updated;
    });
    setItemDialog(null);
  }, [itemDialog]);

  var filteredItems = useMemo(function () {
    var q = itemSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter(function (it) { return Object.values(it).some(function (v) { return String(v || "").toLowerCase().indexOf(q) >= 0; }); });
  }, [itemSearch, items]);

  var canEdit = form.status === "Draft" && !isView;
  var canSubmit = form.status === "Draft" && items.some(function (i) { return i.item_name && parseFloat(i.quantity) > 0; });

  var validate = useCallback(function () {
    var errs = {};
    if (!form.department) errs.department = "Required";
    if (!form.requested_by) errs.requested_by = "Required";
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
      var doSave = async function (reqNum) {
        try {
          var payload = {
            ...form, req_no: reqNum || form.req_no, status: status || form.status,
            items: items.map(function (i) { return { ...i, quantity: parseFloat(i.quantity) || 0, unit_id: i.unit_id || null }; }),
          };
          if (isEdit) { await axios.put(API + "/" + id, payload); showToast("Updated", "success"); }
          else { await axios.post(API, payload); showToast("Created", "success"); }
          navigate("/stores/material-requisitions");
        } catch (err) { showToast((err.response && err.response.data && err.response.data.error) || "Failed", "error"); }
        finally { setSaving(false); }
      };
      if (!id) {
        try { var resp = await axios.get(API + "/next-number"); doSave(resp.data.req_no); }
        catch { doSave(form.req_no); }
      } else { doSave(form.req_no); }
    };
  }, [form, items, isEdit, id, validate, showToast, navigate]);

  var handleApprove = useCallback(async function () {
    setSaving(true);
    try {
      await axios.put(API + "/" + id + "/approve", { approved_by: localStorage.getItem("empName") || "System" });
      showToast("Approved", "success");
      navigate("/stores/material-requisitions");
    } catch (err) { showToast((err.response && err.response.data && err.response.data.error) || "Failed", "error"); }
    finally { setSaving(false); }
  }, [id, showToast, navigate]);

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
          {isView ? "Material Requisition Details" : isEdit ? "Edit Material Requisition" : "New Material Requisition"}
          {form.status && (
            <span style={{ marginLeft: 12, fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600, background: form.status === "Approved" ? "#e8f5e9" : form.status === "Draft" ? "#f5f5f5" : "#fff3e0", color: form.status === "Approved" ? "#2e7d32" : form.status === "Draft" ? "#666" : "#e65100" }}>
              {form.status}
            </span>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && (
            <>
              <Button variant="contained" color="primary" size="medium" onClick={handleSubmit("Draft")}
                startIcon={<SaveIcon />} disabled={saving}>
                {saving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button variant="contained" color="success" size="medium"
                startIcon={<SendIcon />} disabled={saving || !canSubmit}
                onClick={handleSubmit("Pending")}>
                {saving ? "Saving..." : "Submit for Approval"}
              </Button>
            </>
          )}
          {isView && form.status === "Pending" && (
            <Button variant="contained" color="success" size="medium"
              startIcon={<CheckCircleIcon />} disabled={saving}
              onClick={handleApprove}>
              {saving ? "Approving..." : "Approve"}
            </Button>
          )}
          {isView && form.status === "Approved" && (
            <Button variant="contained" color="warning" size="medium"
              startIcon={<TransformIcon />} disabled={saving}
              onClick={handleConvertToPR}>
              {saving ? "Converting..." : "Convert to PR"}
            </Button>
          )}
          {isView && (
            <Button variant="outlined" color="info" size="medium"
              startIcon={<PrintIcon />}
              onClick={function () { navigate("/stores/material-requisitions/print/" + id); }}>
              Print
            </Button>
          )}
          <Button variant="outlined" color="secondary" size="medium" startIcon={<CancelIcon />}
            onClick={function () { navigate("/stores/material-requisitions"); }}>
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
              <Typography variant="subtitle2" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.05rem" }}>Header Information</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start", mb: 1.5 }}>
              <Box sx={{ width: 220, minWidth: 220 }}>
                <TextField label="Department *" size="small" fullWidth select value={form.department}
                  onChange={handleChange("department")} required disabled={!canEdit}
                  error={Boolean(errors.department)} helperText={errors.department}
                  InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {DEPARTMENTS.map(function (d) { return <MenuItem key={d} value={d}>{d}</MenuItem>; })}
                </TextField>
              </Box>
              <Box sx={{ width: 220, minWidth: 200 }}>
                <TextField label="Requested By *" size="small" fullWidth select value={form.requested_by}
                  onChange={handleChange("requested_by")} required disabled={!canEdit}
                  error={Boolean(errors.requested_by)} helperText={errors.requested_by}
                  InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {employees.map(function (e) { return <MenuItem key={e.empid || e.id} value={e.ename}>{e.ename} - {e.empid}</MenuItem>; })}
                </TextField>
              </Box>
              <Box sx={{ width: 100 }}>
                <TextField label="MR #" size="small" fullWidth value={form.req_no} disabled InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 200 }}>
                <TextField label="Date" type="datetime-local" size="small" fullWidth value={form.req_date ? form.req_date.slice(0, 16) : ""}
                  disabled InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 110 }}>
                <TextField label="Status" size="small" fullWidth value={form.status} disabled InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField label="Remarks" size="small" fullWidth value={form.remarks || ""}
                  onChange={handleChange("remarks")} disabled={!canEdit}
                  placeholder="Enter any notes..." inputProps={{ maxLength: 500 }}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} />
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
                <Typography variant="subtitle1" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.1rem" }}>Item Details</Typography>
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
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 60, border: "1px solid " + cl.border, textAlign: "center" }}>UOM</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 60, border: "1px solid " + cl.border, textAlign: "center" }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 80, border: "1px solid " + cl.border, textAlign: "center" }}>Qty *</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, border: "1px solid " + cl.border }}>Remarks</TableCell>
                    {canEdit && <TableCell sx={{ fontWeight: 700, fontSize: "0.79rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: 40, border: "1px solid " + cl.border }} />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 8 : 7} align="center" sx={{ py: 5, border: "1px solid " + cl.border }}>
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>No items. Click "Add Item" to start.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {(itemSearch ? filteredItems : items).map(function (it, idx) {
                    var available = stockMap[it.item_id] ?? null;
                    var stockColor = available !== null && available === 0 ? "error.main" : available !== null && available < (parseFloat(it.quantity) || 0) ? "warning.main" : "success.main";
                    return (
                      <TableRow key={idx} hover sx={{
                        verticalAlign: "top",
                        bgcolor: idx % 2 === 0 ? "#ffffff" : "#fafcff",
                        "& td": { py: 0.5, px: 0.5, border: "1px solid " + cl.border },
                        "&:hover td": { bgcolor: cl.bgSoft }
                      }}>
                        <TableCell sx={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", width: 40 }}>{idx + 1}</TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5 }}>
                          <TextField size="small" fullWidth value={it.item_code}
                            onClick={function () { if (canEdit) setItemDialog(idx); }} disabled={!canEdit}
                            InputProps={{
                              readOnly: true, endAdornment: canEdit && (
                                <InputAdornment position="end"><IconButton size="small" onClick={function () { setItemDialog(idx); }} sx={{ p: 0 }}><SearchIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
                              )
                            }}
                            placeholder="Select"
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 40, cursor: canEdit ? "pointer" : "default", borderRadius: "6px" } }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5, minWidth: 200 }}>
                          <Typography variant="body2" sx={{ fontSize: "0.84rem" }}>{it.item_name || ""}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: "0.84rem", textAlign: "center" }}>{it.uom || "NOS"}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5, textAlign: "center" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: stockColor, fontSize: "0.84rem" }}>
                            {available !== null ? available : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5, textAlign: "center" }}>
                          <TextField size="small" fullWidth type="number" value={it.quantity}
                            onChange={handleItemChange(idx, "quantity")} required disabled={!canEdit}
                            placeholder="Qty"
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 40, borderRadius: "6px" } }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, px: 0.5 }}>
                          <TextField size="small" fullWidth value={it.remarks || ""}
                            onChange={handleItemChange(idx, "remarks")} disabled={!canEdit}
                            placeholder="Remarks"
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 40, borderRadius: "6px" } }} />
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
                      <TableCell colSpan={5} sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, px: 1, border: "1px solid " + cl.border, bgcolor: "#dbeafe" }}>TOTALS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", color: cl.primary, border: "1px solid " + cl.border, bgcolor: "#c8e6c9" }}>{totalQty}</TableCell>
                      <TableCell sx={{ border: "1px solid " + cl.border, bgcolor: "#dbeafe" }} />
                      {canEdit && <TableCell sx={{ border: "1px solid " + cl.border, bgcolor: "#dbeafe" }} />}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            {items.length > 0 && (
              <Box sx={{ mt: 2 }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Qty</Typography><Typography fontWeight="bold" sx={{ color: cl.primary, fontSize: "0.9rem" }}>{totalQty}</Typography></Box>
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
        title="Create Purchase Requisition from MR"
        previewApi={id ? API + "/" + id + "/pr-preview" : null}
        createApi={id ? API + "/" + id + "/create-pr" : null}
        onSuccess={function () { navigate("/stores/material-requisitions"); }} />
    </Box>
  );
}