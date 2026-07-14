import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LeaveReport from "./LeaveReport";
import LeaveMaster from "./LeaveMaster";
import LeaveApproval from "./LeaveApproval";
import LeaveApplication from "./LeaveApplication";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCog, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "report", icon: <FaListAlt /> },
  { label: "New Application", value: "new", icon: <FaPlus /> },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble /> },
  { label: "Leave Master", value: "master", icon: <FaCog /> },
];

const LeaveDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("report");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action && ["new", "report", "master", "approval"].includes(action)) {
      setSelectedAction(action);
    }
  }, [location.search]);

  useEffect(() => {
    if (location.state?.reset) setSelectedAction("report");
  }, [location.state?.reset]);

  return (
    <div className="min-h-screen bg-transparent">
      <ModuleTabBar
        title="Leave Management"
        tabs={TABS}
        active={selectedAction}
        onChange={setSelectedAction}
      />

      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "report" && <LeaveReport onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <LeaveApplication onClose={() => setSelectedAction("report")} />}
        {selectedAction === "master" && <LeaveMaster />}
        {selectedAction === "approval" && <LeaveApproval />}
      </div>
    </div>
  );
};

export default LeaveDashboard;
