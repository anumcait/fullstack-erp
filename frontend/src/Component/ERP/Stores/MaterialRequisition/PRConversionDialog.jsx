import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, IconButton, Box, MenuItem, InputAdornment, LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import ItemSelectDialog from "../ItemMaster/ItemSelectDialog";

const ITEMS_API = "/api/erp/stores/items";
const STOCK_API = "/api/erp/stores/stock";

const emptyItem = () => ({
  tempId: Date.now() + Math.random(),
  item_id: "", item_code: "", item_name: "", unit_id: "",
  quantity: "", remarks: "",
});

export default function PRConversionDialog({ open, onClose, title, previewApi, createApi, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [items, setItems] = useState([]);
  const [itemDialog, setItemDialog] = useState(null);
  const [docInfo, setDocInfo] = useState(null);

  useEffect(function () {
    if (!open) return;
    setLoading(true);
    Promise.all([
      axios.get(ITEMS_API).catch(function () { return { data: [] }; }),
      axios.get(STOCK_API).catch(function () { return { data: [] }; }),
    ]).then(function (results) {
      setAllItems(results[0].data || []);
      var map = {};
      (results[1].data || []).forEach(function (it) { map[it.id] = Number(it.current_stock || 0); });
      setStockMap(map);
    });
  }, [open]);

  useEffect(function () {
    if (!open || !previewApi) return;
    setLoading(true);
    axios.post(previewApi).then(function (resp) {
      var data = resp.data;
      setDocInfo(data);
      setItems((data.items || []).map(function (it) {
        return {
          tempId: Date.now() + Math.random(),
          item_id: it.item_id, item_code: it.item_code, item_name: it.item_name,
          unit_id: it.unit_id, quantity: it.suggested_qty || it.quantity || "",
          remarks: "",
          _requested: it.requested,
          _available: it.available,
          _suggested: it.suggested_qty,
        };
      }));
    }).catch(function (err) {
      showToast(err.response?.data?.error || "Failed to load preview", "error");
      onClose();
    }).finally(function () { setLoading(false); });
  }, [open, previewApi]);

  var handleQtyChange = function (tempId, value) {
    setItems(function (prev) { return prev.map(function (i) { return i.tempId === tempId ? { ...i, quantity: value } : i; }); });
  };

  var handleRemarksChange = function (tempId, value) {
    setItems(function (prev) { return prev.map(function (i) { return i.tempId === tempId ? { ...i, remarks: value } : i; }); });
  };

  var addItem = function () { setItems(function (prev) { return prev.concat([emptyItem()]); }); };
  var removeItem = function (idx) {
    setItems(function (prev) { return prev.length > 1 ? prev.filter(function (_, i) { return i !== idx; }) : prev; });
  };

  var handleItemSelect = function (item) {
    if (itemDialog === null) return;
    setItems(function (prev) {
      var updated = prev.slice();
      var available = stockMap[item.id] || 0;
      updated[itemDialog] = {
        ...updated[itemDialog],
        item_id: item.id, item_code: item.item_code, item_name: item.item_name,
        unit_id: item.unit_id || "", quantity: "",
        remarks: "", _requested: 0, _available: available, _suggested: 0,
      };
      return updated;
    });
    setItemDialog(null);
  };

  var totalQty = useMemo(function () {
    return items.reduce(function (a, i) { return a + (parseFloat(i.quantity) || 0); }, 0);
  }, [items]);

  var handleCreate = async function () {
    var validItems = items.filter(function (i) { return i.item_name && parseFloat(i.quantity) > 0; });
    if (validItems.length === 0) {
      showToast("Add at least one item with qty", "warning");
      return;
    }
    setCreating(true);
    try {
      var resp = await axios.post(createApi, {
        items: validItems.map(function (i) {
          return { item_id: i.item_id, item_code: i.item_code, item_name: i.item_name, quantity: parseFloat(i.quantity), unit_id: i.unit_id || null, remarks: i.remarks || "" };
        }),
        remarks: `PR created from ${docInfo?.doc_no || ""}`,
      });
      showToast(resp.data.message, "success");
      if (onSuccess) onSuccess(resp.data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create PR", "error");
    } finally { setCreating(false); }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          {title || "Create Purchase Requisition"}
        </DialogTitle>
        {loading ? (
          <DialogContent sx={{ py: 4 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
              Checking stock levels...
            </Typography>
          </DialogContent>
        ) : (
          <>
            <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
              {docInfo && (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Typography variant="body2"><strong>Ref #:</strong> {docInfo.doc_no}</Typography>
                  {docInfo.doc_date && <Typography variant="body2"><strong>Date:</strong> {docInfo.doc_date?.split("T")[0]}</Typography>}
                  {docInfo.doc_department && <Typography variant="body2"><strong>Dept:</strong> {docInfo.doc_department}</Typography>}
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Items for Purchase ({items.length})
                </Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addItem}
                  sx={{ height: 32, borderRadius: "8px", fontSize: "0.8rem" }}>
                  Add Item
                </Button>
              </Box>
              <Table size="small" sx={{ borderCollapse: "collapse", "& td, & th": { border: "1px solid #e0e0e0", px: 1, py: 0.75, fontSize: "0.8rem" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 35, textAlign: "center" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 120 }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 65, textAlign: "center" }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 75, textAlign: "center" }}>Requested</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 80, textAlign: "center" }}>Purchase Qty</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Remarks</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 35, textAlign: "center" }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map(function (it, idx) {
                    var available = it._available ?? stockMap[it.item_id] ?? null;
                    return (
                      <TableRow key={it.tempId} hover sx={{ bgcolor: idx % 2 === 0 ? "#ffffff" : "#fafcff" }}>
                        <TableCell sx={{ textAlign: "center", color: "#94a3b8" }}>{idx + 1}</TableCell>
                        <TableCell>
                          <TextField size="small" fullWidth value={it.item_code}
                            onClick={function () { setItemDialog(idx); }}
                            InputProps={{
                              readOnly: true, endAdornment: (
                                <InputAdornment position="end"><IconButton size="small" onClick={function () { setItemDialog(idx); }} sx={{ p: 0 }}><SearchIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
                              )
                            }}
                            placeholder="Select"
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 36, cursor: "pointer", borderRadius: "6px" } }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{it.item_name || ""}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600, color: available !== null && available === 0 ? "error.main" : available !== null && available < parseFloat(it.quantity || 0) ? "warning.main" : "success.main" }}>
                          {available !== null ? available : "-"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{it._requested || "-"}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <TextField type="number" size="small" value={it.quantity || ""}
                            onChange={function (e) { handleQtyChange(it.tempId, e.target.value); }}
                            inputProps={{ min: 0, step: 1 }}
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 36, borderRadius: "6px", fontWeight: 600 } }} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" fullWidth value={it.remarks || ""}
                            onChange={function (e) { handleRemarksChange(it.tempId, e.target.value); }}
                            placeholder="Remarks"
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 36, borderRadius: "6px" } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <IconButton size="small" color="error" onClick={function () { removeItem(idx); }} disabled={items.length <= 1}
                            sx={{ height: 36 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length > 0 && (
                    <TableRow sx={{ bgcolor: "#e8eefc" }}>
                      <TableCell colSpan={5} sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, px: 1, bgcolor: "#dbeafe" }}>TOTALS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textAlign: "right", color: "primary.main", bgcolor: "#c8e6c9" }}>{totalQty}</TableCell>
                      <TableCell sx={{ bgcolor: "#dbeafe" }} />
                      <TableCell sx={{ bgcolor: "#dbeafe" }} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {items.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: "center", py: 4, color: "#94a3b8", fontStyle: "italic" }}>
                  No items with insufficient stock found. Click "Add Item" to add manually.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleCreate}
                disabled={creating || items.filter(function (i) { return i.item_name && parseFloat(i.quantity) > 0; }).length === 0}>
                {creating ? "Creating PR..." : "Create Purchase Requisition"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <ItemSelectDialog open={itemDialog !== null} onClose={function () { setItemDialog(null); }}
        onSelect={handleItemSelect} title="Select Item"
        data={allItems} columns={[
          { key: "item_code", label: "Code" },
          { key: "item_name", label: "Name" },
          { key: "item_description", label: "Description" },
        ]} />
    </>
  );
}
