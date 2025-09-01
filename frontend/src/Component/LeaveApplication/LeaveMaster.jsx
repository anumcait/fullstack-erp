import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Snackbar, Alert, Button, Box, Typography } from "@mui/material";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export default function LeaveMasterGrid() {
  const [rows, setRows] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`);
        const employeesWithId = res.data.map((emp, index) => ({
          id: index + 1,
          sno: index + 1,
          empid: emp.empid,
          name: emp.ename,
          department: emp.deptname,
          CLs: emp.CLs || 0,
          ELs: emp.ELs || 0,
          status: ""
        }));
        setRows(employeesWithId);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const saveRowToBackend = async (row) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/leave/master/save`, {
        empid: row.empid,
        cls: row.CLs,
        els: row.ELs,
        final_status: "0"
      });
      setToast({ open: true, message: "Leave master saved successfully!", severity: "success" });
      return { ...row, status: "✅ Saved" };
    } catch (error) {
      setToast({ open: true, message: "Failed to save leave master", severity: "error" });
      return { ...row, status: "❌ Failed" };
    }
  };

  const processRowUpdate = async (newRow) => {
    const updatedRow = await saveRowToBackend(newRow);
    setRows((prev) => prev.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const columns = [
    { field: "sno", headerName: "S.No", width: 80 },
    { field: "empid", headerName: "Emp ID", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "CLs", headerName: "CLs", width: 100, editable: true, type: "number" },
    { field: "ELs", headerName: "ELs", width: 100, editable: true, type: "number" },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Leave Master Management
      </Typography>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </div>
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
