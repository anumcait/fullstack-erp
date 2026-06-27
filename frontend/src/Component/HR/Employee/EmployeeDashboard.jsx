import React, { useState } from "react";
import EmployeeReport from "./EmployeeMasterReport";
import EmployeeForm from "./AddEmployee";
import ModuleTabBar from "../Common/ModuleTabBar";
import { FaUsers, FaUserPlus, FaFileExport, FaChartBar } from "react-icons/fa";
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("report");

  const tabs = [
    { label: "Employee Master List", value: "report", icon: <FaUsers /> },
    { label: "Onboard New Employee", value: "new", icon: <FaUserPlus /> },
    { label: "Statistics & Insights", value: "stats", icon: <FaChartBar /> },
    { label: "Export Data", value: "export", icon: <FaFileExport /> }
  ];

  return (
    <div className="employee-dashboard-container">
      <ModuleTabBar
        title="Employee Master Management"
        tabs={tabs}
        active={selectedAction}
        onChange={setSelectedAction}
      />

      <div className="employee-dashboard-content">
        {selectedAction === "new" && <EmployeeForm />}
        {selectedAction === "report" && <EmployeeReport onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "stats" && (
          <div className="stats-insight-container animate-fadeIn">
            <div className="stats-header-section mb-6">
              <h2 className="text-xl font-bold text-gray-800">Workforce Analytics</h2>
              <p className="text-gray-500 text-sm">Enterprise-wide employee distribution and health indicators</p>
            </div>
            <div className="stats-grid-simple">
              <div className="s-card">
                <span className="s-label text-blue-500">Active Headcount</span>
                <span className="s-value">842</span>
                <span className="s-trend up font-bold text-green-500">+12 this month</span>
              </div>
              <div className="s-card">
                <span className="s-label text-purple-500">Departmental Spread</span>
                <span className="s-value">14</span>
                <span className="s-trend text-gray-400">Global divisions</span>
              </div>
              <div className="s-card">
                <span className="s-label text-orange-500">Retention Rate</span>
                <span className="s-value">96.4%</span>
                <span className="s-trend up font-bold text-green-500">Exceeding targets</span>
              </div>
            </div>
          </div>
        )}
        {selectedAction === "export" && (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <FaFileExport size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-700 font-bold mb-2">Export Data Hub</h3>
            <p className="text-gray-500 text-sm">Detailed exports (PDF/Excel) are available inside the <strong>Employee Report</strong> tab for granular filtering.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
