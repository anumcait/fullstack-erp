import { useEffect, useState, useRef } from 'react';
import {
  FaHome, FaChevronDown, FaBars, FaTimes, FaShieldAlt, FaBell
} from 'react-icons/fa';
import { FiSettings, FiUser, FiShield, FiBell, FiCheckCircle, FiInbox } from 'react-icons/fi';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Avatar, IconButton } from '@mui/material';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';
import './Header.css';
import logo from "../../assets/images/EQIC_Image.jpg";

const API = import.meta.env.VITE_API_URL || "";

const Header = () => {
  const { mode, toggleTheme, accent, setAccentColor, ACCENT_COLORS } = useThemeMode();
  const [userName, setUserName] = useState('Guest');
  const [userRole, setUserRole] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const settingsRef = useRef(null);
  const notifRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('empName') || 'Guest';
    const role = localStorage.getItem('userRole') || '';
    setUserName(name);
    setUserRole(role);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
    });
    setCurrentDate(formattedDate);

    const fetchUserPhoto = async () => {
      const empId = localStorage.getItem('empId');
      if (!empId) return;
      try {
        const res = await axios.get(`${API}/api/employees/${empId}/photo`, { withCredentials: true });
        if (res.data?.photo) {
          setUserPhoto(`data:${res.data.mimeType || 'image/jpeg'};base64,${res.data.photo}`);
        }
      } catch (err) {
        console.error('Error fetching user photo:', err);
      }
    };
    const fetchNotifications = async () => {
      const empId = localStorage.getItem('empId');
      if (!empId) return;
      try {
        const res = await axios.get(`${API}/api/notifications`, {
          params: { empid: empId },
          withCredentials: true
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchUserPhoto();
    fetchNotifications();

    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsNotifOpen(false);
  };

  const toggleNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    setIsSettingsOpen(false);
  };

  const markAsRead = async (id) => {
    // Always update UI immediately
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // For virtual notifications, no API call needed
    if (String(id).startsWith('virt-')) return;
    try {
      await axios.put(`${API}/api/notifications/${id}/read`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const empId = localStorage.getItem('empId');
    try {
      await axios.post(`${API}/api/notifications/read-all`, { empid: empId }, { withCredentials: true });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  const hasPermission = (perm) => {
    if (userRole === 'ADMIN') return true;
    return userPermissions.includes(perm);
  };

  const navItems = [
    {
      label: 'HR',
      path: '/dashboard',
      permission: 'MOD_HR',
      isMega: true,
      columns: [
        {
          title: 'Master Data',
          items: [
            { label: 'Employee Master', path: '/employees' },
            { label: 'Add New Employee', path: '/add-employee' },
            { label: 'Photo Upload', path: '/photo' },
            { label: 'Profile Requests', path: '/profile-requests', permission: 'HR_PROFILE_APPROVE' },
            { label: 'Shift Master', path: '/shift-master' },
            { label: 'Holiday Master', path: '/holidays' },
            { label: 'Leaves Master', path: '/leaves-master' }
          ]
        },
        {
          title: 'Attendance',
          items: [
            { label: 'HR Attendance', path: '/hr-attendance' },
            { label: 'Correction', path: '/attendance-mod' },
            { label: 'Shift Schedule', path: '/shiftschedule' },
            { label: 'Muster Roll', path: '/muster-roll' },
            { label: 'OT Approval', path: '/ot-approval' }
          ]
        },
        {
          title: 'Payroll',
          items: [
            { label: 'Salary Advances', path: '/advance' },
            { label: 'Monthly Payroll', path: '/payroll' },
            { label: 'ESI Leaves', path: '/esileave' }
          ]
        },
        {
          title: 'Transactions',
          items: [
            { label: 'Leave Applications', path: '/leave' },
            { label: 'On-Duty Requests', path: '/onduty' },
            { label: 'Tour Applications', path: '/tour' },
            { label: 'Shift Change', path: '/shiftchange' },
            { label: 'W-Off Change', path: '/woffchange' }
          ]
        }
      ]
    },
    {
      label: 'ACCOUNTS',
      path: '/accounts',
      permission: 'MOD_ACCOUNTS',
      isMega: true,
      columns: [
        {
          title: 'Invoicing',
          items: [
            { label: 'Sales Invoice', path: '/invoice/sales' },
            { label: 'Purchase Invoice', path: '/invoice/purchase' },
            { label: 'Debit Note', path: '/invoice/debit-note' },
            { label: 'Credit Note', path: '/invoice/credit-note' }
          ]
        },
        {
          title: 'Vouchers',
          items: [
            { label: 'Payment Voucher', path: '/accounts/payment' },
            { label: 'Receipt Voucher', path: '/accounts/receipt' },
            { label: 'Journal Voucher', path: '/accounts/journal' },
            { label: 'Contra Entry', path: '/accounts/contra' }
          ]
        },
        {
          title: 'Financial Reports',
          items: [
            { label: 'General Ledger', path: '/reports/ledger' },
            { label: 'Day Book', path: '/reports/daybook' },
            { label: 'Trial Balance', path: '/reports/trial-balance' },
            { label: 'Profit & Loss', path: '/reports/pl' },
            { label: 'Balance Sheet', path: '/reports/balance-sheet' }
          ]
        }
      ]
    },
    {
      label: 'MARKETING',
      path: '/marketing',
      permission: 'MOD_MARKETING',
      isMega: true,
      columns: [
        {
          title: 'Sales & CRM',
          items: [
            { label: 'Leads / Enquiries', path: '/marketing/leads' },
            { label: 'Quotations', path: '/marketing/quotes' },
            { label: 'Sales Orders', path: '/marketing/orders' },
            { label: 'Customer Master', path: '/marketing/customers' }
          ]
        },
        {
          title: 'Reports',
          items: [
            { label: 'Sales Dashboard', path: '/marketing/dashboard' },
            { label: 'Order Register', path: '/marketing/register' },
            { label: 'Pending Orders', path: '/marketing/pending' }
          ]
        }
      ]
    },
    {
      label: 'PLANNING',
      path: '/planning',
      permission: 'MOD_PLANNING',
      isMega: true,
      columns: [
        {
          title: 'Production Planning',
          items: [
            { label: 'Master Schedule (MPS)', path: '/planning/mps' },
            { label: 'Material Requirement (MRP)', path: '/planning/mrp' },
            { label: 'Capacity Planning', path: '/planning/capacity' }
          ]
        }
      ]
    },
    {
      label: 'ENGINEERING',
      path: '/engineering',
      permission: 'MOD_ENGINEERING',
      isMega: true,
      columns: [
        {
          title: 'Design Data',
          items: [
            { label: 'Product Master', path: '/engineering/products' },
            { label: 'Category Master', path: '/engineering/categories' },
            { label: 'Bill of Materials (BOM)', path: '/engineering/bom' },
            { label: 'BOM Comparison', path: '/engineering/bom-diff' }
          ]
        },
        {
          title: 'Process Planning',
          items: [
            { label: 'Routing Master', path: '/engineering/routing' },
            { label: 'Work Center Master', path: '/engineering/work-centers' },
            { label: 'Standard Man-Hours', path: '/engineering/smt' }
          ]
        },
        {
          title: 'Documentation',
          items: [
            { label: 'Drawing Management', path: '/engineering/drawings' },
            { label: 'ECN / ECR', path: '/engineering/ecn' }
          ]
        }
      ]
    },
    {
      label: 'PRODUCTION',
      path: '/production',
      permission: 'MOD_PRODUCTION',
      isMega: true,
      columns: [
        {
          title: 'Shop Floor',
          items: [
            { label: 'Daily Production', path: '/production/daily-entry' },
            { label: 'Machine Monitoring', path: '/production/machines' },
            { label: 'Down-Time Entry', path: '/production/downtime' }
          ]
        },
        {
          title: 'Production Reports',
          items: [
            { label: 'Production Summary', path: '/reports/production' },
            { label: 'Yield Reports', path: '/reports/yield' },
            { label: 'Efficiency Report', path: '/reports/efficiency' }
          ]
        }
      ]
    },
    {
      label: 'SUBCONTRACT',
      path: '/subcontract',
      permission: 'MOD_SUBCONTRACT',
      isMega: true,
      columns: [
        {
          title: 'Jobwork Operations',
          items: [
            { label: 'Job Work Orders', path: '/subcontract/orders' },
            { label: 'Material Issue', path: '/subcontract/issue' },
            { label: 'Material Receipt', path: '/subcontract/receipt' }
          ]
        },
        {
          title: 'Finance & Ledger',
          items: [
            { label: 'Sub-con Invoices', path: '/subcontract/invoices' },
            { label: 'Vendor Ledger', path: '/subcontract/ledger' },
            { label: 'Scrap Management', path: '/subcontract/scrap' }
          ]
        }
      ]
    },
    {
      label: 'MAINTENANCE',
      path: '/maintenance',
      permission: 'MOD_MAINTENANCE',
      isMega: true,
      columns: [
        {
          title: 'Assets',
          items: [
            { label: 'Machine Master', path: '/maintenance/machines' },
            { label: 'Asset Register', path: '/maintenance/assets' },
            { label: 'PM Schedule', path: '/maintenance/schedule' }
          ]
        },
        {
          title: 'Operations',
          items: [
            { label: 'Breakdown Log', path: '/maintenance/breakdown' },
            { label: 'Work Orders', path: '/maintenance/work-orders' },
            { label: 'Spare Parts', path: '/maintenance/spares' }
          ]
        },
        {
          title: 'Analysis',
          items: [
            { label: 'History Cards', path: '/maintenance/history' },
            { label: 'MTTR / MTBF', path: '/reports/maintenance' }
          ]
        }
      ]
    },
    {
      label: 'PURCHASE',
      path: '/purchase',
      permission: 'MOD_PURCHASE',
      isMega: true,
      columns: [
        {
          title: 'Procurement',
          items: [
            { label: 'Purchase Requisitions', path: '/purchase/requisitions' },
            { label: 'Enquiry / RFQ', path: '/purchase/rfq' },
            { label: 'Purchase Orders', path: '/purchase/orders' }
          ]
        },
        {
          title: 'Vendor Mgmt',
          items: [
            { label: 'Vendor Master', path: '/purchase/vendors' },
            { label: 'Price List Master', path: '/purchase/prices' },
            { label: 'Vendor Rating', path: '/purchase/rating' }
          ]
        },
        {
          title: 'Purchase Reports',
          items: [
            { label: 'Purchase Register', path: '/purchase/register' },
            { label: 'Pending PO Reports', path: '/purchase/pending' }
          ]
        }
      ]
    },
    {
      label: 'STORES',
      path: '/stores',
      permission: 'MOD_STORES',
      isMega: true,
      columns: [
        {
          title: 'Inventory Control',
          items: [
            { label: 'Item Master', path: '/stores/item-master' },
            { label: 'UOM Master', path: '/stores/uom' },
            { label: 'Item Group Master', path: '/stores/item-groups' },
            { label: 'Item Type Master', path: '/stores/item-types' },
            { label: 'Stock Ledger', path: '/inventory/ledger' },
            { label: 'Physical Verification', path: '/inventory/audit' }
          ]
        },
        {
          title: 'Transactions',
          items: [
            { label: 'Gate Entry', path: '/inventory/gate-entry' },
            { label: 'GRR', path: '/stores/grr' },
            { label: 'Material Issue (SRV)', path: '/inventory/issue' },
            { label: 'Material Return', path: '/inventory/return' }
          ]
        },
        {
          title: 'Reports',
          items: [
            { label: 'Stock Summary', path: '/inventory/summary' },
            { label: 'Re-order Level Alert', path: '/inventory/alerts' },
            { label: 'ABC Analysis', path: '/inventory/abc' }
          ]
        }
      ]
    },
    {
      label: 'QUALITY',
      path: '/quality',
      permission: 'MOD_QUALITY',
      isMega: true,
      columns: [
        {
          title: 'Inspection',
          items: [
            { label: 'Incoming Inspection', path: '/quality/incoming' },
            { label: 'In-Process Inspection', path: '/quality/process' },
            { label: 'Final QC / PDI', path: '/quality/final' }
          ]
        }
      ]
    }
  ];

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <header className="dashboard-header">
      {/* Top Row: Logo & User Actions */}
      <div className="header-top-row">
        <div className="left-bar">
          <button className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <Link to="/dashboard" className="logo-container">
            <img src={logo} alt="Enterprise Logo" className="logo-img" />
          </Link>
        </div>

        <div className="user-section">
          <div className="user-meta desktop-only" style={{ flexDirection: 'row', alignItems: 'center' }}>
            {userPhoto ? (
              <Avatar
                src={userPhoto}
                alt={userName}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary-main)' }}>
                <PersonIcon />
              </Avatar>
            )}
            <div style={{ marginLeft: 8, display: 'flex', flexDirection: 'column' }}>
              <span className="user-name">{userName}</span>
              <span className="date-display">{currentDate}</span>
            </div>
          </div>

          <div className="action-icons">
            {/* Notification Bell */}
            <div className="notif-wrapper" style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={toggleNotif}
                title="Notifications"
                style={{
                  position: 'relative',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: unreadCount > 0 ? '#fbbf24' : '#ffffff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >

                <NotificationsIcon style={{ animation: unreadCount > 0 ? 'bellRing 1s ease infinite' : 'none' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: '800',
                    height: '16px',
                    minWidth: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--header-bg)',
                    padding: '0 3px',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="notif-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="mark-all-btn">Mark all as read</button>
                    )}
                  </div>

                  <div className="notif-list">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                            if (n.link) navigate(n.link);
                            setIsNotifOpen(false);
                          }}
                        >
                          <div className="notif-icon-circle">
                            <FiBell />
                          </div>
                          <div className="notif-content">
                            <p className="notif-title">{n.title}</p>
                            <p className="notif-msg">{n.message}</p>
                            <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">
                        <FiInbox size={32} />
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="settings-wrapper" style={{ position: 'relative' }} ref={settingsRef}>
              <button
                className={`icon-btn ${isSettingsOpen ? 'active' : ''}`}
                onClick={toggleSettings}
                title="User Access & Settings"
              >
                <SecurityIcon />
              </button>

              {isSettingsOpen && (
                <div className="settings-dropdown">
                  <div className="dropdown-header">Quick Settings</div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsSettingsOpen(false)}>
                    <FiUser style={{ marginRight: '10px' }} /> Profile Settings
                  </Link>
                  {userRole === 'ADMIN' && (
                    <Link to="/useraccess" className="dropdown-item admin-item" onClick={() => setIsSettingsOpen(false)}>
                      <SecurityIcon style={{ fontSize: '18px', marginRight: '10px' }} /> User Access Control
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={() => { toggleTheme(); setIsSettingsOpen(false); }} className="dropdown-item" style={{ cursor: 'pointer' }}>
                    {mode === 'light' ? <DarkModeIcon style={{ fontSize: '18px', marginRight: '10px' }} /> : <LightModeIcon style={{ fontSize: '18px', marginRight: '10px' }} />}
                    {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                  <div className="dropdown-item" style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, paddingTop: 8, paddingBottom: 4 }}>
                    ACCENT COLOR
                  </div>
                  <div style={{ display: 'flex', gap: 6, padding: '4px 16px 8px' }}>
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.name}
                        title={c.name}
                        onClick={() => { setAccentColor(c); setIsSettingsOpen(false); }}
                        style={{
                          width: 20, height: 20, borderRadius: '50%', border: accent.primary === c.primary ? '2px solid var(--text-white)' : '2px solid transparent',
                          background: c.primary, cursor: 'pointer', padding: 0, outline: accent.primary === c.primary ? '2px solid ' + c.primary : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogoutIcon style={{ fontSize: '18px', marginRight: '10px' }} /> Logout
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleLogout} title="Logout" className="icon-btn logout-btn desktop-only">
              <LogoutIcon />
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Menu */}
      <div className="header-nav-row desktop-only">
        <nav className="nav-menu">
          {filteredNavItems.map((item, idx) => (
            <div key={idx} className={`nav-item dropdown ${item.isMega ? 'mega' : ''} ${location.pathname === item.path ? 'active' : ''}`}>
              {item.path ? (
                <Link to={item.path} className="nav-link">
                  {item.label} {(item.children || item.columns) && <FaChevronDown className="chevron" />}
                </Link>
              ) : (
                <span className="nav-link">
                  {item.label} <FaChevronDown className="chevron" />
                </span>
              )}

              {/* Mega Menu */}
              {item.isMega && (
                <div className="mega-menu">
                  <div className="mega-container">
                    {item.columns.map((col, colIdx) => (
                      <div key={colIdx} className="mega-column">
                        <h4 className="mega-title">{col.title}</h4>
                        {col.items
                          .filter(mItem => !mItem.permission || hasPermission(mItem.permission))
                          .map((mItem, mIdx) => (
                            <Link key={mIdx} to={mItem.path} className="mega-item">{mItem.label}</Link>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="drawer-header">
              <img src={logo} alt="Logo" style={{ height: '30px' }} />
              <FaTimes onClick={() => setIsMobileMenuOpen(false)} style={{ cursor: 'pointer' }} />
            </div>

            <div className="drawer-content">
              {filteredNavItems.map((item, idx) => (
                <div key={idx} className="drawer-group">
                  <div className="group-title">{item.label}</div>
                  <div className="group-items">
                    {item.children ? (
                      item.children.map((child, cIdx) => (
                        <Link key={cIdx} to={child.path} className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>
                          {child.label}
                        </Link>
                      ))
                    ) : item.isMega ? (
                      item.columns.flatMap(c => c.items).map((mItem, mIdx) => (
                        <Link key={mIdx} to={mItem.path} className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>
                          {mItem.label}
                        </Link>
                      ))
                    ) : (
                      <Link to={item.path} className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>
                        {item.label}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

function DarkModeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  return (
    <IconButton onClick={toggleTheme} title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} sx={{ color: 'white', ml: 1 }}>
      {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}

export default Header;
