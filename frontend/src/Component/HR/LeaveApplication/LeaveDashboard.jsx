import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LeaveReport from "./LeaveReport";
import LeaveMaster from "./LeaveMaster";
import LeaveApproval from "./LeaveApproval";
import LeaveApplication from "./LeaveApplication";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCog, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "report", icon: <FaListAlt />, permission: "HR_LEAVE_APP" },
  { label: "New Application", value: "new", icon: <FaPlus />, permission: "HR_LEAVE_APP" },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble />, permission: "HR_LEAVE_APPROVE" },
  { label: "Leave Master", value: "master", icon: <FaCog />, permission: "HR_LEAVE_MASTER" },
];

const LeaveDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("report");
  const location = useLocation();
  const getVisibleTabs = () => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    const isAdmin = role === "admin";
    if (isAdmin) return TABS;
    try {
      const perms = JSON.parse(localStorage.getItem("permissions") || localStorage.getItem("userPermissions") || "[]");
      const permSet = new Set(Array.isArray(perms) ? perms : []);
      return TABS.filter(t => !t.permission || permSet.has(t.permission));
    } catch { return TABS.filter(t => !t.permission || t.permission === "HR_LEAVE_APP"); }
  };
  const visibleTabs = getVisibleTabs();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action && visibleTabs.some(t => t.value === action)) {
      setSelectedAction(action);
    } else if (action && !visibleTabs.some(t => t.value === action)) {
      setSelectedAction("report");
    }
  }, [location.search]);

  useEffect(() => {
    if (location.state?.reset) setSelectedAction("report");
  }, [location.state?.reset]);

  return (
    <div className="bg-transparent" style={{ minHeight: "auto", overflow: "visible" }}>
      <ModuleTabBar
        title="Leave Management"
        tabs={visibleTabs}
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
