import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useNavigationGuard } from "../../context/NavigationGuardContext";
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
  FiChevronRight,
  FiCheckSquare,
  FiGrid,
  FiClock,
  FiCamera,
  FiCalendar,
  FiMapPin,
  FiRefreshCw,
  FiDollarSign,
  FiActivity,
  FiShoppingCart,
  FiBox,
  FiTool,
  FiShield,
  FiPieChart,
  FiTrendingUp,
  FiLayers,
  FiLayout,
  FiCpu,
  FiTruck,
  FiBriefcase,
  FiCircle,
  FiShuffle,
  FiFilePlus,
  FiMail,
  FiShoppingBag,
  FiUser,
  FiTag,
  FiStar,
  FiFileText,
  FiShare,
  FiRotateCcw,
  FiArrowDown,
  FiArrowUp,
  FiList
} from "react-icons/fi";

import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { isDirty, setIsDirty } = useNavigationGuard();
  const [pendingPath, setPendingPath] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(() => {
    return localStorage.getItem('sidebarSubmenu') || "";
  });
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarSubmenu', openSubmenu);
  }, [openSubmenu]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('empName');
    navigate('/');
  };

  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (permission) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(permission);
  };

  const path = location.pathname;
  let activeModule = "HR";

  if (path.startsWith("/accounts") || path.startsWith("/invoice")) activeModule = "ACCOUNTS";
  else if (path.startsWith("/purchase")) activeModule = "PURCHASE";
  else if (path.startsWith("/stores") || path.startsWith("/inventory")) activeModule = "STORES";
  else if (path.startsWith("/production")) activeModule = "PRODUCTION";
  else if (path.startsWith("/planning")) activeModule = "PLANNING";
  else if (path.startsWith("/engineering")) activeModule = "ENGINEERING";
  else if (path.startsWith("/quality")) activeModule = "QUALITY";
  else if (path.startsWith("/maintenance")) activeModule = "MAINTENANCE";
  else if (path.startsWith("/marketing")) activeModule = "MARKETING";
  else if (path.startsWith("/subcontract")) activeModule = "SUBCONTRACT";

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? "" : menu);
  };

  const handleNavClick = (to, e) => {
    e.preventDefault();
    if (isDirty) {
      setPendingPath(to);
      setConfirmOpen(true);
    } else {
      navigate(to, { replace: true, state: { reset: Date.now() } });
    }
  };

  const confirmLeave = () => {
    setIsDirty(false);
    setConfirmOpen(false);
    navigate(pendingPath, { replace: true, state: { reset: Date.now() } });
    setPendingPath(null);
  };

  const cancelLeave = () => {
    setConfirmOpen(false);
    setPendingPath(null);
  };

  const SubItem = ({ to, label, icon: Icon = FiCircle }) => (
    <li>
      <NavLink
        to={to}
        onClick={(e) => handleNavClick(to, e)}
        className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}
      >
        <Icon size={collapsed ? 20 : 16} className="submenu-icon" />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    </li>
  );

  return (
    <aside ref={sidebarRef} className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h3>{activeModule}</h3>}
        <button className="sidebar-menu-toggle" onClick={() => setCollapsed(!collapsed)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {isHovered ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <ul className="sidebar-menu-list">
        {/* --- ACCOUNTS MODULE --- */}
        {activeModule === "ACCOUNTS" && (
          <>
            {hasPermission('ACC_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/accounts" onClick={(e) => handleNavClick("/accounts", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}

            {(hasPermission('ACC_INV_SALES') || hasPermission('ACC_INV_PURCH') || hasPermission('ACC_INV_DEBIT') || hasPermission('ACC_INV_CREDIT')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "accInv" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("accInv")}>
                  <FiShoppingCart />
                  {!collapsed && (
                    <>
                      <span>Invoicing</span>
                      <span className="expand-icon">{openSubmenu === "accInv" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "accInv" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('ACC_INV_SALES') && <SubItem to="/invoice/sales" label="Sales Invoice" icon={FiLayers} />}
                    {hasPermission('ACC_INV_PURCH') && <SubItem to="/invoice/purchase" label="Purchase Invoice" icon={FiShoppingCart} />}
                    {hasPermission('ACC_INV_DEBIT') && <SubItem to="/invoice/debit-note" label="Debit Note" icon={FiTrendingUp} />}
                    {hasPermission('ACC_INV_CREDIT') && <SubItem to="/invoice/credit-note" label="Credit Note" icon={FiTrendingUp} />}
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('ACC_VOUCH_PAY') || hasPermission('ACC_VOUCH_REC') || hasPermission('ACC_VOUCH_JOUR') || hasPermission('ACC_VOUCH_CONTRA')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "accVouch" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("accVouch")}>
                  <FiGrid />
                  {!collapsed && (
                    <>
                      <span>Vouchers</span>
                      <span className="expand-icon">{openSubmenu === "accVouch" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "accVouch" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('ACC_VOUCH_PAY') && <SubItem to="/accounts/payment" label="Payment Voucher" icon={FiDollarSign} />}
                    {hasPermission('ACC_VOUCH_REC') && <SubItem to="/accounts/receipt" label="Receipt Voucher" icon={FiDollarSign} />}
                    {hasPermission('ACC_VOUCH_JOUR') && <SubItem to="/accounts/journal" label="Journal Voucher" icon={FiClipboard} />}
                    {hasPermission('ACC_VOUCH_CONTRA') && <SubItem to="/accounts/contra" label="Contra Entry" icon={FiRefreshCw} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- HR MODULE --- */}
        {activeModule === "HR" && (
          <>
            {hasPermission('HR_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/dashboard" onClick={(e) => handleNavClick("/dashboard", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}

            {(hasPermission('HR_EMP_MASTER') || hasPermission('HR_SHIFT_MASTER') || hasPermission('HR_HOLIDAY_MASTER') || hasPermission('HR_LEAVE_MASTER')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrMaster" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("hrMaster")}>
                  <FiUsers />
                  {!collapsed && (
                    <>
                      <span>Master Data</span>
                      <span className="expand-icon">{openSubmenu === "hrMaster" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "hrMaster" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('HR_EMP_MASTER') && <SubItem to="/employees" label="Employee Master" icon={FiUsers} />}
                    {hasPermission('HR_SHIFT_MASTER') && <SubItem to="/shift-master" label="Shift Master" icon={FiClock} />}
                    {hasPermission('HR_HOLIDAY_MASTER') && <SubItem to="/holidays" label="Holiday Master" icon={FiCalendar} />}
                    {hasPermission('HR_LEAVE_MASTER') && <SubItem to="/leaves-master" label="Leaves Master" icon={FiCheckSquare} />}
                    {hasPermission('HR_PROFILE_APPROVE') && <SubItem to="/profile-requests" label="Profile Requests" icon={FiRefreshCw} />}
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('HR_ATT_ENTRY') || hasPermission('HR_ATT_MOD') || hasPermission('HR_SHIFT_SCHED') || hasPermission('HR_MUSTER') || hasPermission('HR_OT_APP')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrAtt" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("hrAtt")}>
                  <FiClock />
                  {!collapsed && (
                    <>
                      <span>Attendance</span>
                      <span className="expand-icon">{openSubmenu === "hrAtt" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "hrAtt" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('HR_ATT_ENTRY') && <SubItem to="/hr-attendance" label="HR Attendance" icon={FiActivity} />}
                    {hasPermission('HR_ATT_MOD') && <SubItem to="/attendance-mod" label="Attendance Correction" icon={FiCheckSquare} />}
                    {hasPermission('HR_SHIFT_SCHED') && <SubItem to="/shiftschedule" label="Shift Schedule" icon={FiCalendar} />}
                    {hasPermission('HR_MUSTER') && <SubItem to="/muster-roll" label="Muster Roll" icon={FiClipboard} />}
                    {hasPermission('HR_OT_APP') && <SubItem to="/ot-approval" label="OT Approval" icon={FiCheckSquare} />}
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('HR_ADVANCE') || hasPermission('HR_PAYROLL_PROC') || hasPermission('HR_ESI_LEAVE')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrPayroll" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("hrPayroll")}>
                  <FiDollarSign />
                  {!collapsed && (
                    <>
                      <span>Payroll</span>
                      <span className="expand-icon">{openSubmenu === "hrPayroll" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "hrPayroll" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('HR_ADVANCE') && <SubItem to="/advance" label="Salary Advances" icon={FiTrendingUp} />}
                    {hasPermission('HR_PAYROLL_PROC') && <SubItem to="/payroll" label="Monthly Payroll" icon={FiDollarSign} />}
                    {hasPermission('HR_ESI_LEAVE') && <SubItem to="/esileave" label="ESI Leaves" icon={FiCalendar} />}
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('HR_LEAVE_APP') || hasPermission('HR_ONDUTY') || hasPermission('HR_TOUR') || hasPermission('HR_SHIFT_CHG') || hasPermission('HR_WOFF_CHG')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrTrans" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("hrTrans")}>
                  <FiRefreshCw />
                  {!collapsed && (
                    <>
                      <span>Transactions</span>
                      <span className="expand-icon">{openSubmenu === "hrTrans" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "hrTrans" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('HR_LEAVE_APP') && <SubItem to="/leave" label="Leave Application" icon={FiBriefcase} />}
                    {hasPermission('HR_ONDUTY') && <SubItem to="/onduty" label="On-Duty" icon={FiMapPin} />}
                    {hasPermission('HR_TOUR') && <SubItem to="/tour" label="Tour" icon={FiTruck} />}
                    {hasPermission('HR_SHIFT_CHG') && <SubItem to="/shiftchange" label="Shift Change" icon={FiRefreshCw} />}
                    {hasPermission('HR_WOFF_CHG') && <SubItem to="/woffchange" label="Weekly Off Change" icon={FiCalendar} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- STORES MODULE --- */}
        {activeModule === "STORES" && (
          <>
            {hasPermission('STORES_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/stores" onClick={(e) => handleNavClick("/stores", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('STORES_ITEM_MASTER') || hasPermission('STORES_STOCK_LEDGER') || hasPermission('STORES_PHYSICAL')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeInv" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeInv")}>
                  <FiBox />
                  {!collapsed && (
                    <>
                      <span>Inventory Control</span>
                      <span className="expand-icon">{openSubmenu === "storeInv" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeInv" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('STORES_ITEM_MASTER') && <SubItem to="/edit-item" label="Item Master" icon={FiBox} />}
                    {hasPermission('STORES_STOCK_LEDGER') && <SubItem to="/inventory/ledger" label="Stock Ledger" icon={FiClipboard} />}
                    {hasPermission('STORES_PHYSICAL') && <SubItem to="/inventory/audit" label="Physical Verification" icon={FiCheckSquare} />}
                  </ul>
                )}
              </li>
            )}
            {(hasPermission('STORES_GATE') || hasPermission('STORES_GRN') || hasPermission('STORES_ISSUE') || hasPermission('STORES_RETURN')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeTrans" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeTrans")}>
                  <FiRefreshCw />
                  {!collapsed && (
                    <>
                      <span>Transactions</span>
                      <span className="expand-icon">{openSubmenu === "storeTrans" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeTrans" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('STORES_GATE') && <SubItem to="/inventory/gate-entry" label="Gate Entry" icon={FiLogOut} />}
                    {hasPermission('STORES_GRN') && <SubItem to="/inventory/grn" label="GRN / MRN" icon={FiFileText} />}
                    {hasPermission('STORES_ISSUE') && <SubItem to="/inventory/issue" label="Material Issue" icon={FiShare} />}
                    {hasPermission('STORES_RETURN') && <SubItem to="/inventory/return" label="Material Return" icon={FiRotateCcw} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- PURCHASE MODULE --- */}
        {activeModule === "PURCHASE" && (
          <>
            {hasPermission('PUR_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/purchase" onClick={(e) => handleNavClick("/purchase", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('PUR_REQ') || hasPermission('PUR_RFQ') || hasPermission('PUR_ORDERS')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "purProc" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("purProc")}>
                  <FiShoppingCart />
                  {!collapsed && (
                    <>
                      <span>Procurement</span>
                      <span className="expand-icon">{openSubmenu === "purProc" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "purProc" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('PUR_REQ') && <SubItem to="/purchase/req" label="Purchase Requisitions" icon={FiFilePlus} />}
                    {hasPermission('PUR_RFQ') && <SubItem to="/purchase/rfq" label="Enquiry / RFQ" icon={FiMail} />}
                    {hasPermission('PUR_ORDERS') && <SubItem to="/purchase/orders" label="Purchase Orders" icon={FiShoppingBag} />}
                  </ul>
                )}
              </li>
            )}
            {(hasPermission('PUR_VENDORS') || hasPermission('PUR_PRICES') || hasPermission('PUR_RATING')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "purVend" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("purVend")}>
                  <FiUsers />
                  {!collapsed && (
                    <>
                      <span>Vendor Mgmt</span>
                      <span className="expand-icon">{openSubmenu === "purVend" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "purVend" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('PUR_VENDORS') && <SubItem to="/purchase/vendors" label="Vendor Master" icon={FiUser} />}
                    {hasPermission('PUR_PRICES') && <SubItem to="/purchase/prices" label="Price List Master" icon={FiTag} />}
                    {hasPermission('PUR_RATING') && <SubItem to="/purchase/rating" label="Vendor Rating" icon={FiStar} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- PRODUCTION MODULE --- */}
        {activeModule === "PRODUCTION" && (
          <>
            {hasPermission('PROD_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/production" onClick={(e) => handleNavClick("/production", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('PROD_DAILY') || hasPermission('PROD_MACHINES') || hasPermission('PROD_DOWNTIME')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "prodFloor" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("prodFloor")}>
                  <FiTool />
                  {!collapsed && (
                    <>
                      <span>Shop Floor</span>
                      <span className="expand-icon">{openSubmenu === "prodFloor" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "prodFloor" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('PROD_DAILY') && <SubItem to="/production/daily-entry" label="Daily Production" icon={FiActivity} />}
                    {hasPermission('PROD_MACHINES') && <SubItem to="/production/machines" label="Machine Monitoring" icon={FiCpu} />}
                    {hasPermission('PROD_DOWNTIME') && <SubItem to="/production/downtime" label="Down-Time Entry" icon={FiClock} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- PLANNING MODULE --- */}
        {activeModule === "PLANNING" && (
          <>
            {hasPermission('PLAN_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/planning" onClick={(e) => handleNavClick("/planning", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('PLAN_SCHEDULE') || hasPermission('PLAN_MRP') || hasPermission('PLAN_CAPACITY')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "planProd" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("planProd")}>
                  <FiCalendar />
                  {!collapsed && (
                    <>
                      <span>Prod Planning</span>
                      <span className="expand-icon">{openSubmenu === "planProd" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "planProd" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('PLAN_SCHEDULE') && <SubItem to="/planning/schedule" label="Prod Scheduling" icon={FiClock} />}
                    {hasPermission('PLAN_MRP') && <SubItem to="/planning/mrp" label="MRP Run" icon={FiRefreshCw} />}
                    {hasPermission('PLAN_CAPACITY') && <SubItem to="/planning/capacity" label="Capacity Planning" icon={FiTrendingUp} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- ENGINEERING MODULE --- */}
        {activeModule === "ENGINEERING" && (
          <>
            {hasPermission('ENG_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/engineering" onClick={(e) => handleNavClick("/engineering", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('ENG_ITEMS') || hasPermission('ENG_BOM') || hasPermission('ENG_BOM_DIFF')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "engData" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("engData")}>
                  <FiLayout />
                  {!collapsed && (
                    <>
                      <span>Design Data</span>
                      <span className="expand-icon">{openSubmenu === "engData" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "engData" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('ENG_ITEMS') && <SubItem to="/engineering/items" label="Item Master" icon={FiBox} />}
                    {hasPermission('ENG_BOM') && <SubItem to="/engineering/bom" label="Bill of Materials" icon={FiLayers} />}
                    {hasPermission('ENG_BOM_DIFF') && <SubItem to="/engineering/bom-diff" label="BOM Comparison" icon={FiShuffle} />}
                  </ul>
                )}
              </li>
            )}
            {(hasPermission('ENG_ROUTING') || hasPermission('ENG_WORK_CENTERS')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "engProc" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("engProc")}>
                  <FiCpu />
                  {!collapsed && (
                    <>
                      <span>Process Planning</span>
                      <span className="expand-icon">{openSubmenu === "engProc" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "engProc" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('ENG_ROUTING') && <SubItem to="/engineering/routing" label="Routing Master" icon={FiActivity} />}
                    {hasPermission('ENG_WORK_CENTERS') && <SubItem to="/engineering/work-centers" label="Work Center Master" icon={FiGrid} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- MARKETING MODULE --- */}
        {activeModule === "MARKETING" && (
          <>
            {hasPermission('MARK_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/marketing" onClick={(e) => handleNavClick("/marketing", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('MARK_LEADS') || hasPermission('MARK_QUOTES') || hasPermission('MARK_ORDERS') || hasPermission('MARK_CUSTOMERS')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "markSales" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("markSales")}>
                  <FiTrendingUp />
                  {!collapsed && (
                    <>
                      <span>Sales & CRM</span>
                      <span className="expand-icon">{openSubmenu === "markSales" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "markSales" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('MARK_LEADS') && <SubItem to="/marketing/leads" label="Leads / Enquiries" icon={FiMail} />}
                    {hasPermission('MARK_QUOTES') && <SubItem to="/marketing/quotes" label="Quotations" icon={FiFileText} />}
                    {hasPermission('MARK_ORDERS') && <SubItem to="/marketing/orders" label="Sales Orders" icon={FiShoppingBag} />}
                    {hasPermission('MARK_CUSTOMERS') && <SubItem to="/marketing/customers" label="Customer Master" icon={FiUsers} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- QUALITY MODULE --- */}
        {activeModule === "QUALITY" && (
          <>
            {hasPermission('QUAL_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/quality" onClick={(e) => handleNavClick("/quality", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('QUAL_INCOMING') || hasPermission('QUAL_PROCESS') || hasPermission('QUAL_FINAL')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "qualInsp" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("qualInsp")}>
                  <FiShield />
                  {!collapsed && (
                    <>
                      <span>Inspection</span>
                      <span className="expand-icon">{openSubmenu === "qualInsp" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "qualInsp" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('QUAL_INCOMING') && <SubItem to="/quality/incoming" label="Incoming Inspection" icon={FiArrowDown} />}
                    {hasPermission('QUAL_PROCESS') && <SubItem to="/quality/process" label="In-Process Inspection" icon={FiRefreshCw} />}
                    {hasPermission('QUAL_FINAL') && <SubItem to="/quality/final" label="Final QC / PDI" icon={FiArrowUp} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- MAINTENANCE MODULE --- */}
        {activeModule === "MAINTENANCE" && (
          <>
            {hasPermission('MAINT_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/maintenance" onClick={(e) => handleNavClick("/maintenance", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('MAINT_MACHINES') || hasPermission('MAINT_ASSETS') || hasPermission('MAINT_SCHEDULE')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "maintAssets" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("maintAssets")}>
                  <FiTool />
                  {!collapsed && (
                    <>
                      <span>Assets</span>
                      <span className="expand-icon">{openSubmenu === "maintAssets" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "maintAssets" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('MAINT_MACHINES') && <SubItem to="/maintenance/machines" label="Machine Master" icon={FiCpu} />}
                    {hasPermission('MAINT_ASSETS') && <SubItem to="/maintenance/assets" label="Asset Register" icon={FiList} />}
                    {hasPermission('MAINT_SCHEDULE') && <SubItem to="/maintenance/schedule" label="PM Schedule" icon={FiCalendar} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* --- SUBCONTRACT MODULE --- */}
        {activeModule === "SUBCONTRACT" && (
          <>
            {hasPermission('SUB_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <NavLink to="/subcontract" onClick={(e) => handleNavClick("/subcontract", e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
                  <FiHome /> {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
            )}
            {(hasPermission('SUB_ORDERS') || hasPermission('SUB_ISSUE') || hasPermission('SUB_RECEIPT')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "subOps" ? "open" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("subOps")}>
                  <FiTruck />
                  {!collapsed && (
                    <>
                      <span>Jobwork Ops</span>
                      <span className="expand-icon">{openSubmenu === "subOps" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "subOps" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('SUB_ORDERS') && <SubItem to="/subcontract/orders" label="Job Work Orders" icon={FiFileText} />}
                    {hasPermission('SUB_ISSUE') && <SubItem to="/subcontract/issue" label="Material Issue" icon={FiShare} />}
                    {hasPermission('SUB_RECEIPT') && <SubItem to="/subcontract/receipt" label="Material Receipt" icon={FiRotateCcw} />}
                  </ul>
                )}
              </li>
            )}
          </>
        )}

        {/* Global Bottom Links - Apply general module-level reports/settings permissions if needed */}
        {hasPermission(`${activeModule}_REPORTS`) && (
          <li className="sidebar-menu-item" style={{ marginTop: "auto" }}>
            <NavLink to={`/${activeModule.toLowerCase()}/reports`} onClick={(e) => handleNavClick(`/${activeModule.toLowerCase()}/reports`, e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
              <FiPieChart /> {!collapsed && <span>Reports</span>}
            </NavLink>
          </li>
        )}
        {hasPermission(`${activeModule}_SETTINGS`) && (
          <li className="sidebar-menu-item">
            <NavLink to={`/${activeModule.toLowerCase()}/settings`} onClick={(e) => handleNavClick(`/${activeModule.toLowerCase()}/settings`, e)} className={({ isActive }) => `sidebar-menu-link ${isActive ? "sidebar-active" : ""}`}>
              <FiSettings /> {!collapsed && <span>Settings</span>}
            </NavLink>
          </li>
        )}
        <li className="sidebar-menu-item">
          <div className="sidebar-menu-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <FiLogOut /> {!collapsed && <span>Logout</span>}
          </div>
        </li>
      </ul>

      {/* Navigation Guard Confirm Dialog */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: '28px 32px',
            minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
          }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>⚠️ Unsaved Changes</p>
            <p style={{ color: '#555', marginBottom: 20, fontSize: 14 }}>
              You have unsaved changes. Are you sure you want to leave without saving?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={cancelLeave}
                style={{ padding: '7px 18px', borderRadius: 5, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', fontWeight: 600 }}
              >
                Stay
              </button>
              <button
                onClick={confirmLeave}
                style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#d32f2f', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
