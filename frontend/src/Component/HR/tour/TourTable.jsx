import React, { useState, useEffect } from "react";
import axios from "axios";
import TourPreview from "./TourPreview";
import SmartTable from "../../Common/SmartTable";

const TourTable = () => {
  const [data, setData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tour/all`);
        const formatted = res.data.map((row, index) => ({
          sno: index + 1,
          _expanded: false,
          ...row,
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
    { header: "Emp ID", field: "empid" },
    { header: "Name", field: "ename" },
    { header: "Unit", field: "unit" },
    { header: "Division", field: "division" },
    { header: "Destination", field: "destination" },
    { header: "From Date", field: "tour_from_date" },
    { header: "To Date", field: "tour_to_date" },
    { header: "Status", field: "status" },
  ];

  return (
    <>
      <SmartTable
        title="Tour Applications"
        columns={columns}
        data={data}
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
