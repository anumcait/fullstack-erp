import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SalarySetup from "./SalarySetup";
import SalaryProcessing from "./SalaryProcessing";
import PayslipList from "./PayslipList";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaCog, FaPlay, FaFileAlt } from "react-icons/fa";

const TABS = [
  { label: "Salary Processing", value: "processing", icon: <FaPlay /> },
  { label: "Salary Setup", value: "setup", icon: <FaCog /> },
  { label: "Payslips", value: "payslips", icon: <FaFileAlt /> },
];

const PayrollDashboard = () => {
  const [searchParams] = useSearchParams();
  const [selectedAction, setSelectedAction] = useState("processing");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["processing", "setup", "payslips"].includes(tab)) {
      setSelectedAction(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleTabBar title="Payroll" tabs={TABS} active={selectedAction} onChange={setSelectedAction} />
      <div className="p-6">
        {selectedAction === "setup" && <SalarySetup />}
        {selectedAction === "processing" && <SalaryProcessing />}
        {selectedAction === "payslips" && <PayslipList />}
      </div>
    </div>
  );
};

export default PayrollDashboard;
