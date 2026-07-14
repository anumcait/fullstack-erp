import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TourForm from "./TourForm";
import TourTable from "./TourTable";
import TourApproval from "./TourApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TourDashboard = () => {
  const userRole = localStorage.getItem("userRole");
  const userPermissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
  const hasPermission = (perm) => userRole === "ADMIN" || userPermissions.includes(perm);

  const allTabs = [
    { label: "View List", value: "table", icon: <FaListAlt />, permission: "HR_TOUR" },
    { label: "New", value: "new", icon: <FaPlus />, permission: "HR_TOUR" },
    { label: "Approval", value: "approval", icon: <FaCheckDouble />, permission: "HR_TOUR_APPROVE" },
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
      <ModuleTabBar title="Tour Application" tabs={tabs} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <TourTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <TourForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <TourApproval />}
      </div>
    </div>
  );
};

export default TourDashboard;
