import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import WoffChangeForm from "./WoffChangeForm";
import WoffChangeTable from "./WoffChangeTable";
import WoffApproval from "./WoffApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "View List", value: "table", icon: <FaListAlt /> },
  { label: "New", value: "new", icon: <FaPlus /> },
  { label: "Approval", value: "approval", icon: <FaCheckDouble /> },
];

const WoffChangeDashboard = () => {
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
      <ModuleTabBar title="Weekly Off Change" tabs={TABS} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6" key={location.state?.reset || "default"}>
        {selectedAction === "table" && <WoffChangeTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <WoffChangeForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <WoffApproval />}
      </div>
    </div>
  );
};

export default WoffChangeDashboard;
