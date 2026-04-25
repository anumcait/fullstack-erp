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
    <div className="shift-dashboard-container">
      <div className="shift-dashboard-header">
        <h2 className="shift-dashboard-title">Woff Change Dashboard</h2>
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

      <div className="shift-dashboard-content">
        {selectedAction === "table" && <WoffChangeTable />}
        {selectedAction === "new" && <WoffChangeForm />}
        {selectedAction === "approval" && <WoffApproval />}
      </div>
    </div>
  );
};

export default WoffChangeDashboard;
