import React, { useState, useEffect } from "react";
import { FaDownload, FaPrint } from "react-icons/fa";
import axios from "axios";
import OnDutyPreview from "./OnDutyPreview";
import SmartTable from "../../Common/SmartTable";
import { formatDateOnly, formatDateTimeAMPM } from "../../../utils/dateUtils";

const OnDutyTable = ({ onNewEntry }) => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const calculateHours = (fromTime, toTime) => {
    if (!fromTime || !toTime) return 0;

    try {
      // Parse times in HH:mm format
      const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
      const [toHours, toMinutes] = toTime.split(':').map(Number);

      // Calculate total minutes
      const fromTotalMinutes = fromHours * 60 + fromMinutes;
      const toTotalMinutes = toHours * 60 + toMinutes;

      // Calculate difference in minutes
      let diffMinutes = toTotalMinutes - fromTotalMinutes;

      // Handle overnight shifts (if to time is earlier than from time)
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add 24 hours in minutes
      }

      // Convert to hours with minutes in base 100 format (as requested)
      // Example: 15 minutes = 0.15 (not 0.25)
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}.${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error calculating hours:", error);
      return 0;
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";
    if (typeof time !== 'string') return "-";

    // Handle various time formats and strip seconds if present
    if (time.includes(':')) {
      const parts = time.split(':');
      // Take only hours and minutes, ignore seconds if present
      const hours = parts[0];
      const minutes = parts[1];
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    // If no colon found, return as is
    return time;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/onduty/all`);
        const formatted = res.data.map((row, index) => ({
          sno: index + 1,
          _expanded: false,
          ...row,
          emp_display: `${row.empid} - ${row.ename}`,
          act_date_display: formatDateOnly(row.act_date),
          movement_date_display: formatDateTimeAMPM(row.movement_date),
          perm_ftime_display: formatTime(row.perm_ftime),
          perm_ttime_display: formatTime(row.perm_ttime),
          no_of_hrs: calculateHours(row.perm_ftime, row.perm_ttime)
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
    { header: "Entry ID", field: "movement_id" },
    { header: "Entry Date", field: "movement_date_display" },
    { header: "Employee", field: "emp_display", render: (row)=> `${row.empid} - ${row.ename}` },
    { header: "Movement Date", field: "act_date_display" },
    { header: "Shift", field: "shift" },
    { header: "From Time", field: "perm_ftime_display" },
    { header: "To Time", field: "perm_ttime_display" },
    { header: "Hours", field: "no_of_hrs" },
    { header: "Purpose", field: "reason_perm", expandable: true },
  ];

  return (
    <>
      <SmartTable
        title="On Duty List"
        columns={columns}
        data={data}
        initialWidths={{ sno:35, movement_id:65, movement_date_display:95, emp_display:130, act_date_display:85, shift:60, perm_ftime_display:60, perm_ttime_display:60, no_of_hrs:50, reason_perm:160 }}
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
              + On Duty Application
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
        <OnDutyPreview data={selectedRecord} onClose={() => setShowForm(false)} />
      )}
    </>
  );
};

export default OnDutyTable;
