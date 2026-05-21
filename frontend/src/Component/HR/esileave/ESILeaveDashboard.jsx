import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ESILeaveForm from "./ESILeaveForm";
import ESILeaveTable from "./ESILeaveTable";
import ESILeaveApproval from "./ESILeaveApproval";
import './ESILeaveDashboard.css';

const ESILeaveDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action && ['new', 'table', 'approval'].includes(action)) {
      setSelectedAction(action);
    }
  }, [location.search]);

  useEffect(() => {
    if (location.state?.reset) setSelectedAction("table");
  }, [location.state?.reset]);

  const actions = [
    { label: "New", value: "new" },
    { label: "View List", value: "table" },
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
      <div className="od-dashboard-header">
        <h2 className="od-dashboard-title">ESI Leave Dashboard </h2>
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

      <div className="od-dashboard-content" key={location.state?.reset || 'default'}>
        {selectedAction === "table" && <ESILeaveTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <ESILeaveForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <ESILeaveApproval />}
      </div>
    </div>
  );
};

export default ESILeaveDashboard;
