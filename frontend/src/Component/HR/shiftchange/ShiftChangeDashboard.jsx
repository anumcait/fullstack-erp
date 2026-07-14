import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ShiftChangeForm from "./ShiftChangeForm";
import ShiftChangeTable from "./ShiftChangeTable";
import ShiftChangeApproval from "./ShiftChangeApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const ShiftChangeDashboard = () => {
  const userRole = localStorage.getItem("userRole");
  const userPermissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
  const hasPermission = (perm) => userRole === "ADMIN" || userPermissions.includes(perm);

  const allTabs = [
    { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_SHIFT_CHG" },
    { label: "New", value: "new", icon: <FaPlus />, permission: "HR_SHIFT_CHG" },
    { label: "Approval", value: "approval", icon: <FaCheckDouble />, permission: "HR_SHIFT_CHG_APPROVE" },
  ];
  const tabs = allTabs.filter((t) => hasPermission(t.permission));

  const [selectedAction, setSelectedAction] = useState("table");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action && ["new", "table", "approval"].includes(action)) setSelectedAction(action);
  }, [location.search]);

  useEffect(() => {
    if (location.state?.reset) setSelectedAction("table");
  }, [location.state?.reset]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleTabBar title="Shift Change" tabs={tabs} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <ShiftChangeTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <ShiftChangeForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <ShiftChangeApproval />}
      </div>
    </div>
  );
};

export default ShiftChangeDashboard;
