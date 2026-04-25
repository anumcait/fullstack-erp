// src/pages/Dashboard/DashboardTabs.jsx
import React, { useState, useEffect } from "react";
import HRDashboard from "./HRDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";
import { FaUserTie, FaUsersCog, FaUser } from "react-icons/fa";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState(null); // null = loading
  const [role, setRole] = useState("EMPLOYEE");

  useEffect(() => {
    // Try localStorage first (set during login)
    let storedRole = localStorage.getItem("userRole");

    if (!storedRole) {
      // Fallback: try sessionStorage
      storedRole = sessionStorage.getItem("userRole");
    }

    const userRole = storedRole ? storedRole.trim().toUpperCase() : "EMPLOYEE";
    setRole(userRole);

    if (userRole === "HR") setActiveTab("HR");
    else if (userRole === "MANAGER") setActiveTab("Manager");
    else setActiveTab("Employee");
  }, []);

  const tabs = [
    { name: "Employee", icon: <FaUser /> },
    { name: "Manager", icon: <FaUserTie /> },
    { name: "HR", icon: <FaUsersCog /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Employee":
        return <EmployeeDashboard />;
      case "Manager":
        return <ManagerDashboard />;
      case "HR":
        return <HRDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  // Determine accessible tabs per role
  const canAccess = (tabName) => {
    const tab = tabName.toUpperCase();
    if (role === "HR") return tab === "HR" || tab === "EMPLOYEE";
    if (role === "MANAGER") return tab === "MANAGER" || tab === "EMPLOYEE";
    if (role === "EMPLOYEE") return tab === "EMPLOYEE";
    return tab === "EMPLOYEE";
  };

  // Show loader until role is resolved to avoid blank flash
  if (activeTab === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-500 text-lg animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {tabs.map((tab) => {
          const isAccessible = canAccess(tab.name);
          const isActive = activeTab === tab.name;

          return (
            <button
              key={tab.name}
              onClick={() => isAccessible && setActiveTab(tab.name)}
              disabled={!isAccessible}
              className={`px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : isAccessible
                  ? "bg-white text-slate-700 hover:bg-blue-100"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {tab.icon}
              <span>{tab.name} Dashboard</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg transition-all duration-300 animate-fadeIn">
        {renderTabContent()}
      </div>
    </div>
  );
}
