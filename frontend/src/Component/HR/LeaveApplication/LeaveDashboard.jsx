import React, { useState, useRef, useEffect } from "react";
import LeaveReport from "./LeaveReport";
import './LeaveDashboard.css';
import LeaveMaster from "./LeaveMaster";
import LeaveApproval from "./LeaveApproval";
import LeaveApplication from "./LeaveApplication";

const LeaveDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("report");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
    { label: "New Application", value: "new" },
    { label: "View List", value: "report" },
    { label: "Leave Master", value: "master" },
    { label: "Approval", value: "approval" },
    { label: "Export", value: "export" }
  ];

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
        {selectedAction === "report" && <LeaveReport onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <LeaveApplication onClose={() => setSelectedAction("report")} />}
        {selectedAction === "master" && <LeaveMaster />}
        {selectedAction === "approval" && <LeaveApproval />}
        {selectedAction === "export" && <p style={{ padding: "20px" }}>📤 Please use export buttons inside the report.</p>}
      </div>
    </div>
  );
};

export default LeaveDashboard;
