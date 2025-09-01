import React, { useState, useEffect } from "react";
import axios from "axios";
import SmartTable from "../../Component/Common/SmartTable";
import EmployeePreview from "./EmployeePreview"; // Optional, for modal popup
import './EmployeeMasterReport.css';

const EmployeeMasterReport = () => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`);
        const formatted = res.data.map((row, index) => ({
          sno: index + 1,
          _expanded: false,
          ...row,
        }));
        setData(formatted);
      } catch (err) {
        console.error("Failed to fetch employee data:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleExpand = (targetRow) => {
    const updated = data.map((row) =>
      row.empid === targetRow.empid
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Gender", field: "sex" },
    { header: "DOB", field: "dob" },
    { header: "Division", field: "divname" },
    { header: "Department", field: "deptname" },
    { header: "Section", field: "secname" },
    { header: "Marital Status", field: "marital_status", expandable: true },
    { header: "Mobile", field: "mobile", expandable: true },
    { header: "Email", field: "email", expandable: true },
    { header: "Address", field: "address", expandable: true },
    { header: "comm Addr", field: "cadd_sa", expandable: true },
          // cadd_city: DataTypes.STRING(50),
          // cadd_state: DataTypes.STRING(50),
          // cadd_phone: DataTypes.STRING(50),
          // cadd_mobile: DataTypes.STRING(50),
          // cadd_pin: DataTypes.STRING(50),
          // cadd_email
  ];

  return (
    <>
      <SmartTable
        title="Employee Master Report"
        columns={columns}
        data={data}
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowForm(true);
        }}
        onToggleExpand={handleExpand}
      />

      {showForm && (
        <EmployeePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default EmployeeMasterReport;
