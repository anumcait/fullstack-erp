import React, { useState, useEffect } from "react";
import HRDashboard from "./HRDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";
import { FaUserTie, FaUsersCog, FaUser } from "react-icons/fa";

export default function DashboardTabs() {
    const [activeTab, setActiveTab] = useState(null);
    const [role, setRole] = useState("EMPLOYEE");
    const [accessibleTabs, setAccessibleTabs] = useState([]);

    useEffect(() => {
        let storedRole = localStorage.getItem("userRole");
        if (!storedRole) storedRole = sessionStorage.getItem("userRole");
        const r = storedRole ? storedRole.trim().toUpperCase() : "EMPLOYEE";
        setRole(r);

        let storedPerms = localStorage.getItem("userPermissions");
        if (!storedPerms) storedPerms = sessionStorage.getItem("userPermissions");
        const userPermissions = JSON.parse(storedPerms || "[]");

        // Determine permissions per tab
        let canAccessHR = r === "ADMIN" || r === "HR" || userPermissions.includes("HR_DASHBOARD_HR");
        const canAccessManager = r === "ADMIN" || r === "MANAGER" || userPermissions.includes("HR_DASHBOARD_MGR");
        // Admin is not a real employee, so don't expose the self-service Employee tab
        // (it would otherwise show leave/attendance data for empid 1001).
        const canAccessEmployee = r !== "ADMIN";

        // Managers should NOT see HR Dashboard (explicit exclusion)
        if (r === "MANAGER") {
            canAccessHR = false;
        }

        const tabs = [];
        if (canAccessEmployee) {
            tabs.push({ name: "Employee", label: "Employee Dashboard", icon: <FaUser /> });
        }
        if (canAccessManager) {
            tabs.push({ name: "Manager", label: "Manager Dashboard", icon: <FaUserTie /> });
        }
        if (canAccessHR) {
            tabs.push({ name: "HR", label: "HR Dashboard", icon: <FaUsersCog /> });
        }

        setAccessibleTabs(tabs);

        // Set default tab safely based on available tabs
        if (tabs.length > 0) {
            const defaultTab = (r === "ADMIN" && canAccessHR) ? "HR" : tabs[0].name;
            setActiveTab(defaultTab);
        }
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case "Employee": return <EmployeeDashboard />;
            case "Manager": return <ManagerDashboard />;
            case "HR": return <HRDashboard />;
            default: return null;
        }
    };

    if (activeTab === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-gray-500 text-lg animate-pulse font-sans font-semibold">Loading dashboard...</p>
            </div>
        );
    }

    // Handle case where user has no accessible dashboards at all
    if (accessibleTabs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center border border-slate-200">
                    <p className="text-red-500 text-lg font-sans font-bold">Access Denied</p>
                    <p className="text-gray-500 mt-2 text-sm font-sans">You do not have permission to view any dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Tab Navigation - Shown only if the user has access to more than 1 dashboard */}
            {accessibleTabs.length > 1 && (
                <div className="p-4 bg-slate-50 pb-0">
                    <div className="flex flex-wrap justify-center gap-3">
                        {accessibleTabs.map((tab) => {
                            const isActive = activeTab === tab.name;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all duration-200 font-sans font-semibold text-sm border ${isActive
                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Render child dashboards directly at root level with their own styles */}
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
}
