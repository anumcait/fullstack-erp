import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import WoffChangeForm from "./WoffChangeForm";
import WoffChangeTable from "./WoffChangeTable";
import WoffApproval from "./WoffApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_WOFF_CHG" },
  { label: "New Application", value: "new", icon: <FaPlus />, permission: "HR_WOFF_CHG" },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble />, permission: "HR_WOFF_CHG_APPROVE" },
];

const WoffChangeDashboard = () => {
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
      <ModuleTabBar title="Weekly Off Change" tabs={visibleTabs} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <WoffChangeTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <WoffChangeForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <WoffApproval />}
      </div>
    </div>
  );
};

export default WoffChangeDashboard;
