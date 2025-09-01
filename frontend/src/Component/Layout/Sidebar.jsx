import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiUsers,
  FiUserPlus,
  FiClipboard,
  FiMenu,
  FiSettings,
  FiLogOut,
  FiHome,
  FiX,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';

import './Sidebar.css';

const Sidebar = () => {
  const [openSubmenu, setOpenSubmenu] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Keep submenu open when on its child route
  const isEmployeeRoute = location.pathname.startsWith('/employees') || location.pathname.startsWith('/add-employee');

  useEffect(() => {
    if (isEmployeeRoute) {
      setOpenSubmenu('employee');
    }
  }, [location.pathname]);

  // Toggle submenu manually
  const toggleSubmenu = (menu) => {
    if (openSubmenu === menu) {
      setOpenSubmenu('');
    } else {
      setOpenSubmenu(menu);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
    >
      <div className="sidebar-header">
        {!collapsed && <h3>HRMS</h3>}
        <button
          className="sidebar-menu-toggle"
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title="Toggle Sidebar"
        >
          {isHovered ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <ul className="sidebar-menu-list">
        {/* Dashboard */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
          >
            <FiHome />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>

        {/* Employee menu item (with toggle) */}
        <li className={`sidebar-menu-item ${openSubmenu === 'employee' ? 'open' : ''}`}>
          <div
            className="sidebar-menu-link"
            onClick={() => toggleSubmenu('employee')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', cursor: 'pointer' }}
          >
            <FiUsers />
            {!collapsed && (
              <>
                <span>Employee</span>
                <span className="sidebar-submenu-icon" style={{ marginLeft: 'auto' }}>
                  {openSubmenu === 'employee' ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              </>
            )}
          </div>
        </li>

        {/* Submenu */}
        {(openSubmenu === 'employee' || isEmployeeRoute) && (
          <>
            <li className="sidebar-submenu-item">
              <NavLink
                to="/employees"
                className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <FiUsers />
                {!collapsed && <span>Employee Master</span>}
              </NavLink>
            </li>
            <li className="sidebar-submenu-item">
              <NavLink
                to="/add-employee"
                className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <FiUserPlus />
                {!collapsed && <span>Add Employee</span>}
              </NavLink>
            </li>
            <li className="sidebar-submenu-item">
              <NavLink
                to="/employees"
                className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <FiClipboard />
                {!collapsed && <span>Employee Reports</span>}
              </NavLink>
            </li>
          </>
        )}
        {/* Attendance */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/attendance"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
             onClick={() => setOpenSubmenu('')} 
          >
            <FiClipboard />
            {!collapsed && <span>Reports</span>}
          </NavLink>
        </li>
        {/* Leaves */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/leave"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
             onClick={() => setOpenSubmenu('')} 
          >
            <FiClipboard />
            {!collapsed && <span>Leaves</span>}
          </NavLink>
        </li>

        {/* Onduty */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/onduty"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
            onClick={() => setOpenSubmenu('')} 
          >
            <FiClipboard />
            {!collapsed && <span>Onduty</span>}
          </NavLink>
        </li>

        {/* Reports */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/reports"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
             onClick={() => setOpenSubmenu('')} 
          >
            <FiClipboard />
            {!collapsed && <span>Reports</span>}
          </NavLink>
        </li>

        {/* Settings */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
             onClick={() => setOpenSubmenu('')} 
          >
            <FiSettings />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </li>

        {/* Logout */}
        <li className="sidebar-menu-item">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-menu-link ${isActive ? 'sidebar-active' : ''}`}
             onClick={() => setOpenSubmenu('')} 
          >
            <FiLogOut />
            {!collapsed && <span>Logout</span>}
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
