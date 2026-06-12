import React, { useState, useRef, useEffect } from "react";
import EmployeeReport from "./EmployeeMasterReport";
import EmployeeForm from "./AddEmployee";
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("report");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
    { label: "New", value: "new" },
    { label: "Employee Report", value: "report" },
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
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="employee-dashboard-container">
      <div className="employee-dashboard-header">
        <h2 className="employee-dashboard-title">Employee Dashboard</h2>
        <div className="employee-dropdown-wrapper" ref={dropdownRef}>
          <button className="employee-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            ☰
          </button>
          {dropdownOpen && (
            <ul className="employee-dropdown-menu">
              {actions.map((action) => (
                <li key={action.value} onClick={() => handleMenuClick(action.value)}>
                  {action.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="employee-dashboard-content">
        {selectedAction === "new" && <EmployeeForm />}
        {selectedAction === "report" && <EmployeeReport />}
        {selectedAction === "export" && <p style={{ padding: "20px" }}>📤 Please use export buttons inside the report.</p>}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
