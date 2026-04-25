import React, { useState, useRef, useEffect } from "react";
import HRAttendanceForm from "./HRAttendance";
import HRAttendanceTable from "./HRAttendanceTable";
import "./HRAttendanceDashboard.css";

const HRAttendanceDashboard = () => {
  const [selectedAction, setSelectedAction] = useState("table");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
    { label: "New", value: "new" },
    { label: "View List", value: "table" },
    { label: "Export", value: "export" },
  ];

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
    <div className="hr-dashboard-container">
      {/* Header Row */}
      <div className="hr-dashboard-header">
        <h2 className="hr-dashboard-title">
          HR Attendance ::{" "}
          {selectedAction === "new"
            ? "New Entry"
            : selectedAction === "table"
            ? "View List"
            : "Export"}
        </h2>

        <div className="hr-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="hr-dropdown-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            ☰
          </button>
          {dropdownOpen && (
            <ul className="hr-dropdown-menu">
              {actions.map((action) => (
                <li
                  key={action.value}
                  onClick={() => handleMenuClick(action.value)}
                >
                  {action.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Content based on menu click */}
      <div className="hr-dashboard-content">
        {/* Table Section */}
        {selectedAction === "table" && <HRAttendanceTable />}

        {/* Form Section */}
        {selectedAction === "new" && <HRAttendanceForm />}

        {/* Export Section */}
        {selectedAction === "export" && (
          <div className="hr-export-message">
            <p>Export functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRAttendanceDashboard;
