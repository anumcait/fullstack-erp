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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/report`, { withCredentials: true });
        const role = (localStorage.getItem('userRole') || '').toLowerCase();
        const isAdmin = role === 'admin' || role === 'hr';
        const empId = localStorage.getItem('empId') || localStorage.getItem('empid') || '';
        let rows = res.data;
        if (!isAdmin && empId) rows = rows.filter(r => String(r.empid) === String(empId));
        const formatted = rows.map((row, index) => {
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
            _expanded: false,
            ...row,
            emp_display: `${row.empid} - ${row.ename}`,
            ldate: formattedDate,
            statusText: row.status || "Pending",
            from_date: row.leaveDetails?.length > 1
              ? <span
                onClick={(e) => { e.stopPropagation(); handleExpand(row); }}
                style={{ color: 'var(--primary-main)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                Multi-Row
              </span>
              : (row.leaveDetails?.length === 1
                ? new Date(row.leaveDetails[0].frmdt).toLocaleDateString('en-GB').replace(/\//g, '-')
                : '-'),
            to_date: row.leaveDetails?.length > 1
              ? <span
                onClick={(e) => { e.stopPropagation(); handleExpand(row); }}
                style={{ color: 'var(--primary-main)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
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
    { header: "Employee", field: "emp_display", render: (row)=> `${row.empid} - ${row.ename}` },
    { header: "From", field: "from_date" },
    { header: "To", field: "to_date" },
    { header: "Days", field: "total_days", render: (row)=> <span style={{ fontWeight:700 }}>{row.total_days}</span> },
    { header: "Status", field: "statusText", render: (row)=> {
        const st=row.statusText||row.status||'Pending';
        const col=st==='Approved'?'#2e7d32':st==='Rejected'?'#c62828':'#0288d1';
        return <span style={{ fontWeight:700, color:col, fontSize:12, padding:'2px 6px', borderRadius:4, background: st==='Approved'?'#e8f5e9': st==='Rejected'?'#ffebee':'#e3f2fd' }}>{st}</span>;
      }},
    { header: "Reason", field: "pofl", expandable: true },
  ];

  return (
    <>
      <SmartTable
        title="Leave Report"
        columns={columns}
        data={data}
        initialWidths={{ sno:45, lno:75, ldate:130, emp_display:170, from_date:95, to_date:95, total_days:60, statusText:105, pofl:180 }}
        headerAction={
          onNewEntry && (
            <button
              onClick={onNewEntry}
              style={{
                padding: '6px 14px',
                background: 'var(--primary-main)',
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
