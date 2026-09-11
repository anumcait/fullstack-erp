import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ESILeaveForm from "./ESILeaveForm";
import ESILeaveTable from "./ESILeaveTable";
import ESILeaveApproval from "./ESILeaveApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_ESI_LEAVE" },
  { label: "New Application", value: "new", icon: <FaPlus />, permission: "HR_ESI_LEAVE" },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble />, permission: "HR_ESI_LEAVE_APPROVE" },
];

const ESILeaveDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("table");
  const location = useLocation();
  const getVisibleTabs = () => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    const isAdmin = role === "admin";
    if (isAdmin) return TABS;
    try {
      const perms = JSON.parse(localStorage.getItem("permissions") || localStorage.getItem("userPermissions") || "[]");
      const permSet = new Set(Array.isArray(perms) ? perms : []);
      return TABS.filter(t => !t.permission || permSet.has(t.permission));
    } catch { return TABS.filter(t => !t.permission || t.permission.includes("_APP") || t.label==="View List" || t.label==="New Application"); }
  };
  const visibleTabs = getVisibleTabs();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action && visibleTabs.some(t => t.value === action)) {
      setSelectedAction(action);
    } else if (action && !visibleTabs.some(t => t.value === action)) {
      setSelectedAction("table");
    }
  }, [location.search]);

  useEffect(() => {
    if (location.state?.reset) setSelectedAction("table");
  }, [location.state?.reset]);

  return (
    <div className="bg-transparent" style={{ minHeight: "auto", overflow: "visible" }}>
      <ModuleTabBar title="ESI Leave" tabs={visibleTabs} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <ESILeaveTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <ESILeaveForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <ESILeaveApproval />}
      </div>
    </div>
  );
};

export default ESILeaveDashboard;
