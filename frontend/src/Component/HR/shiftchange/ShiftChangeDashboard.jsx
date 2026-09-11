import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ShiftChangeForm from "./ShiftChangeForm";
import ShiftChangeTable from "./ShiftChangeTable";
import ShiftChangeApproval from "./ShiftChangeApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_SHIFT_CHG" },
  { label: "New Application", value: "new", icon: <FaPlus />, permission: "HR_SHIFT_CHG" },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble />, permission: "HR_SHIFT_CHG_APPROVE" },
];

const ShiftChangeDashboard = () => {
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
      <ModuleTabBar title="Shift Change" tabs={visibleTabs} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <ShiftChangeTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <ShiftChangeForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <ShiftChangeApproval />}
      </div>
    </div>
  );
};

export default ShiftChangeDashboard;
