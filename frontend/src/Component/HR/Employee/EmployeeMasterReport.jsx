import React, { useState, useEffect } from "react";
import axios from "axios";
import SmartTable from "../../Common/SmartTable";
import EmployeePreview from "./EmployeePreview";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FaSearch, FaFilter, FaSync, FaEraser, FaUserPlus } from "react-icons/fa";
import AddEmployee from "./AddEmployee";
import "./EmployeeMasterReport.css";

const EmployeeMasterReport = ({ initialFilterType = "active", onNewEntry }) => {
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
        status: row.is_active ? (row.status === "Active" ? "Active" : row.status) : (row.status || "Left"),
        salary: row.total || 0,
        permanent_address: [row.padd_sa, row.padd_city, row.padd_state, row.padd_pin].filter(Boolean).join(", "),
        comm_address: [row.cadd_sa, row.cadd_city, row.cadd_state, row.cadd_pin].filter(Boolean).join(", "),
      }));
      setData(formatted);
      setFilteredData(formatted);
    } catch (err) {
      console.error("Failed to fetch employee data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let temp = [...data];
    if (search) {
      temp = temp.filter((emp) =>
        Object.values(emp).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (divisionFilter) temp = temp.filter((emp) => emp.divname === divisionFilter);
    if (departmentFilter) temp = temp.filter((emp) => emp.deptname === departmentFilter);
    setFilteredData(temp);
  }, [search, divisionFilter, departmentFilter, data]);

  const handleExpand = (targetRow) => {
    setFilteredData(prev => prev.map((row) =>
      row.empid === targetRow.empid ? { ...row, _expanded: !row._expanded } : row
    ));
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditEmpId(null);
    fetchEmployees();
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Gender", field: "gender" },
    { header: "Division", field: "divname" },
    { header: "Department", field: "deptname" },
    { header: "Status", field: "status" },
    { header: "Salary", field: "salary" },
    { header: "Comm. Address", field: "comm_address", expandable: true },
  ];

  return (
    <div className="employee-report-container">
      {/* Refined Filter Toolbar */}
      <div className="report-toolbar">
        <div className="toolbar-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <div className="filter-item">
            <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
              <option value="">Divisions</option>
              {[...new Set(data.map((d) => d.divname))].filter(Boolean).map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">Departments</option>
              {[...new Set(data.map((d) => d.deptname))].filter(Boolean).map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="active">Active Staff</option>
              <option value="left">Left Staff</option>
            </select>
          </div>
        </div>

        <div className="toolbar-actions">
          <Tooltip title="Add New Employee">
            <IconButton onClick={onNewEntry} className="action-btn new-emp">
              <FaUserPlus size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Filters">
            <IconButton onClick={() => { setSearch(""); setDivisionFilter(""); setDepartmentFilter(""); }} className="action-btn">
              <FaEraser size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => fetchEmployees()} className="action-btn refresh">
              <FaSync size={16} className={loading ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {loading && (
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      )}

      {/* Smart Table */}
      <div className="table-wrapper-modern">
        <SmartTable
          title=""
          columns={columns}
          data={filteredData}
          onPreview={(row) => { setSelectedRecord(row); setShowPreview(true); }}
          onEdit={(row) => { setEditEmpId(row.empid); setShowEditModal(true); }}
          onToggleExpand={handleExpand}
        />
      </div>

      {showPreview && <EmployeePreview data={selectedRecord} onClose={() => setShowPreview(false)} />}

      <Dialog open={showEditModal} onClose={handleEditClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 3, height: "90vh" } }}>
        <DialogContent sx={{ p: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {showEditModal && editEmpId && (
            <AddEmployee modalEmpId={editEmpId} isModal={true} onModalClose={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeMasterReport;
