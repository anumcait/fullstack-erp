import React, { useState, useEffect } from "react";
import axios from "axios";
import HRAttendancePreview from "./HRAttendance"; // Create a preview component similar to OnDutyPreview
import SmartTable from "../../Common/SmartTable";

const HRAttendanceTable = () => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hrattendance/all`);
        const formatted = res.data.map((row, index) => ({
          sno: index + 1,
          _expanded: false,
          ...row,
        }));
        setData(formatted);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
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
    { header: "Date", field: "date" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "Division", field: "division" },
    { header: "Shift", field: "shift" },
    { header: "In Time", field: "in_time" },
    { header: "Out Time", field: "out_time" },
    { header: "Lunch Out", field: "lunch_out" },
    { header: "Lunch In", field: "lunch_in" },
    { header: "Remarks", field: "remarks", expandable: true },
  ];

  return (
    <>
      <SmartTable
        title="HR Attendance List"
        columns={columns}
        data={data}
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowForm(true);
        }}
        onToggleExpand={handleExpand}
      />

      {showForm && (
        <HRAttendancePreview
          data={selectedRecord}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default HRAttendanceTable;
