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
  FiBarChart,
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
  FiCreditCard,
  FiBriefcase,
  FiCircle,
  FiShuffle,
  FiFilePlus,
  FiPlusCircle,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiShoppingBag,
  FiBookOpen,
  FiUser,
  FiTag,
  FiStar,
  FiFileText,
  FiShare,
  FiRotateCcw,
  FiArrowDown,
  FiArrowUp,
  FiList,
  FiDownload,
  FiTarget,
  FiAlertTriangle
} from "react-icons/fi";

import "./Sidebar.css";

// Child routes per submenu — used to highlight the parent menu item
// when one of its children is the active route.
const SUBMENUS = {
  accInv: ["/invoice/sales", "/invoice/purchase", "/invoice/debit-note", "/invoice/credit-note"],
  accVouch: ["/accounts/payment", "/accounts/receipt", "/accounts/journal", "/accounts/contra"],
  hrMaster: ["/employees", "/shift-master", "/holidays", "/leaves-master", "/profile-requests", "/training", "/pms", "/disciplinary", "/exit-settlement"],
  hrAtt: ["/hr-attendance", "/attendance-mod", "/shiftschedule", "/muster-roll", "/ot-approval", "/attendance-collector"],
  hrPayroll: ["/advance", "/payroll", "/esileave", "/tax"],
  hrTrans: ["/leave", "/onduty", "/tour", "/shiftchange", "/woffchange"],
  hrRecruit: ["/recruitment"],
  hrReports: ["/hr/reports", "/pf-accounting"],
  storeMaster: ["/stores/item-master", "/stores/uom", "/stores/item-groups", "/stores/item-types"],
  storeReports: ["/stores/reports", "/inventory/ledger", "/stores/stock-statement", "/stores/day-wise-stock", "/stores/stock-audit"],
  storeDc: ["/stores/delivery-challans", "/stores/non-returnable-gate-passes"],
  storeInward: ["/stores/inward-registers", "/stores/grr"],
  storeIssues: ["/stores/material-issues"],
  storeTrans: ["/stores/material-requisitions", "/stores/material-returns"],
  storeBilling: ["/stores/invoices", "/stores/sale-approval", "/stores/repair-billing", "/stores/maintenance-billing", "/stores/misc-voucher-billing"],
  purPR: ["/purchase/requisitions"],
  purProc: ["/purchase/rfq", "/purchase/orders"],
  purVend: ["/purchase/vendors", "/purchase/prices", "/purchase/rating"],
  prodFloor: ["/production/daily-entry", "/production/machines", "/production/downtime"],
  planProd: ["/planning/schedule", "/planning/mrp", "/planning/capacity"],
  engData: ["/engineering/products", "/engineering/categories", "/engineering/bom", "/engineering/bom-diff"],
  engProc: ["/engineering/routing", "/engineering/work-centers"],
  markSales: ["/marketing/leads", "/marketing/quotes", "/marketing/orders", "/marketing/customers"],
  qualInsp: ["/quality/incoming", "/quality/process", "/quality/final", "/quality/non-conformances"],
  maintAssets: ["/maintenance/machines", "/maintenance/assets", "/maintenance/schedule"],
  subOps: ["/subcontract/orders", "/subcontract/issue", "/subcontract/receipt"],
};

const Sidebar = () => {
  const location = useLocation();
  const { isDirty, setIsDirty } = useNavigationGuard();
  const [pendingPath, setPendingPath] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(() => {
    return localStorage.getItem('sidebarSubmenu') || "";
  });
  const [openChild, setOpenChild] = useState("");
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const path = location.pathname;

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarSubmenu', openSubmenu);
  }, [openSubmenu]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  // Auto-open the submenu that contains the active route (e.g. on direct
  // URL load or after navigating via a child link).
  useEffect(() => {
    const active = Object.keys(SUBMENUS).find((k) => isSubmenuActive(k));
    setOpenSubmenu((prev) => (prev === active ? prev : active || ""));
    const base = path.split("?")[0];
    const inPur = base.startsWith("/purchase/requisitions");
    const invControlPaths = ["/inventory/ledger", "/stores/stock-statement", "/stores/day-wise-stock", "/stores/stock-audit"];
    const inInvControl = invControlPaths.some((p) => base === p || base.startsWith(p + "/"));
    if (inPur && (base === "/purchase/requisitions/add" || location.search.includes("status=Draft"))) {
      setOpenChild("prDraft");
    } else if (inInvControl) {
      setOpenChild("invControl");
    } else {
      setOpenChild("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, location.search]);

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

  const confirmLogout = () => setLogoutConfirmOpen(true);
  const cancelLogout = () => setLogoutConfirmOpen(false);

  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (permission) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(permission);
  };

  const isActive = (to, exact = false) => {
    const [targetPath, targetSearch] = to.includes("?") ? to.split("?") : [to, undefined];
    const currentPath = path;
    const currentSearch = location.search || "";

    if (exact) {
      if (targetSearch !== undefined) return currentPath === targetPath && currentSearch === "?" + targetSearch;
      return currentPath === targetPath && !currentSearch;
    }
    const pathMatch = currentPath === targetPath || currentPath.startsWith(targetPath + "/");
    if (targetSearch !== undefined) return pathMatch && currentSearch === "?" + targetSearch;
    return pathMatch && !currentSearch;
  };

  const isSubmenuActive = (key) =>
    (SUBMENUS[key] || []).some((p) => {
      const base = path.split("?")[0];
      return base === p || base.startsWith(p + "/");
    });

  // Match a path ignoring query string (the Delivery Challans list uses ?type=).
  const dcActive = (p) => {
    const base = path.split("?")[0];
    return base === p || base.startsWith(p + "/");
  };

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

  // Single source of truth for active highlighting. Determined from the
  // current location (not NavLink's internal callback) so it is reliable
  // even when navigation is performed manually via handleNavClick.
  const SideNavLink = ({ to, label, icon: Icon = FiCircle, exact = false }) => (
    <NavLink
      to={to}
      onClick={(e) => handleNavClick(to, e)}
      className={`sidebar-menu-link ${isActive(to, exact) ? "sidebar-active" : ""}`}
    >
      {Icon && <Icon size={collapsed ? 20 : 16} />}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  const SubItem = ({ to, label, icon: Icon = FiCircle, exact = false }) => (
    <li>
      <SideNavLink to={to} label={label} icon={Icon} exact={exact} />
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
                <SideNavLink to="/accounts" label="Dashboard" icon={FiHome} exact />
              </li>
            )}

            {(hasPermission('ACC_INV_SALES') || hasPermission('ACC_INV_PURCH') || hasPermission('ACC_INV_DEBIT') || hasPermission('ACC_INV_CREDIT')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "accInv" ? "open" : ""} ${isSubmenuActive("accInv") ? "sidebar-active-parent" : ""}`}>
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
              <li className={`sidebar-menu-item ${openSubmenu === "accVouch" ? "open" : ""} ${isSubmenuActive("accVouch") ? "sidebar-active-parent" : ""}`}>
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

            {/* Masters */}
            <li className="sidebar-menu-item">
              <SideNavLink to="/accounts/coa" label="Chart of Accounts" icon={FiBookOpen} />
            </li>
            <li className="sidebar-menu-item">
              <SideNavLink to="/accounts/budgets" label="Budget" icon={FiTarget} />
            </li>

            {/* Reports */}
            {(hasPermission('ACC_REP_LEDGER') || hasPermission('ACC_REP_DAYBOOK') || hasPermission('ACC_REP_TB') || hasPermission('ACC_REP_PL') || hasPermission('ACC_REP_BS')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "accReports" ? "open" : ""} ${isSubmenuActive("accReports") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("accReports")}>
                  <FiFileText />
                  {!collapsed && (
                    <>
                      <span>Reports</span>
                      <span className="expand-icon">{openSubmenu === "accReports" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "accReports" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('ACC_REP_LEDGER') && <SubItem to="/reports/ledger" label="General Ledger" icon={FiFileText} />}
                    {hasPermission('ACC_REP_DAYBOOK') && <SubItem to="/reports/daybook" label="Day Book" icon={FiFileText} />}
                    {hasPermission('ACC_REP_TB') && <SubItem to="/reports/trial-balance" label="Trial Balance" icon={FiBarChart} />}
                    {hasPermission('ACC_REP_PL') && <SubItem to="/reports/pl" label="P&L Statement" icon={FiTrendingUp} />}
                    {hasPermission('ACC_REP_BS') && <SubItem to="/reports/balance-sheet" label="Balance Sheet" icon={FiPieChart} />}
                    {hasPermission('ACC_REP_AP') && <SubItem to="/reports/ap" label="Accounts Payable" icon={FiFileText} />}
                    {hasPermission('ACC_REP_AR') && <SubItem to="/reports/ar" label="Accounts Receivable" icon={FiFileText} />}
                  </ul>
                )}
              </li>
            )}

            <li className="sidebar-menu-item">
              <SideNavLink to="/accounts/settings" label="Settings" icon={FiSettings} />
            </li>
          </>
        )}

        {/* --- HR MODULE --- */}
        {activeModule === "HR" && (
          <>
            {hasPermission('HR_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/hr" label="HR Dashboard" icon={FiUsers} exact />
              </li>
            )}

            {(hasPermission('HR_EMP_MASTER') || hasPermission('HR_SHIFT_MASTER') || hasPermission('HR_HOLIDAY_MASTER') || hasPermission('HR_LEAVE_MASTER')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrMaster" ? "open" : ""} ${isSubmenuActive("hrMaster") ? "sidebar-active-parent" : ""}`}>
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
                    <SubItem to="/training" label="Training & Skills" icon={FiBookOpen} />
                    <SubItem to="/pms" label="PMS & Appraisals" icon={FiTarget} />
                    <SubItem to="/disciplinary" label="Disciplinary Mgmt" icon={FiAlertTriangle} />
                    <SubItem to="/exit-settlement" label="Exit & Settlement" icon={FiLogOut} />
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('HR_ATT_ENTRY') || hasPermission('HR_ATT_MOD') || hasPermission('HR_SHIFT_SCHED') || hasPermission('HR_MUSTER') || hasPermission('HR_OT_APP')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrAtt" ? "open" : ""} ${isSubmenuActive("hrAtt") ? "sidebar-active-parent" : ""}`}>
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
                    <SubItem to="/attendance-collector" label="Attendance Collector" icon={FiCamera} />
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('HR_ADVANCE') || hasPermission('HR_PAYROLL_PROC') || hasPermission('HR_ESI_LEAVE')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrPayroll" ? "open" : ""} ${isSubmenuActive("hrPayroll") ? "sidebar-active-parent" : ""}`}>
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
                    {hasPermission('HR_TAX') && <SubItem to="/tax" label="Employee Tax" icon={FiDollarSign} />}
                  </ul>
                )}
              </li>
            )}

            {(hasPermission('HR_LEAVE_APP') || hasPermission('HR_ONDUTY') || hasPermission('HR_TOUR') || hasPermission('HR_SHIFT_CHG') || hasPermission('HR_WOFF_CHG')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "hrTrans" ? "open" : ""} ${isSubmenuActive("hrTrans") ? "sidebar-active-parent" : ""}`}>
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

            <li className={`sidebar-menu-item ${openSubmenu === "hrRecruit" ? "open" : ""} ${isSubmenuActive("hrRecruit") ? "sidebar-active-parent" : ""}`}>
              <div className="sidebar-menu-link" onClick={() => toggleSubmenu("hrRecruit")}>
                <FiUsers />
                {!collapsed && (
                  <>
                    <span>Recruitment</span>
                    <span className="expand-icon">{openSubmenu === "hrRecruit" ? <FiChevronDown /> : <FiChevronRight />}</span>
                  </>
                )}
              </div>
              {openSubmenu === "hrRecruit" && (
                <ul className="sidebar-submenu">
                  <SubItem to="/recruitment" label="Recruitment Dashboard" icon={FiGrid} />
                </ul>
              )}
            </li>

            <li className="sidebar-menu-item">
              <SideNavLink to="/hr/reports" label="Reports" icon={FiPieChart} exact />
            </li>
            <li className="sidebar-menu-item">
              <SideNavLink to="/pf-accounting" label="PF Accounting" icon={FiFileText} />
            </li>
          </>
        )}

        {/* --- STORES MODULE --- */}
        {activeModule === "STORES" && (
          <>
            {hasPermission('STORES_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/stores" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {hasPermission('STORES_ITEM_MASTER') && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeMaster" ? "open" : ""} ${isSubmenuActive("storeMaster") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeMaster")}>
                  <FiGrid />
                  {!collapsed && (
                    <>
                      <span>Master Data</span>
                      <span className="expand-icon">{openSubmenu === "storeMaster" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeMaster" && (
                  <ul className="sidebar-submenu">
                    <SubItem to="/stores/item-master" label="Item Master" icon={FiBox} />
                    <SubItem to="/stores/uom" label="UOM Master" icon={FiTag} />
                    <SubItem to="/stores/item-groups" label="Item Group Master" icon={FiLayers} />
                    <SubItem to="/stores/item-types" label="Item Type Master" icon={FiStar} />
                    {hasPermission('STORES_WAREHOUSE') && <SubItem to="/stores/warehouses" label="Warehouse Master" icon={FiMapPin} />}
                    {hasPermission('STORES_BATCH') && <SubItem to="/stores/batches" label="Batch Master" icon={FiLayers} />}
                  </ul>
                )}
              </li>
            )}
            {(hasPermission('STORES_MR') || hasPermission('STORES_RETURN')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeTrans" ? "open" : ""} ${isSubmenuActive("storeTrans") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeTrans")}>
                  <FiShuffle />
                  {!collapsed && (
                    <>
                      <span>Transactions</span>
                      <span className="expand-icon">{openSubmenu === "storeTrans" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeTrans" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('STORES_MR') && <SubItem to="/stores/material-requisitions" label="Material Requisition" icon={FiFilePlus} />}
                    {hasPermission('STORES_RETURN') && <SubItem to="/stores/material-returns" label="Material Return" icon={FiRotateCcw} />}
                  </ul>
                )}
              </li>
            )}
            {hasPermission('STORES_ISSUE') && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeDc" ? "open" : ""} ${isSubmenuActive("storeDc") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeDc")}>
                  <FiTruck />
                  {!collapsed && (
                    <>
                      <span>Delivery Challans</span>
                      <span className="expand-icon">{openSubmenu === "storeDc" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeDc" && (
                  <ul className="sidebar-submenu">
                    <li>
                      <NavLink to="/stores/delivery-challans" onClick={(e) => handleNavClick("/stores/delivery-challans", e)}
                        className={`sidebar-menu-link ${dcActive("/stores/delivery-challans") ? "sidebar-active" : ""}`}>
                        <FiRotateCcw size={collapsed ? 20 : 16} />{!collapsed && <span>Returnable</span>}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/stores/non-returnable-gate-passes" onClick={(e) => handleNavClick("/stores/non-returnable-gate-passes", e)}
                        className={`sidebar-menu-link ${dcActive("/stores/non-returnable-gate-passes") ? "sidebar-active" : ""}`}>
                        <FiBox size={collapsed ? 20 : 16} />{!collapsed && <span>Non Returnable</span>}
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>
            )}
            {hasPermission('STORES_ISSUE') && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeInward" ? "open" : ""} ${isSubmenuActive("storeInward") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link">
                  <NavLink
                    to="/stores/inward-registers"
                    onClick={(e) => handleNavClick("/stores/inward-registers", e)}
                    className={`sidebar-parent-nav ${isActive("/stores/inward-registers", true) ? "sidebar-active" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}
                  >
                    <FiClipboard size={collapsed ? 20 : 16} />
                    {!collapsed && <span>Inward Register</span>}
                  </NavLink>
                  {!collapsed && (
                    <span className="expand-icon" onClick={(e) => { e.stopPropagation(); toggleSubmenu("storeInward"); }}>{openSubmenu === "storeInward" ? <FiChevronDown /> : <FiChevronRight />}</span>
                  )}
                </div>
                {openSubmenu === "storeInward" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('STORES_GRN') && <SubItem to="/stores/grr" label="GRR" icon={FiFileText} />}
                  </ul>
                )}
              </li>
            )}
            {hasPermission('STORES_ISSUE') && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeIssues" ? "open" : ""} ${isSubmenuActive("storeIssues") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeIssues")}>
                  <FiShare />
                  {!collapsed && (
                    <>
                      <span>Issues</span>
                      <span className="expand-icon">{openSubmenu === "storeIssues" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeIssues" && (
                  <ul className="sidebar-submenu">
                    <SubItem to="/stores/material-issues?type=GRR" label="GRR Issue" icon={FiArrowDown} />
                    <SubItem to="/stores/material-issues?type=PR" label="PR Issue" icon={FiFilePlus} />
                    <SubItem to="/stores/material-issues" label="General Issue" icon={FiShare} />
                  </ul>
                )}
              </li>
            )}
            {hasPermission('STORES_ISSUE') && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeBilling" ? "open" : ""} ${isSubmenuActive("storeBilling") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link" onClick={() => toggleSubmenu("storeBilling")}>
                  <FiCreditCard />
                  {!collapsed && (
                    <>
                      <span>Billing</span>
                      <span className="expand-icon">{openSubmenu === "storeBilling" ? <FiChevronDown /> : <FiChevronRight />}</span>
                    </>
                  )}
                </div>
                {openSubmenu === "storeBilling" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('STORES_ISSUE') && <SubItem to="/stores/invoices" label="GRR Billing" icon={FiCreditCard} />}
                    {hasPermission('STORES_ISSUE') && <SubItem to="/stores/repair-billing" label="Repair Billing" icon={FiTool} />}
                    {hasPermission('STORES_ISSUE') && <SubItem to="/stores/maintenance-billing" label="Maintenance Billing" icon={FiSettings} />}
                    {hasPermission('STORES_ISSUE') && <SubItem to="/stores/sale-approval" label="Jobwork Billing" icon={FiShoppingBag} />}
                    {hasPermission('STORES_ISSUE') && <SubItem to="/stores/misc-voucher-billing" label="Miscellaneous / Voucher" icon={FiDollarSign} />}
                  </ul>
                )}
              </li>
            )}
            {hasPermission('STORES_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/stores/approvals" label="Approvals" icon={FiCheckSquare} exact />
              </li>
            )}
            {hasPermission('STORES_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/stores/cancellations" label="Cancellations" icon={FiXCircle} exact />
              </li>
            )}
            {(hasPermission('STORES_REPORTS') || hasPermission('STORES_STOCK_LEDGER') || hasPermission('STORES_PHYSICAL')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "storeReports" ? "open" : ""} ${isSubmenuActive("storeReports") ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link">
                  <NavLink
                    to="/stores/reports"
                    onClick={(e) => handleNavClick("/stores/reports", e)}
                    className={`sidebar-parent-nav ${isActive("/stores/reports", true) ? "sidebar-active" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}
                  >
                    <FiPieChart size={collapsed ? 20 : 16} />
                    {!collapsed && <span>Reports</span>}
                  </NavLink>
                  {!collapsed && (
                    <span className="expand-icon" onClick={(e) => { e.stopPropagation(); toggleSubmenu("storeReports"); }}>{openSubmenu === "storeReports" ? <FiChevronDown /> : <FiChevronRight />}</span>
                  )}
                </div>
                {openSubmenu === "storeReports" && (
                  <ul className="sidebar-submenu">
                    <li className={`sidebar-menu-item ${openChild === "invControl" ? "open" : ""}`}>
                      <NavLink
                        to="#"
                        onClick={(e) => { e.preventDefault(); setOpenChild(openChild === "invControl" ? "" : "invControl"); }}
                        className="sidebar-menu-link"
                        style={{ justifyContent: "space-between", textDecoration: "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FiBox size={collapsed ? 20 : 16} />
                          {!collapsed && <span>Inventory Control</span>}
                        </div>
                        {!collapsed && (
                          <span className="expand-icon" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            {openChild === "invControl" ? <FiChevronDown /> : <FiChevronRight />}
                          </span>
                        )}
                      </NavLink>
                      {openChild === "invControl" && (
                        <ul className="sidebar-submenu">
                          {hasPermission('STORES_STOCK_LEDGER') && <SubItem to="/inventory/ledger" label="Stock Ledger" icon={FiClipboard} />}
                          {hasPermission('STORES_STOCK_LEDGER') && <SubItem to="/stores/stock-statement" label="Stock Statement" icon={FiFileText} />}
                          {hasPermission('STORES_STOCK_LEDGER') && <SubItem to="/stores/day-wise-stock" label="Day-wise Stock" icon={FiCalendar} />}
                          {hasPermission('STORES_PHYSICAL') && <SubItem to="/stores/stock-audit" label="Physical Verification" icon={FiCheckSquare} />}
                        </ul>
                      )}
                    </li>
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
                <SideNavLink to="/purchase" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('PUR_PR_NEW') || hasPermission('PUR_PR_AUTH') || hasPermission('PUR_PR_SANCTION') || hasPermission('PUR_PR_STATUS') || hasPermission('PUR_LOI') || hasPermission('PUR_PR_SHORTCLOSE')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "purPR" ? "open" : ""} ${isActive("/purchase/requisitions", true) ? "sidebar-active-parent" : ""}`}>
                <div className="sidebar-menu-link">
                  <NavLink
                    to="/purchase/requisitions"
                    onClick={(e) => handleNavClick("/purchase/requisitions", e)}
                    className={`sidebar-parent-nav ${isActive("/purchase/requisitions", true) ? "sidebar-active" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}
                  >
                    <FiFilePlus />
                    {!collapsed && <span>Purchase Requisition</span>}
                  </NavLink>
                  <span className="expand-icon" onClick={(e) => { e.stopPropagation(); toggleSubmenu("purPR"); }}>{openSubmenu === "purPR" ? <FiChevronDown /> : <FiChevronRight />}</span>
                </div>
                {openSubmenu === "purPR" && (
                  <ul className="sidebar-submenu">
                    {hasPermission('PUR_PR_NEW') && (
                      <li className={`sidebar-menu-item ${openChild === "prDraft" ? "open" : ""}`}>
                        <NavLink
                          to="/purchase/requisitions?status=Draft"
                          onClick={(e) => handleNavClick("/purchase/requisitions?status=Draft", e)}
                          className={`sidebar-menu-link ${isActive("/purchase/requisitions?status=Draft") ? "sidebar-active" : ""}`}
                          style={{ justifyContent: "space-between", textDecoration: "none" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FiPlusCircle size={collapsed ? 20 : 16} />
                            {!collapsed && <span>Draft PRs</span>}
                          </div>
                          {!collapsed && (
                            <span
                              className="expand-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setOpenChild(openChild === "prDraft" ? "" : "prDraft");
                              }}
                              style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                            >
                              {openChild === "prDraft" ? <FiChevronDown /> : <FiChevronRight />}
                            </span>
                          )}
                        </NavLink>
                        {openChild === "prDraft" && (
                          <ul className="sidebar-submenu">
                            <SubItem to="/purchase/requisitions/add" label="New PR" icon={FiFilePlus} />
                          </ul>
                        )}
                      </li>
                    )}
                    {hasPermission('PUR_PR_AUTH') && <SubItem to="/purchase/requisitions?status=Pending" label="PR Authorization" icon={FiCheckSquare} />}
                    {hasPermission('PUR_PR_SANCTION') && <SubItem to="/purchase/requisitions/sanction" label="PR Sanction" icon={FiCheckCircle} />}
                    {hasPermission('PUR_LOI') && <SubItem to="/purchase/requisitions?type=loi" label="Letter Of Indent" icon={FiFileText} />}
                    {hasPermission('PUR_PR_SHORTCLOSE') && <SubItem to="/purchase/requisitions?status=Closed" label="PR Shortclose" icon={FiXCircle} />}
                    {hasPermission('PUR_REQ') && <SubItem to="/purchase/pr-amendment" label="PR Amendment" icon={FiClipboard} />}

                  </ul>
                )}
              </li>
            )}
            {(hasPermission('PUR_REQ') || hasPermission('PUR_RFQ') || hasPermission('PUR_ORDERS') || hasPermission('PUR_GRN')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "purProc" ? "open" : ""} ${isSubmenuActive("purProc") ? "sidebar-active-parent" : ""}`}>
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
                    {hasPermission('PUR_RFQ') && <SubItem to="/purchase/rfq" label="Enquiry / RFQ" icon={FiMail} />}
                    {hasPermission('PUR_ORDERS') && <SubItem to="/purchase/job-orders" label="Job Order" icon={FiBriefcase} />}
                    {hasPermission('PUR_ORDERS') && <SubItem to="/purchase/orders" label="Purchase Orders" icon={FiShoppingBag} />}
                  </ul>
                )}
              </li>
            )}
            {hasPermission('PUR_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/purchase/approvals" label="Approvals" icon={FiCheckSquare} exact />
              </li>
            )}
            {hasPermission('PUR_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/purchase/daily-reports" label="Daily Reports" icon={FiCalendar} exact />
              </li>
            )}
          </>
        )}

        {/* --- PRODUCTION MODULE --- */}
        {activeModule === "PRODUCTION" && (
          <>
            {hasPermission('PROD_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/production" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {hasPermission('PROD_ORDERS') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/production/orders" label="Production Orders" icon={FiLayers} />
              </li>
            )}
            {(hasPermission('PROD_DAILY') || hasPermission('PROD_MACHINES') || hasPermission('PROD_DOWNTIME')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "prodFloor" ? "open" : ""} ${isSubmenuActive("prodFloor") ? "sidebar-active-parent" : ""}`}>
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
                <SideNavLink to="/planning" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('PLAN_SCHEDULE') || hasPermission('PLAN_MRP') || hasPermission('PLAN_CAPACITY')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "planProd" ? "open" : ""} ${isSubmenuActive("planProd") ? "sidebar-active-parent" : ""}`}>
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
                <SideNavLink to="/engineering" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('ENG_ITEMS') || hasPermission('ENG_BOM') || hasPermission('ENG_BOM_DIFF')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "engData" ? "open" : ""} ${isSubmenuActive("engData") ? "sidebar-active-parent" : ""}`}>
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
                    <SubItem to="/engineering/products" label="Product Master" icon={FiStar} />
                    {hasPermission('ENG_ITEMS') && <SubItem to="/engineering/categories" label="Category Master" icon={FiGrid} />}
                    {hasPermission('ENG_BOM') && <SubItem to="/engineering/bom" label="Bill of Materials" icon={FiLayers} />}
                    {hasPermission('ENG_BOM_DIFF') && <SubItem to="/engineering/bom-diff" label="BOM Comparison" icon={FiShuffle} />}
                  </ul>
                )}
              </li>
            )}
            {(hasPermission('ENG_ROUTING') || hasPermission('ENG_WORK_CENTERS')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "engProc" ? "open" : ""} ${isSubmenuActive("engProc") ? "sidebar-active-parent" : ""}`}>
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
                <SideNavLink to="/marketing" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('MARK_LEADS') || hasPermission('MARK_QUOTES') || hasPermission('MARK_ORDERS') || hasPermission('MARK_CUSTOMERS')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "markSales" ? "open" : ""} ${isSubmenuActive("markSales") ? "sidebar-active-parent" : ""}`}>
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
                <SideNavLink to="/quality" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('QUAL_INCOMING') || hasPermission('QUAL_PROCESS') || hasPermission('QUAL_FINAL')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "qualInsp" ? "open" : ""} ${isSubmenuActive("qualInsp") ? "sidebar-active-parent" : ""}`}>
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
            {(hasPermission('QUAL_REPORTS')) && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/quality/non-conformances" label="Non-Conformance" icon={FiAlertTriangle} exact />
              </li>
            )}
          </>
        )}

        {/* --- MAINTENANCE MODULE --- */}
        {activeModule === "MAINTENANCE" && (
          <>
            {hasPermission('MAINT_DASHBOARD') && (
              <li className="sidebar-menu-item">
                <SideNavLink to="/maintenance" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('MAINT_MACHINES') || hasPermission('MAINT_ASSETS') || hasPermission('MAINT_SCHEDULE')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "maintAssets" ? "open" : ""} ${isSubmenuActive("maintAssets") ? "sidebar-active-parent" : ""}`}>
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
                <SideNavLink to="/subcontract" label="Dashboard" icon={FiHome} exact />
              </li>
            )}
            {(hasPermission('SUB_ORDERS') || hasPermission('SUB_ISSUE') || hasPermission('SUB_RECEIPT')) && (
              <li className={`sidebar-menu-item ${openSubmenu === "subOps" ? "open" : ""} ${isSubmenuActive("subOps") ? "sidebar-active-parent" : ""}`}>
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
        {activeModule !== "HR" && activeModule !== "STORES" && hasPermission(`${activeModule}_REPORTS`) && (
          <li className="sidebar-menu-item" style={{ marginTop: "auto" }}>
            <SideNavLink to={`/${activeModule.toLowerCase()}/reports`} label="Reports" icon={FiPieChart} exact />
          </li>
        )}
        {hasPermission(`${activeModule}_SETTINGS`) && (
          <li className="sidebar-menu-item">
            <SideNavLink to={`/${activeModule.toLowerCase()}/settings`} label="Settings" icon={FiSettings} exact />
          </li>
        )}
        <li className="sidebar-menu-item">
          <div className="sidebar-menu-link" onClick={confirmLogout} style={{ cursor: 'pointer' }}>
            <FiLogOut /> {!collapsed && <span>Logout</span>}
          </div>
        </li>
      </ul>

      {/* Logout Confirm Dialog */}
      {logoutConfirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--dropdown-bg)', borderRadius: 10, padding: '28px 32px',
            minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
          }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--dropdown-text)' }}>Logout</p>
            <p style={{ color: 'var(--dropdown-text)', opacity: 0.6, marginBottom: 20, fontSize: 14 }}>
              Are you sure you want to logout?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={cancelLogout}
                style={{ padding: '7px 18px', borderRadius: 5, border: '1px solid var(--dropdown-border)', background: 'var(--dropdown-hover-bg)', cursor: 'pointer', fontWeight: 600, color: 'var(--dropdown-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setLogoutConfirmOpen(false); handleLogout(); }}
                style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#d32f2f', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Guard Confirm Dialog */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--dropdown-bg)', borderRadius: 10, padding: '28px 32px',
            minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
          }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--dropdown-text)' }}>⚠️ Unsaved Changes</p>
            <p style={{ color: 'var(--dropdown-text)', opacity: 0.6, marginBottom: 20, fontSize: 14 }}>
              You have unsaved changes. Are you sure you want to leave without saving?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={cancelLeave}
                style={{ padding: '7px 18px', borderRadius: 5, border: '1px solid var(--dropdown-border)', background: 'var(--dropdown-hover-bg)', cursor: 'pointer', fontWeight: 600, color: 'var(--dropdown-text)' }}
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
