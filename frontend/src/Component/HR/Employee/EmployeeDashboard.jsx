import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeeReport from "./EmployeeMasterReport";
import EmployeeForm from "./AddEmployee";
import EmployeeIncrements from "./EmployeeIncrements";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaUsers, FaUserPlus, FaFileExport, FaChartBar, FaChartLine } from "react-icons/fa";
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("report");
  const [stats, setStats] = useState({ active: 0, total: 0, depts: 0, retention: 0, newThisMonth: 0 });
  useEffect(() => {
    if (selectedAction !== 'stats') return;
    (async () => {
      try {
        const [a, l] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/employees?filterType=active`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/employees?filterType=left`, { withCredentials: true })
        ]);
        const active = a.data?.length || 0;
        const left = l.data?.length || 0;
        const total = active + left;
        const depts = new Set((a.data||[]).map(e=>e.deptname).filter(Boolean)).size;
        const retention = total ? ((active/total)*100).toFixed(1) : 0;
        const curM = new Date().getMonth(), curY = new Date().getFullYear();
        const newThisMonth = (a.data||[]).filter(e=>{ if(!e.doj) return false; const d=new Date(e.doj); return d.getMonth()===curM && d.getFullYear()===curY; }).length;
        setStats({ active, total, depts, retention, newThisMonth });
      } catch {}
    })();
  }, [selectedAction]);

  const tabs = [
    { label: "Employee Master List", value: "report", icon: <FaUsers /> },
    { label: "Onboard New Employee", value: "new", icon: <FaUserPlus /> },
    { label: "Increments", value: "increments", icon: <FaChartLine /> },
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
        {selectedAction === "increments" && <EmployeeIncrements />}
        {selectedAction === "stats" && (
          <div className="stats-insight-container animate-fadeIn">
            <div className="stats-header-section mb-6">
              <h2 className="text-xl font-bold text-gray-800">Workforce Analytics</h2>
              <p className="text-gray-500 text-sm">Enterprise-wide employee distribution and health indicators</p>
            </div>
            <div className="stats-grid-simple">
              <div className="s-card">
                <span className="s-label text-blue-500">Active Headcount</span>
                <span className="s-value">{stats.active}</span>
                <span className="s-trend up font-bold text-green-500">+{stats.newThisMonth} this month</span>
              </div>
              <div className="s-card">
                <span className="s-label text-purple-500">Departmental Spread</span>
                <span className="s-value">{stats.depts}</span>
                <span className="s-trend text-gray-400">{stats.total} total employees</span>
              </div>
              <div className="s-card">
                <span className="s-label text-orange-500">Retention Rate</span>
                <span className="s-value">{stats.retention}%</span>
                <span className="s-trend up font-bold text-green-500">{stats.retention>=95 ? 'Exceeding targets' : 'Monitoring'}</span>
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
