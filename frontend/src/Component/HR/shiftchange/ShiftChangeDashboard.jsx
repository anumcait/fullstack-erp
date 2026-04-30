import React, { useState, useRef, useEffect } from "react";
import ShiftChangeForm from "./ShiftChangeForm";
import ShiftChangeTable from "./ShiftChangeTable";
import ShiftChangeApproval from "./ShiftChangeApproval";
import './ShiftChangeDashboard.css';

const ShiftChangeDashboard = () => {
  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (perm) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(perm);
  };

  const allActions = [
    { label: "New", value: "new", permission: 'HR_SHIFT_CHG' },
    { label: "View List", value: "table", permission: 'HR_SHIFT_CHG' },
    { label: "Approval", value: "approval", permission: 'HR_SHIFT_CHG_APPROVE' },
    { label: "Export", value: "export", permission: 'HR_SHIFT_CHG' }
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
    <div className="shift-dashboard-container">
      {/* Header Row */}
      <div className="shift-dashboard-header">
        <h2 className="shift-dashboard-title">Shift Change Dashboard </h2>
        <div className="shift-dropdown-wrapper" ref={dropdownRef}>
          <button className="shift-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            ☰
          </button>
          {dropdownOpen && (
            <ul className="shift-dropdown-menu">
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
      <div className="shift-dashboard-content">
        {selectedAction === "table" && <ShiftChangeTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <ShiftChangeForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <ShiftChangeApproval />}
      </div>
    </div>
  );
};

export default ShiftChangeDashboard;
