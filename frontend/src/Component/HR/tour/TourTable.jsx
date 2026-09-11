import React, { useState, useEffect } from "react";
import axios from "axios";
import TourPreview from "./TourPreview";
import SmartTable from "../../Common/SmartTable";
import { formatDate } from "../../../utils/dateUtils";

const TourTable = ({ onNewEntry }) => {
  const [data, setData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tour/all`);
        const formatted = res.data.map((row, index) => ({
          ...row,
          sno: index + 1,
          _expanded: false,
          emp_display: `${row.empid} - ${row.ename}`,
          tour_from_date_display: row.tour_from_date ? formatDate(row.tour_from_date) : "",
          tour_to_date_display: row.tour_to_date ? formatDate(row.tour_to_date) : "",
          tour_date_display: row.tour_date ? formatDate(row.tour_date) : "",
        }));
        setData(formatted);
      } catch (err) {
        console.error("Failed to fetch tour data:", err);
      }
    };
    fetchData();
  }, []);

  const handleExpand = (targetRow) => {
    const updated = data.map((row) =>
      row.tour_id === targetRow.tour_id
        ? { ...row, _expanded: !row._expanded }
        : row
    );
    setData(updated);
  };

  const columns = [
    { header: "S.No.", field: "sno" },
    { header: "Tour ID", field: "tour_id" },
    { header: "Entry Date", field: "tour_date_display" },
    { header: "Employee", field: "emp_display", render: (row)=> `${row.empid} - ${row.ename}` },
    { header: "Destination", field: "destination", expandable: true },
    { header: "Purpose", field: "purpose", expandable: true },
    { header: "From Date", field: "tour_from_date_display" },
    { header: "To Date", field: "tour_to_date_display" },
    { header: "Status", field: "status" },
  ];

  return (
    <>
      <SmartTable
        title="Tour Applications"
        columns={columns}
        data={data}
        initialWidths={{ sno:45, tour_id:75, tour_date_display:110, emp_display:170, destination:150, purpose:180, tour_from_date_display:95, tour_to_date_display:95, status:90 }}
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
              + Tour Application
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
        <TourPreview data={selectedRecord} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
};

export default TourTable;
