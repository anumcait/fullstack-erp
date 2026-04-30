import React, { useState, useRef, useEffect } from "react";
import WoffChangeForm from "./WoffChangeForm";
import WoffChangeTable from "./WoffChangeTable";
import WoffApproval from "./WoffApproval";
import './WoffChangeDashboard.css';

const WoffChangeDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className="woff-dashboard-container">
      <div className="woff-dashboard-header">
        <h2 className="woff-dashboard-title">Woff Change Dashboard</h2>
        <div className="woff-dropdown-wrapper" ref={dropdownRef}>
          <button className="woff-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            ☰
          </button>
          {dropdownOpen && (
            <ul className="woff-dropdown-menu">
              {actions.map((action) => (
                <li key={action.value} onClick={() => handleMenuClick(action.value)}>
                  {action.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="woff-dashboard-content">
        {selectedAction === "table" && <WoffChangeTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <WoffChangeForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <WoffApproval />}
      </div>
    </div>
  );
};

export default WoffChangeDashboard;
