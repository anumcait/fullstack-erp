import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdvanceForm from "./AdvanceForm";
import AdvanceTable from "./AdvanceTable";
import AdvanceApproval from "./AdvanceApproval";
import ModuleTabBar from "../Common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt /> },
  { label: "New", value: "new", icon: <FaPlus /> },
  { label: "Approval", value: "approval", icon: <FaCheckDouble /> },
];

const AdvanceDashboard = () => {
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
      <ModuleTabBar title="Salary Advances" tabs={TABS} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <AdvanceTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <AdvanceForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <AdvanceApproval />}
      </div>
    </div>
  );
};

export default AdvanceDashboard;
