import React, { useState } from "react";
import IncrementForm from "./IncrementForm";
import IncrementTable from "./IncrementTable";
import IncrementApproval from "./IncrementApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_INCR" },
  { label: "New Increment", value: "new", icon: <FaPlus />, permission: "HR_INCR" },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble />, permission: "HR_INCR_APPROVE" }
];

const IncrementDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("table");
  const [editing, setEditing] = useState(null);

  const openEdit = (row) => { setEditing(row); setSelectedAction("new"); };
  const closeForm = () => { setEditing(null); setSelectedAction("table"); };

  const getVisibleTabs = () => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    if (role === "admin") return TABS;
    try {
      const perms = JSON.parse(localStorage.getItem("permissions") || localStorage.getItem("userPermissions") || "[]");
      const permSet = new Set(Array.isArray(perms) ? perms : []);
      return TABS.filter(t => !t.permission || permSet.has(t.permission));
    } catch {
      return TABS.filter(t => !t.permission || t.permission === "HR_INCR");
    }
  };

  const visibleTabs = getVisibleTabs();
  const tab = visibleTabs.some(t => t.value === selectedAction) ? selectedAction : "table";

  return (
    <div className="bg-transparent" style={{ minHeight: "auto", overflow: "visible" }}>
      <ModuleTabBar title="Increments" tabs={visibleTabs} active={tab} onChange={setSelectedAction} />
      <div className="p-6">
        {tab === "table" && <IncrementTable onNew={() => { setEditing(null); setSelectedAction("new"); }} onEdit={openEdit} />}
        {tab === "new" && <IncrementForm editRow={editing} onClose={closeForm} onSaved={closeForm} />}
        {tab === "approval" && <IncrementApproval />}
      </div>
    </div>
  );
};

export default IncrementDashboard;