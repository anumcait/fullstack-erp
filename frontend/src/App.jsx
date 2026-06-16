import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import DashBoard from "./Component/HR/DashBoard/DashBoard";
import LoginForm from "./Component/LoginForm/LoginForm";
import ChangePasswordForm from "./Component/ChangePasswordForm/ChangePasswordForm";
import EmployeeReportForm from "./Component/HR/Employee/EmployeeMasterReport";
import AddEmployeeForm from "./Component/HR/Employee/AddEmployee";
import LeaveReport from "./Component/HR/LeaveApplication/LeaveReport";
import { ToastProvider } from "./context/ToastContext";
import { CompanyProvider } from "./context/CompanyContext";
import { NavigationGuardProvider } from "./context/NavigationGuardContext";
import MainLayout from "./Component/Layout/MainLayout";
import OnDutyPreview from "./Component/HR/onduty/OnDutyPreview";
import OnDutyDashboard from "./Component/HR/onduty/OnDutyDashboard";
import EditItem from "./Component/ERP/Stores/ItemMaster/EditItem";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme.js';
import LeaveDashboard from "./Component/HR/LeaveApplication/LeaveDashboard.jsx";
import EmployeeDashboard from "./Component/HR/Employee/EmployeeDashboard.jsx";
import PhotoUpload from "./Component/HR/Employee/PhotoUpload.jsx";
import ShiftChangeDashboard from "./Component/HR/shiftchange/ShiftChangeDashboard.jsx";
import AttendanceModification from "./Component/HR/Attendance/AttendanceModification.jsx";
import HRAttendance from "./Component/HR/HRAttendance/HRAttendance.jsx";
import LeaveMaster from "./Component/HR/LeaveApplication/LeaveMaster.jsx";
import TourDashboard from "./Component/HR/tour/TourDashboard.jsx";
import WoffChangeDashboard from "./Component/HR/woffchange/WoffChangeDashboard.jsx";
import AdvanceDashboard from "./Component/HR/advance/AdvanceDashboard.jsx";
import ESILeaveDashboard from "./Component/HR/esileave/ESILeaveDashboard.jsx";
import PayrollDashboard from "./Component/HR/payroll/PayrollDashboard.jsx";
import HolidayMaster from "./Component/HR/Holiday/HolidayMaster.jsx";
import ShiftMaster from "./Component/HR/ShiftMaster/ShiftMaster.jsx";
import ShiftSchedule from "./Component/HR/ShiftSchedule/ShiftSchedule.jsx";
import MusterRoll from "./Component/HR/Attendance/MusterRoll.jsx";
import OTApproval from "./Component/HR/Attendance/OTApproval.jsx";
import Reports from "./Component/Reports/Reports.jsx";
import Settings from "./Component/Settings/Settings.jsx";
import AccountsDashboard from "./Component/Accounts/AccountsDashboard.jsx";
import PurchaseDashboard from "./Component/ERP/Purchase/PurchaseDashboard.jsx";
import StoresDashboard from "./Component/ERP/Stores/StoresDashboard.jsx";
import ProductionDashboard from "./Component/ERP/Production/ProductionDashboard.jsx";
import PlanningDashboard from "./Component/ERP/Planning/PlanningDashboard.jsx";
import EngineeringDashboard from "./Component/ERP/Engineering/EngineeringDashboard.jsx";
import MarketingDashboard from "./Component/ERP/Marketing/MarketingDashboard.jsx";
import QualityDashboard from "./Component/Quality/QualityDashboard.jsx";
import SubcontractDashboard from "./Component/ERP/Subcontract/SubcontractDashboard.jsx";
import MaintenanceDashboard from "./Component/ERP/Maintenance/MaintenanceDashboard.jsx";
import AccountsReports from "./Component/Accounts/AccountsReports.jsx";
import PurchaseReports from "./Component/ERP/Purchase/PurchaseReports.jsx";
import PurchaseSettings from "./Component/ERP/Purchase/PurchaseSettings.jsx";
import StoresReports from "./Component/ERP/Stores/StoresReports.jsx";
import StoresSettings from "./Component/ERP/Stores/StoresSettings.jsx";
import ProductionReports from "./Component/ERP/Production/ProductionReports.jsx";
import ProductionSettings from "./Component/ERP/Production/ProductionSettings.jsx";
import PlanningReports from "./Component/ERP/Planning/PlanningReports.jsx";
import PlanningSettings from "./Component/ERP/Planning/PlanningSettings.jsx";
import EngineeringReports from "./Component/ERP/Engineering/EngineeringReports.jsx";
import EngineeringSettings from "./Component/ERP/Engineering/EngineeringSettings.jsx";
import MarketingReports from "./Component/ERP/Marketing/MarketingReports.jsx";
import MarketingSettings from "./Component/ERP/Marketing/MarketingSettings.jsx";
import QualityReports from "./Component/Quality/QualityReports.jsx";
import QualitySettings from "./Component/Quality/QualitySettings.jsx";
import SubcontractReports from "./Component/ERP/Subcontract/SubcontractReports.jsx";
import SubcontractSettings from "./Component/ERP/Subcontract/SubcontractSettings.jsx";
import MaintenanceReports from "./Component/ERP/Maintenance/MaintenanceReports.jsx";
import MaintenanceSettings from "./Component/ERP/Maintenance/MaintenanceSettings.jsx";
import UserAccess from "./Component/Settings/UserAccess.jsx";
import ProfileUpdate from "./Component/Settings/ProfileUpdate.jsx";
import ProfileRequestApproval from "./Component/HR/Employee/ProfileRequestApproval.jsx";

import axios from "axios";

function App() {
  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Skip redirect if it's a login request or already on the login page
        const isLoginRequest = error.config?.url?.includes('/api/auth/login');
        const isAtLoginPath = window.location.pathname === '/';

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          const isLoginRequest = error.config?.url?.includes('/api/auth/login');
          const isAtLoginPath = window.location.pathname === '/';
          const isAuthenticated = !!localStorage.getItem('userName');

          if (isAuthenticated && !isLoginRequest && !isAtLoginPath) {
            console.warn('Session expired or unauthorized, redirecting to login.');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('empName');
            window.location.href = "/";
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <NavigationGuardProvider>
        <ToastProvider>
          <CompanyProvider>
            <div className="App">
              <Router>
                <Routes>
                  <Route path="/" element={<LoginForm />} />
                  <Route element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/dashboard" element={<DashBoard />} />
                    <Route path="/accounts" element={<AccountsDashboard />} />

                    {/* ERP & Operations Modules */}
                    <Route path="/purchase" element={<PurchaseDashboard />} />
                    <Route path="/stores" element={<StoresDashboard />} />
                    <Route path="/production" element={<ProductionDashboard />} />
                    <Route path="/planning" element={<PlanningDashboard />} />
                    <Route path="/engineering" element={<EngineeringDashboard />} />
                    <Route path="/quality" element={<QualityDashboard />} />
                    <Route path="/marketing" element={<MarketingDashboard />} />
                    <Route path="/subcontract" element={<SubcontractDashboard />} />
                    <Route path="/maintenance" element={<MaintenanceDashboard />} />

                    {/* Departmental Reports */}
                    <Route path="/hr/reports" element={<Reports />} />
                    <Route path="/accounts/reports" element={<AccountsReports />} />
                    <Route path="/purchase/reports" element={<PurchaseReports />} />
                    <Route path="/stores/reports" element={<StoresReports />} />
                    <Route path="/production/reports" element={<ProductionReports />} />
                    <Route path="/planning/reports" element={<PlanningReports />} />
                    <Route path="/engineering/reports" element={<EngineeringReports />} />
                    <Route path="/quality/reports" element={<QualityReports />} />
                    <Route path="/marketing/reports" element={<MarketingReports />} />
                    <Route path="/subcontract/reports" element={<SubcontractReports />} />
                    <Route path="/maintenance/reports" element={<MaintenanceReports />} />

                    {/* Departmental Settings */}
                    <Route path="/hr/settings" element={<Settings />} />
                    <Route path="/accounts/settings" element={<AccountsReports />} /> {/* Placeholder */}
                    <Route path="/purchase/settings" element={<PurchaseSettings />} />
                    <Route path="/stores/settings" element={<StoresSettings />} />
                    <Route path="/production/settings" element={<ProductionSettings />} />
                    <Route path="/planning/settings" element={<PlanningSettings />} />
                    <Route path="/engineering/settings" element={<EngineeringSettings />} />
                    <Route path="/quality/settings" element={<QualitySettings />} />
                    <Route path="/marketing/settings" element={<MarketingSettings />} />
                    <Route path="/subcontract/settings" element={<SubcontractSettings />} />
                    <Route path="/maintenance/settings" element={<MaintenanceSettings />} />

                    <Route path="/photo" element={<PhotoUpload />} />
                    <Route path="/profile-requests" element={<ProfileRequestApproval />} />
                    <Route path="/employees" element={<EmployeeDashboard />} />
                    <Route path="/employee-report" element={<EmployeeDashboard />} />
                    <Route path="/add-employee" element={<AddEmployeeForm />} />
                    <Route path="/edit-employee/:empid" element={<AddEmployeeForm />} />
                    <Route path="/leave" element={<LeaveDashboard />} />
                    <Route path="/leaves-master" element={<LeaveMaster />} />
                    <Route path="/onduty" element={<OnDutyDashboard />} />
                    <Route path="/onduty-preview" element={<OnDutyPreview />} />
                    <Route path="/shiftchange" element={<ShiftChangeDashboard />} />
                    <Route path="/edit-item" element={<EditItem />} />
                    <Route path="/attendance-mod" element={<AttendanceModification />} />
                    <Route path="/hr-attendance" element={<HRAttendance />} />
                    <Route path="/change-password" element={<ChangePasswordForm />} />
                    <Route path="/tour" element={<TourDashboard />} />
                    <Route path="/woffchange" element={<WoffChangeDashboard />} />
                    <Route path="/advance" element={<AdvanceDashboard />} />
                    <Route path="/esileave" element={<ESILeaveDashboard />} />
                    <Route path="/payroll" element={<PayrollDashboard />} />
                    <Route path="/holidays" element={<HolidayMaster />} />
                    <Route path="/shift-master" element={<ShiftMaster />} />
                    <Route path="/shiftschedule" element={<ShiftSchedule />} />
                    <Route path="/muster-roll" element={<MusterRoll />} />
                    <Route path="/ot-approval" element={<OTApproval />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/leave-report" element={<LeaveReport />} />
                    <Route path="/useraccess" element={<UserAccess />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<ProfileUpdate />} />
                  </Route>
                </Routes>
              </Router>
            </div>
          </CompanyProvider>
        </ToastProvider>
      </NavigationGuardProvider>
    </ThemeProvider>
  );
}

export default App;
