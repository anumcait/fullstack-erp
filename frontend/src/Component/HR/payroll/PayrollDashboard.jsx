import React, { useState, useRef, useEffect } from "react";
import SalarySetup from "./SalarySetup";
import SalaryProcessing from "./SalaryProcessing";
import PayslipList from "./PayslipList";
import './PayrollDashboard.css';

const PayrollDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("processing");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
    { label: "Salary Setup", value: "setup" },
    { label: "Salary Processing", value: "processing" },
    { label: "Payslips", value: "payslips" }
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

  const getTitle = () => {
    switch (selectedAction) {
      case 'setup': return 'Salary Setup';
      case 'processing': return 'Salary Processing';
      case 'payslips': return 'Payslips';
      default: return 'Payroll Dashboard';
    }
  };

  return (
    <div className="od-dashboard-container">
      <div className="od-dashboard-header">
        <h2 className="od-dashboard-title">{getTitle()}</h2>
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

      <div className="od-dashboard-content">
        {selectedAction === "setup" && <SalarySetup />}
        {selectedAction === "processing" && <SalaryProcessing />}
        {selectedAction === "payslips" && <PayslipList />}
      </div>
    </div>
  );
};

export default PayrollDashboard;
