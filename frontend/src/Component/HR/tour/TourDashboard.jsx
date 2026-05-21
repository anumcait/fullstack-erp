import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TourForm from "./TourForm";
import TourTable from "./TourTable";
import TourApproval from "./TourApproval";
import './TourDashboard.css';

const TourDashboard = () => {
  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (perm) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(perm);
  };

  const allActions = [
    { label: "New", value: "new", permission: 'HR_TOUR' },
    { label: "View List", value: "table", permission: 'HR_TOUR' },
    { label: "Approval", value: "approval", permission: 'HR_TOUR_APPROVE' },
    { label: "Export", value: "export", permission: 'HR_TOUR' }
  ];

  const actions = allActions.filter(action => hasPermission(action.permission));
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
        <h2 className="shift-dashboard-title">Tour Application Dashboard</h2>
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

      <div className="shift-dashboard-content" key={location.state?.reset || 'default'}>
        {selectedAction === "table" && <TourTable onNewEntry={() => setSelectedAction("new")} />}
        {selectedAction === "new" && <TourForm onClose={() => setSelectedAction("table")} />}
        {selectedAction === "approval" && <TourApproval />}
      </div>
    </div>
  );
};

export default TourDashboard;
