import React, { useState, useEffect } from "react";
import axios from "axios";
import ShiftChangePreview from "./ShiftChangePreview";
import SmartTable from "../../Common/SmartTable";

const ShiftChangeTable = ({ onNewEntry }) => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/all`);
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
      row.movement_id === targetRow.movement_id
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Schange No", field: "schange_no" },
    { header: "Schange Date", field: "schange_date" },
    
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "empname" },
    { header: "Unit", field: "unit" },
    // { header: "Division", field: "division" },
    // { header: "Designation", field: "designation" },
    // { header: "Reason", field: "reason_perm", expandable: true },
  ];

  return (
    <>
      <SmartTable
        title="Shift Change List"
        columns={columns}
        data={data}
        headerAction={
          onNewEntry && (
            <button
              onClick={onNewEntry}
              style={{
                padding: '6px 14px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              + Shift Change Application
            </button>
          )
        }
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowForm(true);
        }}
        onToggleExpand={handleExpand}
      />

      {showForm && (
        <ShiftChangePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default ShiftChangeTable;
