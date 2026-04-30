import React, { useState, useRef, useEffect } from "react";
import OnDutyForm from "./OnDutyForm";
import OnDutyTable from "./OnDutyTable";
import OnDutyApproval from "./OnDutyApproval";
import './OnDutyDashboard.css';

const OnDutyDashboard = () => {
  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (perm) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(perm);
  };

  const allActions = [
    { label: "New", value: "new", permission: 'HR_ONDUTY' },
    { label: "View List", value: "table", permission: 'HR_ONDUTY' },
    { label: "Approval", value: "approval", permission: 'HR_ONDUTY_APPROVE' },
    { label: "Export", value: "export", permission: 'HR_ONDUTY' }
  ];

  const actions = allActions.filter(action => hasPermission(action.permission));
  const [selectedAction, setSelectedAction] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleMenuClick = (action) => {
    setSelectedAction(action);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="od-dashboard-container">
      {/* Header Row */}
      <div className="od-dashboard-header">
        <h2 className="od-dashboard-title">On Duty Dashboard </h2>
        <div className="od-dropdown-wrapper" ref={dropdownRef}>
          <button className="od-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            ☰
          </button>
          {dropdownOpen && (
            <ul className="od-dropdown-menu">
              {actions.map((action) => (
                <li key={action.value} onClick={() => handleMenuClick(action.value)}>
                  {action.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Content based on menu click */}
      <div className="od-dashboard-content">
        {selectedAction === "table" && <OnDutyTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <OnDutyForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <OnDutyApproval />}
      </div>
    </div>
  );
};

export default OnDutyDashboard;
