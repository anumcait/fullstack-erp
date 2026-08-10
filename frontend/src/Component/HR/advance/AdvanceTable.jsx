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
      <div className="nested-grid-container">
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#333", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <span>
            Deduction Schedule
            {row.status === "Approved" ? " (Approved)" : ""}
          </span>
          <span style={{ fontWeight: 700, color: (row.pending_amount ?? 0) > 0 ? "#ed6c02" : "#2e7d32" }}>
            Pending: ₹{Number(row.pending_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <table className="nested-detail-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Month</th>
              <th>Year</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{monthNames[(parseInt(entry.month) || 1) - 1] || entry.month}</td>
                <td>{entry.year}</td>
                <td>{Number(entry.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td style={{ fontWeight: 700, color: entry.deducted ? "#2e7d32" : "#c62828" }}>
                  {entry.deducted ? "Completed" : "Pending"}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ fontWeight: 700 }}>Total</td>
              <td style={{ fontWeight: 700 }}>{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td style={{ fontWeight: 700 }}>{rows.filter((e) => e.deducted).length} of {rows.length} completed</td>
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
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "Advance Type", field: "advance_type" },
    { header: "Gross Salary", field: "gross_salary" },
    { header: "Amount", field: "advance_amount" },
    {
      header: "Overall Status",
      field: "overall_status",
      render: (row) => {
        const st = row.overall_status || row.status || "Pending";
        const color = st === "Completed" ? "#2e7d32" : st === "Partially Completed" ? "#ed6c02" : st === "Pending" ? "#1976d2" : "#c62828";
        return (
          <span style={{ fontWeight: 700, color, whiteSpace: "nowrap" }}>
            {st}
          </span>
        );
      },
    },
    {
      header: "Pending Amount",
      field: "pending_amount",
      render: (row) => (Number(row.pending_amount ?? 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
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
        renderExpanded={renderExpanded}
      />

      {showForm && (
        <AdvancePreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default AdvanceTable;
