import React, { useState, useEffect } from "react";
import axios from "axios";
import AdvancePreview from "./AdvancePreview";
import SmartTable from "../../Common/SmartTable";
import { formatDateTimeDot } from "../../../utils/dateUtils";

const AdvanceTable = ({ onNewEntry }) => {
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
          advance_date_formatted: formatDateTimeDot(row.advance_date),
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
    { header: "Entry Date", field: "advance_date_formatted" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "Advance Type", field: "advance_type" },
    { header: "Gross Salary", field: "gross_salary" },
    { header: "Amount", field: "advance_amount" },
    { header: "Status", field: "status" },
    { header: "Reason", field: "reason", expandable: true },
  ];

  return (
    <>
      <SmartTable
        title="Advance List"
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
              + Advance Application
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
        <AdvancePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default AdvanceTable;
