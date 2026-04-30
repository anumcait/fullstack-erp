import React, { useState, useEffect } from "react";
import axios from "axios";
import WoffChangePreview from "./WoffChangePreview";
import SmartTable from "../../Common/SmartTable";
import { formatDateOnly } from "../../../utils/dateUtils";

const WoffChangeTable = ({ onNewEntry }) => {
  const [data, setData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/woff/all`);
        const formatted = res.data.map((row, index) => ({
          sno: index + 1,
          _expanded: false,
          ...row,
          woff_date: formatDateOnly(row.woff_date),
          woff_from_date: formatDateOnly(row.woff_from_date),
          woff_to_date: formatDateOnly(row.woff_to_date),
        }));
        setData(formatted);
      } catch (err) {
        console.error("Failed to fetch woff data:", err);
      }
    };
    fetchData();
  }, []);

  const handleExpand = (targetRow) => {
    const updated = data.map((row) =>
      row.woff_id === targetRow.woff_id
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Woff ID", field: "woff_id" },
    { header: "Woff Date", field: "woff_date" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "Current Day", field: "current_woff_day" },
    { header: "Requested Day", field: "requested_woff_day" },
    { header: "From Date", field: "woff_from_date" },
    { header: "To Date", field: "woff_to_date" },
    { header: "Status", field: "status" },
  ];

  return (
    <>
      <SmartTable
        title="Woff Change List"
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
              + Woff Change Application
            </button>
          )
        }
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowPreview(true);
        }}
        onToggleExpand={handleExpand}
      />

      {showPreview && (
        <WoffChangePreview data={selectedRecord} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
};

export default WoffChangeTable;
