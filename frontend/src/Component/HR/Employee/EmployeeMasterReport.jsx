import React, { useState, useEffect } from "react";
import axios from "axios";
import SmartTable from "../../Common/SmartTable";
import EmployeePreview from "./EmployeePreview";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddEmployee from "./AddEmployee";
import "./EmployeeMasterReport.css";

const EmployeeMasterReport = ({ initialFilterType = "active", title = "Employee Master Report" }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmpId, setEditEmpId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [filterType, setFilterType] = useState(initialFilterType);

  useEffect(() => {
    fetchEmployees();
  }, [filterType]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees?filterType=${filterType}`);
      const formatted = res.data.map((row, index) => ({
        sno: index + 1,
        _expanded: false,
        ...row,
        dob: formatDate(row.dob),
        status: row.is_active ? "Active" : "Left",
        salary: row.total || 0,
        permanent_address: [
          row.padd_sa,
          row.padd_city,
          row.padd_state,
          row.padd_pin && `PIN: ${row.padd_pin}`,
        ]
          .filter(Boolean)
          .join("\n"),
        comm_address: [
          row.cadd_sa,
          row.cadd_city,
          row.cadd_state,
          row.cadd_pin && `PIN: ${row.padd_pin}`,
          row.cadd_mobile && `Mobile: ${row.cadd_mobile}`,
          row.cadd_email && `Email: ${row.cadd_email}`,
        ]
          .filter(Boolean)
          .join("\n"),
      }));
      setData(formatted);
      setFilteredData(formatted);
    } catch (err) {
      console.error("Failed to fetch employee data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search + Filters
  useEffect(() => {
    let temp = [...data];
    if (search) {
      temp = temp.filter((emp) =>
        Object.values(emp).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (divisionFilter) {
      temp = temp.filter((emp) => emp.divname === divisionFilter);
    }
    if (departmentFilter) {
      temp = temp.filter((emp) => emp.deptname === departmentFilter);
    }
    setFilteredData(temp);
  }, [search, divisionFilter, departmentFilter, data]);

  const handleExpand = (targetRow) => {
    const updated = filteredData.map((row) =>
      row.empid === targetRow.empid ? { ...row, _expanded: !row._expanded } : row
    );
    setFilteredData(updated);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditEmpId(null);
    fetchEmployees(); // Refresh list after edit
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Gender", field: "gender" },
    { header: "DOB", field: "dob" },
    { header: "Division", field: "divname" },
    { header: "Department", field: "deptname" },
    { header: "Section", field: "secname" },
    { header: "Status", field: "status" },
    { header: "Left Date", field: "left_date" },
    { header: "Reason", field: "left_reason" },
    { header: "Salary", field: "salary" },
    { header: "Permanent Address", field: "permanent_address", expandable: true },
    { header: "Communication Address", field: "comm_address", expandable: true },
  ];

  return (
    <div className="employee-report-container">
      <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <div className="report-controls">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setDivisionFilter(e.target.value)}>
          <option value="">All Divisions</option>
          {[...new Set(data.map((d) => d.divname))].filter(Boolean).map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
        </select>
        <select onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {[...new Set(data.map((d) => d.deptname))].filter(Boolean).map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="active">Active Employees</option>
          <option value="left">Left Employees</option>
        </select>
        <button type="button" onClick={() => fetchEmployees()}>Refresh</button>
        <button type="button" onClick={() => { setSearch(""); setDivisionFilter(""); setDepartmentFilter(""); }}>Clear</button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>}

      {/* Smart Table */}
      <SmartTable
        title="Employee Master Report"
        columns={columns}
        data={filteredData}
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowPreview(true);
        }}
        onEdit={(row) => {
          setEditEmpId(row.empid);
          setShowEditModal(true);
        }}
        onToggleExpand={handleExpand}
      />

      {/* Preview Modal */}
      {showPreview && (
        <EmployeePreview
          data={selectedRecord}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Edit Employee Modal */}
      <Dialog
        open={showEditModal}
        onClose={handleEditClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          },
        }}
      >
        <DialogContent sx={{ p: 0, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
          {showEditModal && editEmpId && (
            <AddEmployee
              modalEmpId={editEmpId}
              isModal={true}
              onModalClose={handleEditClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeMasterReport;
