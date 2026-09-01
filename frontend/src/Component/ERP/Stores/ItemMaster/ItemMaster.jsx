import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Card, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab,
  IconButton, Tooltip, Chip, LinearProgress, Alert
} from "@mui/material";
import StandardTable from '../../../../Component/Common/StandardTable';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/stores/items";

function naturalCompare(a, b) {
  const am = String(a).match(/(\d+)|(\D+)/g) || [];
  const bm = String(b).match(/(\d+)|(\D+)/g) || [];
  for (let i = 0; i < Math.min(am.length, bm.length); i++) {
    const x = am[i], y = bm[i];
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    if (xn && yn) {
      const diff = Number(x) - Number(y);
      if (diff !== 0) return diff;
    } else if (xn !== yn) {
      return xn ? -1 : 1;
    } else {
      const c = x.localeCompare(y);
      if (c !== 0) return c;
    }
  }
  return am.length - bm.length;
}

const CATEGORY_GROUPS = {
  All: null,
  Items: ["Raw Material", "Consumables", "Packing Material", "Spares"],
  "Sub-Assemblies": ["Sub Assembly"],
  Products: ["Finished Goods"],
  "Needs Review": ["Needs Review"],
};

export default function ItemMaster() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [category, setCategory] = useState("All");
  const [itemTypes, setItemTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const visibleItems = useMemo(() => {
    const groups = CATEGORY_GROUPS[category];
    if (!groups) return items;
    return items.filter((it) => groups.includes(it?.group?.name));
  }, [items, category]);

  const GROUP_COLORS = {
    "Raw Material": "default",
    "Consumables": "info",
    "Sub Assembly": "secondary",
    "Packing Material": "warning",
    "Finished Goods": "success",
    "Spares": "error",
    "Needs Review": "warning",
  };

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type_id = typeFilter;
      const { data } = await axios.get(API, { params });
      data.sort((a, b) => naturalCompare(a.item_code, b.item_code));
      setItems(data.map((it, i) => ({ ...it, sno: i + 1 })));
    } catch {
      showToast("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchItems();
    axios.get("/api/erp/stores/item-types").then(({ data }) => setItemTypes(data)).catch(() => {});
    axios.get("/api/erp/stores/groups").then(({ data }) => setGroups(data)).catch(() => {});
  }, [fetchItems]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget}`);
      showToast("Item deactivated", "success");
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  const columns = [
    { field: "sno", headerName: "S.No", width: 70, sortable: false },
    { field: "item_code", headerName: "Item Code", width: 130, sortComparator: (a, b) => naturalCompare(a, b) },
    {
      field: "item_name",
      headerName: "Item Name",
      width: 220,
      editable: true,
      renderCell: (params) => {
        if (BLANK_NAME(params.value)) {
          return (
            <Typography component="span" sx={{ fontStyle: "italic", color: "text.disabled" }}>
              {params.row.item_code}
            </Typography>
          );
        }
        return <>{params.value}</>;
      },
    },
    {
      field: "group",
      headerName: "Group",
      width: 160,
      editable: true,
      type: "singleSelect",
      valueOptions: groups.map((g) => ({ value: g.name, label: g.name })),
      valueGetter: (value, row) => row?.group?.name || "-",
      renderCell: (params) => (
        <Chip label={params.value || "-"} color={GROUP_COLORS[params.value] || "default"} size="small" />
      ),
    },
    {
      field: "subgroup",
      headerName: "Sub Group",
      width: 150,
      valueGetter: (value, row) => row?.subGroup?.name || "-",
    },
    {
      field: "type",
      headerName: "Type",
      width: 160,
      valueGetter: (value, row) => row?.type?.name || "-",
    },
    {
      field: "subtype",
      headerName: "Sub Type",
      width: 150,
      valueGetter: (value, row) => row?.subType?.name || "-",
    },
    {
      field: "unit",
      headerName: "UOM",
      width: 100,
      valueGetter: (value, row) => row?.unit?.short_name || row?.unit?.name || "-",
    },
    { field: "current_stock", headerName: "Stock", width: 100, type: "number" },
    { field: "standard_cost", headerName: "Std Cost", width: 110, type: "number" },
    { field: "last_purchase_cost", headerName: "Last Cost", width: 110, type: "number" },
    { field: "gst_rate", headerName: "GST %", width: 90, type: "number" },
    { field: "hsn_code", headerName: "HSN", width: 110 },
    {
      field: "is_active",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/stores/item-master/edit/${params.row.id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteTarget(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const BLANK_NAME = (v) => !v || v === "-" || v === ".";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--heading-color)", lineHeight: 1.2 }}>
            Item Master
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"} listed
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by code, name, HSN..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }}
            sx={{ minWidth: 260 }}
          />
          <TextField
            size="small"
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <option value="">All</option>
            {itemTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </TextField>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchItems}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/stores/item-master/add")}>
            Add Item
          </Button>
        </Box>
      </Box>

      <Tabs value={category} onChange={(e, v) => setCategory(v)} sx={{ mb: 1.5 }}>
        {Object.keys(CATEGORY_GROUPS).map((c) => (
          <Tab key={c} value={c} label={c === "Items" ? "Item Master" : c === "Sub-Assemblies" ? "Sub-Assemblies" : c === "Products" ? "Products" : c} />
        ))}
      </Tabs>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <StandardTable
          title="Item Master"
          rows={visibleItems}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
        />
        {loading && <LinearProgress />}
      </Card>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Deactivate Item?</DialogTitle>
        <DialogContent>
          <Typography>This will mark the item as inactive. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Deactivate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
