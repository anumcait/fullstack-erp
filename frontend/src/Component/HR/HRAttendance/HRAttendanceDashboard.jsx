import React, { useState, useEffect } from "react";
import HRAttendanceForm from "./HRAttendance";
import HRAttendanceTable from "./HRAttendanceTable";
import ModuleTabBar from "../Common/ModuleTabBar";
import { FaPlus, FaListAlt } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt /> },
  { label: "New Entry", value: "new", icon: <FaPlus /> },
];

const HRAttendanceDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("table");
  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleTabBar
        title="HR Attendance"
        tabs={TABS}
        active={selectedAction}
        onChange={setSelectedAction}
      />
      <div className="p-6">
        {selectedAction === "table" && <HRAttendanceTable />}
        {selectedAction === "new" && <HRAttendanceForm />}
      </div>
    </div>
  );
};

export default HRAttendanceDashboard;
