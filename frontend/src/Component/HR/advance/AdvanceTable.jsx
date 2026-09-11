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

  const parseSchedule = (row) => {
    if (!row.deduction_schedule) return [];
    try {
      const parsed = typeof row.deduction_schedule === "string"
        ? JSON.parse(row.deduction_schedule)
        : row.deduction_schedule;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const renderExpanded = (row) => {
    const schedule = parseSchedule(row);
    const withStatus = Array.isArray(row.schedule_with_status)
      ? row.schedule_with_status
      : schedule.map((e) => ({ ...e, deducted: false }));
    if (schedule.length === 0 && withStatus.length === 0) return null;
    const rows = withStatus.length > 0 ? withStatus : schedule;
    const total = rows.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return (
      <div className="nested-grid-container" style={{ padding: '12px', background:'#fafafa', borderRadius:8 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#333", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize:12 }}>
          <span>
            Deduction Schedule {row.status === "Approved" ? " (Approved)" : ""} — {row.advance_type || ''} {row.unit ? `• ${row.unit}` : ''}
          </span>
          <span style={{ fontWeight: 700, color: (row.pending_amount ?? 0) > 0 ? "#ed6c02" : "#2e7d32" }}>
            Pending: ₹{Number(row.pending_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {row.reason && <div style={{ fontSize:11, color:'#64748b', marginBottom:8, fontStyle:'italic' }}>Reason: {row.reason}</div>}
        <table className="nested-detail-table" style={{ fontSize:12 }}>
          <thead>
            <tr style={{ background:'#f1f5f9' }}>
              <th style={{ padding:'6px 8px' }}>#</th>
              <th style={{ padding:'6px 8px' }}>Month</th>
              <th style={{ padding:'6px 8px' }}>Year</th>
              <th style={{ padding:'6px 8px', textAlign:'right' }}>Amount</th>
              <th style={{ padding:'6px 8px', textAlign:'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, idx) => {
              const isPostponed = entry.postponed || parseFloat(entry.amount)===0;
              return (
              <tr key={idx} style={{ background: isPostponed ? '#fff8e1' : entry.deducted ? '#e8f5e9' : '#fff' }}>
                <td style={{ padding:'5px 8px' }}>{idx + 1}</td>
                <td style={{ padding:'5px 8px' }}>{monthNames[(parseInt(entry.month) || 1) - 1] || entry.month}</td>
                <td style={{ padding:'5px 8px' }}>{entry.year}</td>
                <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:600 }}>₹{Number(entry.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td style={{ padding:'5px 8px', textAlign:'center', fontWeight: 700, color: isPostponed ? "#ef6c00" : entry.deducted ? "#2e7d32" : "#c62828" }}>
                  {isPostponed ? "Postponed" : entry.deducted ? "Completed" : "Pending"}
                </td>
              </tr>
            );})}
            <tr style={{ background:'#e3f2fd', fontWeight:700 }}>
              <td colSpan={3} style={{ padding:'6px 8px', textAlign:'right' }}>Total</td>
              <td style={{ padding:'6px 8px', textAlign:'right' }}>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td style={{ padding:'6px 8px', textAlign:'center' }}>{rows.filter((e) => e.deducted).length} of {rows.length} completed {rows.some(e=>e.postponed||parseFloat(e.amount)===0) && `• ${rows.filter(e=>e.postponed||parseFloat(e.amount)===0).length} postponed`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Advance ID", field: "advance_id" },
    { header: "Entry Date", field: "advance_date_formatted" },
    { header: "Employee", field: "emp_display", render: (row)=> `${row.empid} - ${row.ename}` },
    { header: "Gross Salary", field: "gross_salary", render: (row)=> `₹${Number(row.gross_salary||0).toLocaleString('en-IN')}` },
    { header: "Amount", field: "advance_amount", render: (row)=> `₹${Number(row.advance_amount||0).toLocaleString('en-IN')}` },
    {
      header: "Overall Status",
      field: "overall_status",
      render: (row) => {
        const st = row.overall_status || row.status || "Pending";
        const color = st === "Completed" ? "#2e7d32" : st === "Partially Completed" ? "#ed6c02" : st === "Pending" ? "var(--primary-main)" : "#c62828";
        const hasPostponed = (()=>{ try{ const s=row.schedule_with_status||JSON.parse(row.deduction_schedule||'[]'); return Array.isArray(s)&&s.some(e=>e.postponed||parseFloat(e.amount)===0);}catch{return false}})();
        return (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:2, lineHeight:1.2 }}>
            <span style={{ fontWeight: 700, color, whiteSpace: "nowrap", fontSize:12 }}>{st}</span>
            {hasPostponed && <span style={{ background:'#fff8e1', color:'#ef6c00', border:'1px solid #f59e0b', borderRadius:4, padding:'1px 4px', fontSize:9, lineHeight:1 }}>Postponed</span>}
          </div>
        );
      },
    },
    {
      header: "Pending Amount",
      field: "pending_amount",
      render: (row) => `₹${(Number(row.pending_amount ?? 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    { header: "Status", field: "status", render: (row)=> <span style={{ fontSize:12, padding:'2px 6px', borderRadius:4, background: row.status==='Approved'?'#e8f5e9':'#f5f5f5', color: row.status==='Approved'?'#2e7d32':'#616161', fontWeight:600 }}>{row.status}</span> },
  ];

  return (
    <>
      <SmartTable
        title="Advance List"
        columns={columns}
        data={data}
        initialWidths={{ sno:45, advance_id:75, advance_date_formatted:95, emp_display:160, gross_salary:90, advance_amount:90, overall_status:90, pending_amount:100, status:80 }}
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
              + Advance Application
            </button>
          )
        }
        onPreview={(row) => {
          setSelectedRecord(row);
          setShowForm(true);
        }}
        onToggleExpand={handleExpand}
        renderExpanded={renderExpanded}
      />

      {showForm && (
        <AdvancePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default AdvanceTable;
