import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import OnDutyForm from "./OnDutyForm";
import OnDutyTable from "./OnDutyTable";
import OnDutyApproval from "./OnDutyApproval";
import ModuleTabBar from "../Common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const OnDutyDashboard = () => {
  const userRole = localStorage.getItem("userRole");
  const userPermissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
  const hasPermission = (perm) => userRole === "ADMIN" || userPermissions.includes(perm);

  const allTabs = [
    { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_ONDUTY" },
    { label: "New", value: "new", icon: <FaPlus />, permission: "HR_ONDUTY" },
    { label: "Approval", value: "approval", icon: <FaCheckDouble />, permission: "HR_ONDUTY_APPROVE" },
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
      <ModuleTabBar title="On-Duty Application" tabs={tabs} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <OnDutyTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <OnDutyForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <OnDutyApproval />}
      </div>
    </div>
  );
};

export default OnDutyDashboard;
