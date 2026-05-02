import React, { useState, useEffect } from "react";
import axios from "axios";
import ESILeavePreview from "./ESILeavePreview";
import SmartTable from "../../Common/SmartTable";
import { formatDateOnly, formatDateTimeDot } from "../../../utils/dateUtils";

const ESILeaveTable = ({ onNewEntry }) => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/esileave/all`);
        const formatted = res.data.map((row, index) => ({
          sno: index + 1,
          _expanded: false,
          ...row,
          esi_leave_date_formatted: formatDateTimeDot(row.esi_leave_date),
          esi_leave_from_formatted: formatDateOnly(row.leave_from_date),
          esi_leave_to_formatted: formatDateOnly(row.leave_to_date),
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
      row.esi_leave_id === targetRow.esi_leave_id
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "ESI Leave ID", field: "esi_leave_id" },
    { header: "Entry Date", field: "esi_leave_date_formatted" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "From Date", field: "esi_leave_from_formatted" },
    { header: "To Date", field: "esi_leave_to_formatted" },
    { header: "No of Days", field: "no_of_days" },
    { header: "Status", field: "status" },
    { header: "Reason", field: "reason", expandable: true },
  ];

  return (
    <>
       <SmartTable
         title="ESI Leave List"
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
              + ESI Leave Application
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
        <ESILeavePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default ESILeaveTable;
