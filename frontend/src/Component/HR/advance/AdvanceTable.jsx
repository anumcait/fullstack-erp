import React, { useState, useEffect } from "react";
import axios from "axios";
import AdvancePreview from "./AdvancePreview";
import SmartTable from "../../Common/SmartTable";

const AdvanceTable = () => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/advance/all`);
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
      row.advance_id === targetRow.advance_id
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Advance ID", field: "advance_id" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "Division", field: "division" },
    { header: "Designation", field: "designation" },
    { header: "Advance Type", field: "advance_type" },
    { header: "Amount", field: "advance_amount" },
    { header: "Reason", field: "reason", expandable: true },
  ];

  const handleNew = () => {
    window.location.href = '/advance?action=new';
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={handleNew} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          + New
        </button>
      </div>
      <SmartTable
        title="Advance List"
        columns={columns}
        data={data}
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowForm(true);
        }}
        onToggleExpand={handleExpand}
      />

      {showForm && (
        <AdvancePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default AdvanceTable;
