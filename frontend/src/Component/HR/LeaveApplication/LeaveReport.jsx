import React, { useState, useEffect } from "react";
import axios from "axios";
import SmartTable from "../../Common/SmartTable";
import LeavePreview from "./LeavePreview";

const LeaveReport = ({ onNewEntry }) => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);


  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/report`);
        const formatted = res.data.map((row, index) => {
          const date = new Date(row.ldate);
          let formattedDate = row.ldate;
          if (!isNaN(date)) {
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            let hours = date.getHours();
            const mins = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            formattedDate = `${d}-${m}-${y} ${hours}:${mins} ${ampm}`;
          }

          return {
            sno: index + 1,
            _expanded: false, // Hidden by default, click arrow to open
            ...row,
            ldate: formattedDate,
            statusText: row.status || "Pending",
            from_date: row.leaveDetails?.length > 1
              ? <span
                onClick={(e) => { e.stopPropagation(); handleExpand(row); }}
                style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                Multi-Row
              </span>
              : (row.leaveDetails?.length === 1
                ? new Date(row.leaveDetails[0].frmdt).toLocaleDateString('en-GB').replace(/\//g, '-')
                : '-'),
            to_date: row.leaveDetails?.length > 1
              ? <span
                onClick={(e) => { e.stopPropagation(); handleExpand(row); }}
                style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                See Grid ⬇️
              </span>
              : (row.leaveDetails?.length === 1
                ? new Date(row.leaveDetails[0].todate).toLocaleDateString('en-GB').replace(/\//g, '-')
                : '-'),
            total_days: row.leaveDetails?.length > 0
              ? row.leaveDetails.reduce((sum, d) => sum + (parseFloat(d.nod) || 0), 0)
              : 0
          };
        });
        setData(formatted);

      } catch (err) {
        console.error("Failed to fetch leave data:", err);
      }
    };
    fetchLeaveData();
  }, []);

  const handleExpand = (targetRow) => {
    if (!targetRow || !targetRow.lno) return;
    setData(prevData => prevData.map((row) =>
      row.lno === targetRow.lno
        ? { ...row, _expanded: !row._expanded }
        : row
    ));
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Leave ID", field: "lno" },
    { header: "Date", field: "ldate" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "From", field: "from_date" },
    { header: "To", field: "to_date" },
    { header: "Days", field: "total_days" },
    { header: "Designation", field: "designation" },
    { header: "Department", field: "department" },
    { header: "Reason", field: "pofl", expandable: true },
    { header: "Address", field: "address", expandable: true },
    { header: "Phone", field: "phno" },
    { header: "Status", field: "statusText" },
  ];

  return (
    <>
      <SmartTable
        // keyField="sno"
        title="Leave Report"
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
              + Leave Application
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
        <LeavePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default LeaveReport;
