import React, { useState, useRef, useEffect } from "react";
import LeaveReport from "./LeaveReport";
import './LeaveDashboard.css';
import LeaveForm from "./LeaveForm";
import LeaveMaster from "./LeaveMaster";
import LeaveApproval from "./LeaveApproval";
import TestApplication from "./TestApplication";

const LeaveDashboard = () => {
  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (perm) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(perm);
  };

  const allActions = [
    { label: "New", value: "new", permission: 'HR_LEAVE_APP' },
    { label: "Leave Report", value: "report", permission: 'HR_LEAVE_APP' },
    { label: "Leave Master", value: "master", permission: 'HR_LEAVE_MASTER' },
    { label: "Leave Approval", value: "approval", permission: 'HR_LEAVE_APPROVE' },
    { label: "Export", value: "export", permission: 'HR_LEAVE_APP' }
  ];

  const actions = allActions.filter(action => hasPermission(action.permission));
  const [selectedAction, setSelectedAction] = useState(actions[0]?.value || "report");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleMenuClick = (action) => {
    setSelectedAction(action);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="leave-dashboard-container">
      <div className="leave-dashboard-header">
        <h2 className="leave-dashboard-title">Leave Dashboard</h2>
        <div className="leave-dropdown-wrapper" ref={dropdownRef}>
          <button className="leave-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            ☰
          </button>
          {dropdownOpen && (
            <ul className="leave-dropdown-menu">
              {actions.map((action) => (
                <li key={action.value} onClick={() => handleMenuClick(action.value)}>
                  {action.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="leave-dashboard-content">
        {selectedAction === "new" && <LeaveForm />}
        {selectedAction === "report" && <LeaveReport />}
        {selectedAction === "master" && <LeaveMaster />}
        {selectedAction === "approval" && <LeaveApproval />}
        {selectedAction === "test" && <TestApplication />}
        {selectedAction === "export" && <p style={{ padding: "20px" }}>📤 Please use export buttons inside the report.</p>}
      </div>
    </div>
  );
};

export default LeaveDashboard;
