import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LeaveGrid from "./LeaveGrid";
import "./LeaveApplication.css";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import {
  TextField, Typography, Button, Grid, Box, Card, CardContent,
  Stack, IconButton, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem,Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";



axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const LeaveForm = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lappNo: "",
    date: new Date().toISOString().split("T")[0],
    empId: "",
    ename: "",
    department: "",
    designation: "",
    purpose: "PERSONAL",
    clUsed: 0,
    clBalance: 0,
    elUsed: 0,
    elBalance: 0,
    address: "",
    phone: "",
  });

  const [leaveDetails, setLeaveDetails] = useState([
    { dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" },
  ]);

  const [employeeList, setEmployeeList] = useState([]);
  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [empSearch, setEmpSearch] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [gridKey, setGridKey] = useState(Date.now());

  const purposeRef = useRef(null);

  // Filter employee list
  const filteredEmpList = employeeList.filter(
    (emp) =>
      emp.empid.toString().includes(empSearch) ||
      emp.ename.toLowerCase().includes(empSearch.toLowerCase())
  );

  // Load employee list
  const loadEmpList = async (e = null) => {
    if (e?.key) {
      if (e.key === "F9") {
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setTimeout(() => {
          const firstRow = document.querySelector(".popup-table tbody tr");
          if (firstRow) firstRow.focus();
        }, 100);
        return;
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowEmpPopup(false);
        return;
      } else {
        return;
      }
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`);
      setEmployeeList(res.data);
      setShowEmpPopup(true);
      setSelectedRowIndex(0);
      setTimeout(() => {
        const firstRow = document.querySelector(".popup-table tbody tr");
        if (firstRow) firstRow.focus();
      }, 100);
    } catch (err) {
      showToast("Failed to load employee list", "error");
    }
  };

  const selectEmployee = async (emp) => {
    setFormData((prev) => ({
      ...prev,
      empId: emp.empid,
      ename: emp.ename,
      department: emp.department,
      designation: emp.designation,
      clUsed: 0,
      clBalance: 0,
      elUsed: 0,
      elBalance: 0,
    }));
    setShowEmpPopup(false);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/leave/balance/${emp.empid}`
      );
      setFormData((prev) => ({
        ...prev,
        clUsed: res.data.clUsed,
        clBalance: res.data.clBalance,
        elUsed: res.data.elUsed,
        elBalance: res.data.elBalance,
      }));
    } catch (error) {
      showToast("Failed to fetch leave balance", "error");
    }

    setTimeout(() => {
      document.querySelector('[name="purpose"]').focus();
    }, 0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    navigate("/leave-report");
  };

  const validateForm = () => {
    if (!formData.empId) {
      showToast("Please fill mandatory employee details", "error");
      return false;
    }
    for (let i = 0; i < leaveDetails.length; i++) {
      const row = leaveDetails[i];
      if (!row.fromDate || !row.toDate || !row.dayType || !row.noOfDays) {
        showToast(`Row ${i + 1}: Please fill all fields.`, "error");
        return false;
      }
      if (new Date(row.fromDate) > new Date(row.toDate)) {
        showToast(
          `Row ${i + 1}: From date should be before or equal to To date.`,
          "error"
        );
        return false;
      }
    }
    return true;
  };

  const resetForm = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leave/next-lno`);
      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        lappNo: data.nextLno,
        empId: "",
        ename: "",
        department: "",
        designation: "",
        purpose: "PERSONAL",
        address: "",
        phone: "",
        clUsed: 0,
        clBalance: 0,
        elUsed: 0,
        elBalance: 0,
      }));

      setLeaveDetails([
        {
          dayType: "FULL DAY",
          fromDate: "",
          toDate: "",
          noOfDays: "",
          remarks: "",
        },
      ]);
      setGridKey(Date.now());
    } catch (error) {
      showToast("Failed to fetch next leave number", "error");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const application = {
      lno: parseInt(formData.lappNo),
      ldate: new Date(),
      empid: parseInt(formData.empId),
      ename: formData.ename,
      designation: formData.designation,
      department: formData.department,
      pofl: formData.purpose,
      address: formData.address,
      phno: formData.phone,
      c_unit: "UNIT1",
      c_gempid: "admin",
    };

    const details = leaveDetails.map((item) => ({
      daydt: item.dayType,
      frmdt: item.fromDate,
      todate: item.toDate,
      nod: parseFloat(item.noOfDays),
      remarks: item.remarks,
      empno: parseInt(formData.empId),
      c_unit: "UNIT1",
      c_gempid: "admin",
    }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leave/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application, leaveDetails: details }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Leave Application Saved. No: ${data.lno}`, "success");
        resetForm();
      } else {
        throw new Error(data.message || "Failed to save leave");
      }
    } catch (error) {
      showToast("Error saving leave!", "error");
    }
  };

  useEffect(() => {
    const total = leaveDetails.reduce((sum, row) => {
      const val = parseFloat(row.noOfDays);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    setTotalDays(total);
  }, [leaveDetails]);

  useEffect(() => {
    if (purposeRef.current) {
      purposeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    resetForm();
  }, []);

  return (
        <Box> {/*, minHeight: "100vh" */}
          <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">

       <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Leave Application</Typography>
              <IconButton><CloseIcon /></IconButton>
        </Stack>



        {/* <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
  <CardContent> */}
    {/* App Info */}
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
            Leave App No:
          </Typography>
          <Typography fontWeight={600}>{formData.lappNo}</Typography>
        </Box>
      </Grid>

      <Grid item xs={6}>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
            Entry Date:
          </Typography>
          <Typography fontWeight={600}>{formData.date.replace("T", " ")}</Typography>
        </Box>
      </Grid>
    </Grid>

    <Divider sx={{ my: 2 }} />
{/* <Box sx={{ p: 3, bgcolor: "#fafafa", borderRadius: 2 }}> */}
<Grid container spacing={2} alignItems="center">
  {/* Row 1 */}
  <Grid item xs={12} sm={3}>
    <TextField
      label="Emp Id"
      name="empId"
      value={formData.empId}
      onChange={handleChange}
      onKeyDown={loadEmpList}
      size="small"
      placeholder="Select Employee"
      fullWidth
    />
  </Grid>

  <Grid item xs={12} sm={9}>
    <Typography fontWeight={600}>
      Ename: {formData.ename || "--"} • Department: {formData.department || "--"} • Designation: {formData.designation || "--"}
    </Typography>
  </Grid>
</Grid>
<Grid container spacing={2} alignItems="center">
  {/* Purpose of Leave */}
  <Grid item mt={2} xs={12} sm={6} lg={4} sx={{width:"200px"}}>
    <FormControl fullWidth size="small">
      <InputLabel>Purpose of Leave</InputLabel>
      <Select
        ref={purposeRef}
        name="purpose"
        value={formData.purpose}
        onChange={handleChange}
        label="Purpose of Leave"
      >
        <MenuItem value="PERSONAL">PERSONAL</MenuItem>
        <MenuItem value="SICK">SICK</MenuItem>
        <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* Phone Number */}
  <Grid item xs={12} sm={6} lg={4} sx={{width:"200px"}}>
    <TextField
      label="Phone Number"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      size="small"
      fullWidth
    />
  </Grid>

  {/* Address / Reason - spans remaining space */}
  <Grid item xs={12} sm={12} md={6} sx={{width:"300px"}}>
    <TextField
      label="Address / Reason"
      name="address"
      value={formData.address}
      onChange={handleChange}
      size="small"
      fullWidth
    />
  </Grid>
</Grid>

    <Divider sx={{ my: 2 }} />
 
    {/* <Box
  sx={{
    p: 2,
    // border: "1px solid #ddd",
    borderRadius: 2,
    bgcolor: "#fafafa",
  }}
> */}
  <Grid container alignItems="center" spacing={2}>
  {/* Left side: Heading */}
  <Grid item xs="auto">
    <Typography variant="subtitle1" fontWeight={400}>
      Leave Summary
    </Typography>
  </Grid>

  {/* Right side: Summary cards */}
  <Grid item xs>
    <Grid container spacing={2} justifyContent="flex-start">
      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#e3f2fd" }}>
          <Typography variant="body2">CLs Utilised</Typography>
          <Typography variant="h6" fontWeight="bold">{formData.clUsed}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#f1f8e9" }}>
          <Typography variant="body2">ELs Utilised</Typography>
          <Typography variant="h6" fontWeight="bold">{formData.elUsed}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#ede7f6" }}>
          <Typography variant="body2">CLs Balance</Typography>
          <Typography variant="h6" fontWeight="bold">{formData.clBalance}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#ede7f6" }}>
          <Typography variant="body2">ELs Balance</Typography>
          <Typography variant="h6" fontWeight="bold">{formData.elBalance}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "orange" }}>
          <Typography variant="body2">Total Leaves Applied</Typography>
          <Typography variant="h6" fontWeight="bold">{totalDays}</Typography>
        </Paper>
      </Grid>

    </Grid>
  </Grid>
</Grid>
{/* </Box> */}


  {/* </CardContent>
</Card> */}

     {/* <div className="total-days">
        <label>Total Leave Days: </label> {totalDays}
      </div>  */}
       {/*  <Box sx={{ p: 1, bgcolor: "#f5f7fa"}}> , minHeight: "100vh" */} 
              <Divider sx={{ my: 2 }} />
               <Typography variant="subtitle1" fontWeight={600}>
      Leave Details
    </Typography>
      <LeaveGrid
        key={gridKey}
        leaveDetails={leaveDetails}
        setLeaveDetails={setLeaveDetails}
        onValidationError={(hasError) => setIsInvalid(hasError)}
      />

      <div className="save-btn-row">
        <button className="save-btn" disabled={isInvalid} onClick={handleSave}>
          💾 <u>S</u>ave
        </button>
      </div>      
      {/* </Box>    */}
</div>
     
   
      {showEmpPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">
              <h3>Select Employee</h3>
              <button className="close-btn" onClick={() => setShowEmpPopup(false)}>
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by name or ID"
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="popup-search"
              autoFocus
            />

            <div className="popup-scroll-area">
              <table className="popup-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmpList.map((emp, index) => (
                    <tr
                      key={emp.empid}
                      tabIndex={0}
                      className={index === selectedRowIndex ? "selected-row" : ""}
                      onClick={() => selectEmployee(emp)}
                    >
                      <td>{emp.empid}</td>
                      <td>{emp.ename}</td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

          </Box>
  );
};

function GridRow({ label, value }) {
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "160px 1fr",
      alignItems: "center",
      py: .25
    }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{String(value || "—")}</Typography>
    </Box>
  );
}

export default LeaveForm;
