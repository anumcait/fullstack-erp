import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDateOnly } from "../../../utils/dateUtils";

const LeaveMaster = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    empid: "",
    cls_balance: 0,
    cls_utilised: 0,
    els_balance: 0,
    els_utilised: 0,
    yr: new Date().getFullYear(),
    remarks: "",
    final_status: "0"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const nowYear = new Date().getFullYear();
  const filtered = employees.filter(emp =>
    emp.empid?.toString().includes(searchTerm) ||
    emp.ename?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const tot = {
    clb: filtered.reduce((s, e) => s + Number(e.cls_balance || 0), 0),
    clu: filtered.reduce((s, e) => s + Number(e.cls_utilised || 0), 0),
    elb: filtered.reduce((s, e) => s + Number(e.els_balance || 0), 0),
    elu: filtered.reduce((s, e) => s + Number(e.els_utilised || 0), 0),
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      const empWithLeave = res.data.map((emp, idx) => ({
        id: emp.empid,
        sno: idx + 1,
        empid: emp.empid,
        ename: emp.ename,
        deptname: emp.deptname || "-",
        division: emp.divname || "-",
        unit: emp.unit_id || "-",
        cls_balance: emp.LeaveMaster?.cls_balance || 0,
        cls_utilised: emp.LeaveMaster?.cls_utilised || 0,
        els_balance: emp.LeaveMaster?.els_balance || 0,
        els_utilised: emp.LeaveMaster?.els_utilised || 0,
        yr: emp.LeaveMaster?.yr || new Date().getFullYear(),
        final_status: emp.LeaveMaster?.final_status || "0"
      }));
      setEmployees(empWithLeave);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (emp = null) => {
    if (emp) {
      setFormData({
        empid: emp.empid,
        cls_balance: emp.cls_balance,
        cls_utilised: emp.cls_utilised,
        els_balance: emp.els_balance,
        els_utilised: emp.els_utilised,
        yr: emp.yr,
        remarks: "",
        final_status: emp.final_status
      });
      setEditMode(true);
    } else {
      setFormData({
        empid: "",
        cls_balance: 0,
        cls_utilised: 0,
        els_balance: 0,
        els_utilised: 0,
        yr: new Date().getFullYear(),
        remarks: "",
        final_status: "0"
      });
      setEditMode(false);
    }
    setDialog(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.empid) {
      showToast("Please select an employee", "error");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/leave/master/save`, {
        empid: parseInt(formData.empid),
        cls_balance: parseFloat(formData.cls_balance) || 0,
        cls_utilised: parseFloat(formData.cls_utilised) || 0,
        els_balance: parseFloat(formData.els_balance) || 0,
        els_utilised: parseFloat(formData.els_utilised) || 0,
        yr: formData.yr,
        remarks: formData.remarks,
        final_status: formData.final_status
      });
      showToast("✅ Leave master saved successfully", "success");
      setDialog(false);
      fetchEmployees();
    } catch (err) {
      showToast("❌ Error saving leave master", "error");
    }
  };

  return (
    <Card sx={{ m: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5, lineHeight: 1.2 }}>Leave Master</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} fontSize="small" />,
            }}
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchEmployees} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Leave Config
          </Button>
        </Box>
      </Box>

      <CardContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Table size="small" sx={{
          tableLayout: 'fixed',
          width: '100%',
          border: '1px solid #ccc',
          '& .MuiTableCell-root': {
            px: 1,
            py: 0.5,
            fontSize: '12px',
            fontWeight: 500
          }
        }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f1f1f1' }}>
              <TableCell sx={{ width: '50px', fontSize: '12px' }}><strong>S.No</strong></TableCell>
              <TableCell sx={{ width: '90px', fontSize: '12px' }}><strong>Emp ID</strong></TableCell>
              <TableCell sx={{ minWidth: '350px', width: '350px', fontSize: '12px' }}><strong>Name</strong></TableCell>
              <TableCell sx={{ width: '130px', fontSize: '12px' }}><strong>Department</strong></TableCell>
              <TableCell sx={{ width: '90px', fontSize: '12px' }} align="right"><strong>CL Bal</strong></TableCell>
              <TableCell sx={{ width: '90px', fontSize: '12px' }} align="right"><strong>CL Util</strong></TableCell>
              <TableCell sx={{ width: '90px', fontSize: '12px' }} align="right"><strong>EL Bal</strong></TableCell>
              <TableCell sx={{ width: '90px', fontSize: '12px' }} align="right"><strong>EL Util</strong></TableCell>
              <TableCell sx={{ width: '80px', fontSize: '12px' }} align="right"><strong>Total</strong></TableCell>
              <TableCell sx={{ width: '70px', fontSize: '12px' }} align="center"><strong>Year</strong></TableCell>
              <TableCell sx={{ width: '70px', fontSize: '12px' }} align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 3, color: '#777' }}>
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => {
                const past = Number(emp.yr) < nowYear;
                const noBal = Number(emp.cls_balance || 0) === 0 && Number(emp.els_balance || 0) === 0;
                const empTotal = (Number(emp.cls_balance || 0) + Number(emp.els_balance || 0));
                let sc, bg;
                if (past) { sc = '#999'; bg = '#f0f0f0'; }
                else if (noBal) { sc = '#c62828'; bg = '#ffebee'; }
                else { sc = '#2e7d32'; bg = '#e8f5e9'; }
                return (
                  <TableRow key={emp.empid} sx={{ bgcolor: bg }}>
                    <TableCell sx={{ color: sc }}>{emp.sno}</TableCell>
                    <TableCell sx={{ color: sc }}>{emp.empid}</TableCell>
                    <TableCell sx={{ color: sc, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.ename}
                    </TableCell>
                    <TableCell sx={{ color: sc, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.deptname}
                    </TableCell>
                    <TableCell sx={{ color: sc }} align="right">{emp.cls_balance}</TableCell>
                    <TableCell sx={{ color: sc }} align="right">{emp.cls_utilised}</TableCell>
                    <TableCell sx={{ color: sc }} align="right">{emp.els_balance}</TableCell>
                    <TableCell sx={{ color: sc }} align="right">{emp.els_utilised}</TableCell>
                    <TableCell sx={{ color: sc, fontWeight: 600 }} align="right">{empTotal}</TableCell>
                    <TableCell sx={{ color: sc }} align="center">{emp.yr}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(emp)}>
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {filtered.length > 0 && (
              <TableRow sx={{ bgcolor: '#e3f2fd', fontWeight: 'bold' }}>
                <TableCell sx={{ fontWeight: 700 }} colSpan={4}>Grand Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">{tot.clb}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">{tot.clu}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">{tot.elb}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">{tot.elu}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">{tot.clb + tot.elb}</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Leave Configuration' : 'Add Leave Configuration'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1, px: 1 }}>
            {/* Row 1: Employee Select & Year */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 350 }}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    name="empid"
                    value={formData.empid}
                    onChange={handleChange}
                    label="Employee"
                    disabled={editMode}
                  >
                    <MenuItem value=""><em>Select Employee</em></MenuItem>
                    {employees.map(emp => (
                      <MenuItem key={emp.empid} value={emp.empid}>
                        {emp.empid} - {emp.ename}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField sx={{ width: 120 }} size="small" label="Year" type="number" name="yr" value={formData.yr} onChange={handleChange} />
              </Box>
            </Grid>

            {/* Row 2: Casual Leaves */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Casual Leave (CL)</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField sx={{ width: 160 }} size="small" label="Balance" type="number" name="cls_balance" value={formData.cls_balance} onChange={handleChange} />
                <TextField sx={{ width: 160 }} size="small" label="Utilized" type="number" name="cls_utilised" value={formData.cls_utilised} onChange={handleChange} />
              </Box>
            </Grid>

            {/* Row 3: Earned Leaves */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Earned Leave (EL)</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField sx={{ width: 160 }} size="small" label="Balance" type="number" name="els_balance" value={formData.els_balance} onChange={handleChange} />
                <TextField sx={{ width: 160 }} size="small" label="Utilized" type="number" name="els_utilised" value={formData.els_utilised} onChange={handleChange} />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default LeaveMaster;
