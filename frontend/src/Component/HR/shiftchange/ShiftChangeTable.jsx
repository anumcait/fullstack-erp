import React, { useState, useEffect } from "react";
import axios from "axios";
import ShiftChangePreview from "./ShiftChangePreview";
import SmartTable from "../../Common/SmartTable";
import { formatDateOnly, formatDateTimeAMPM } from "../../../utils/dateUtils";

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
          entry_date: formatDateTimeAMPM(row.schange_date),
          from_date: formatDateOnly(row.schange_from),
          to_date: formatDateOnly(row.schange_to),
          act_shift_display: row.act_shift,
          cha_shift_display: row.change_shift,
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
      row.schange_no === targetRow.schange_no
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "App No", field: "schange_no" },
    { header: "Entry Date", field: "entry_date" },
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "empname" },
    { header: "From Date", field: "from_date" },
    { header: "To Date", field: "to_date" },
    { header: "Actual Shift", field: "act_shift_display" },
    { header: "Change Shift", field: "cha_shift_display" },
    { header: "Status", field: "app_status" },
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
                background: 'var(--primary-main)',
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
