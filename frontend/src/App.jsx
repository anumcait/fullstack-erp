import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import ItemMaster from "./Component/ERP/Stores/ItemMaster/ItemMaster";
import AddItem from "./Component/ERP/Stores/ItemMaster/AddItem";
import { ThemeContextProvider } from './context/ThemeContext';
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
import EmployeeTax from "./Component/HR/EmployeeTax/EmployeeTax.jsx";
import RecruitmentDashboard from "./Component/HR/Recruitment/RecruitmentDashboard.jsx";
import ExitSettlementDashboard from "./Component/HR/ExitSettlement/ExitSettlementDashboard.jsx";
import TrainingDashboard from "./Component/HR/Training/TrainingDashboard.jsx";
import PMSDashboard from "./Component/HR/PMS/PMSDashboard.jsx";
import DisciplinaryDashboard from "./Component/HR/Disciplinary/DisciplinaryDashboard.jsx";
import AttendanceCollectorDashboard from "./Component/HR/AttendanceCollector/AttendanceCollectorDashboard.jsx";
import PfAccountingDashboard from "./Component/HR/PFAccounting/PfAccountingDashboard.jsx";
import Reports from "./Component/Reports/Reports.jsx";
import Settings from "./Component/Settings/Settings.jsx";
import AccountsDashboard from "./Component/Accounts/AccountsDashboard.jsx";
import PurchaseDashboard from "./Component/ERP/Purchase/PurchaseDashboard.jsx";
import RequisitionList from "./Component/ERP/Purchase/Requisition/RequisitionList.jsx";
import RequisitionForm from "./Component/ERP/Purchase/Requisition/RequisitionForm.jsx";
import POList from "./Component/ERP/Purchase/PO/POList.jsx";
import POForm from "./Component/ERP/Purchase/PO/POForm.jsx";
import RFQList from "./Component/ERP/Purchase/RFQ/RFQList.jsx";
import RFQForm from "./Component/ERP/Purchase/RFQ/RFQForm.jsx";
import PriceList from "./Component/ERP/Purchase/PriceList/PriceList.jsx";
import PriceForm from "./Component/ERP/Purchase/PriceList/PriceForm.jsx";
import GRNList from "./Component/ERP/Purchase/GRN/GRNList.jsx";
import GRNForm from "./Component/ERP/Purchase/GRN/GRNForm.jsx";
import VendorRatingList from "./Component/ERP/Purchase/VendorRating/VendorRatingList.jsx";
import VendorRatingForm from "./Component/ERP/Purchase/VendorRating/VendorRatingForm.jsx";
import SupplierMaster from "./Component/ERP/Purchase/VendorMaster/SupplierMaster.jsx";
import AddSupplier from "./Component/ERP/Purchase/VendorMaster/AddSupplier.jsx";
import StoresDashboard from "./Component/ERP/Stores/StoresDashboard.jsx";
import MaterialRequisitionList from "./Component/ERP/Stores/MaterialRequisition/MaterialRequisitionList.jsx";
import MaterialRequisitionForm from "./Component/ERP/Stores/MaterialRequisition/MaterialRequisitionForm.jsx";
import MaterialIssueList from "./Component/ERP/Stores/MaterialIssue/MaterialIssueList.jsx";
import MaterialIssueForm from "./Component/ERP/Stores/MaterialIssue/MaterialIssueForm.jsx";
import ProductionDashboard from "./Component/ERP/Production/ProductionDashboard.jsx";
import ProductionOrderList from "./Component/ERP/Production/ProductionOrder/ProductionOrderList.jsx";
import ProductionOrderForm from "./Component/ERP/Production/ProductionOrder/ProductionOrderForm.jsx";
import PlanningDashboard from "./Component/ERP/Planning/PlanningDashboard.jsx";
import EngineeringDashboard from "./Component/ERP/Engineering/EngineeringDashboard.jsx";
import BOMList from "./Component/ERP/Engineering/BOM/BOMList.jsx";
import BOMForm from "./Component/ERP/Engineering/BOM/BOMForm.jsx";
import ProductMasterList from "./Component/ERP/Engineering/ProductMaster/ProductMasterList.jsx";
import ProductMasterForm from "./Component/ERP/Engineering/ProductMaster/ProductMasterForm.jsx";
import MarketingDashboard from "./Component/ERP/Marketing/MarketingDashboard.jsx";
import QualityDashboard from "./Component/Quality/QualityDashboard.jsx";
import SubcontractDashboard from "./Component/ERP/Subcontract/SubcontractDashboard.jsx";
import MaintenanceDashboard from "./Component/ERP/Maintenance/MaintenanceDashboard.jsx";
import AccountsReports from "./Component/Accounts/AccountsReports.jsx";
import PurchaseReports from "./Component/ERP/Purchase/PurchaseReports.jsx";
import PurchaseSettings from "./Component/ERP/Purchase/PurchaseSettings.jsx";
import StoresReports from "./Component/ERP/Stores/StoresReports.jsx";
import StoresSettings from "./Component/ERP/Stores/StoresSettings.jsx";
import StockLedger from "./Component/ERP/Stores/StockLedger/StockLedger.jsx";
import StockAuditList from "./Component/ERP/Stores/StockAudit/StockAuditList.jsx";
import StockAuditForm from "./Component/ERP/Stores/StockAudit/StockAuditForm.jsx";
import GateEntryList from "./Component/ERP/Stores/GateEntry/GateEntryList.jsx";
import GateEntryForm from "./Component/ERP/Stores/GateEntry/GateEntryForm.jsx";
import MaterialReturnList from "./Component/ERP/Stores/MaterialReturn/MaterialReturnList.jsx";
import MaterialReturnForm from "./Component/ERP/Stores/MaterialReturn/MaterialReturnForm.jsx";
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
    <ThemeContextProvider>
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
                    <Route path="/purchase/req" element={<Navigate to="/purchase/requisitions" replace />} />
                    <Route path="/purchase/requisitions" element={<RequisitionList />} />
                    <Route path="/purchase/requisitions/add" element={<RequisitionForm />} />
                    <Route path="/purchase/requisitions/view/:id" element={<RequisitionForm />} />
                    <Route path="/purchase/requisitions/edit/:id" element={<RequisitionForm />} />
                    <Route path="/purchase/orders" element={<POList />} />
                    <Route path="/purchase/orders/add" element={<POForm />} />
                    <Route path="/purchase/orders/view/:id" element={<POForm />} />
                    <Route path="/purchase/orders/edit/:id" element={<POForm />} />
                    <Route path="/purchase/rfq" element={<RFQList />} />
                    <Route path="/purchase/rfq/add" element={<RFQForm />} />
                    <Route path="/purchase/rfq/view/:id" element={<RFQForm />} />
                    <Route path="/purchase/rfq/edit/:id" element={<RFQForm />} />
                    <Route path="/purchase/prices" element={<PriceList />} />
                    <Route path="/purchase/prices/add" element={<PriceForm />} />
                    <Route path="/purchase/prices/view/:id" element={<PriceForm />} />
                    <Route path="/purchase/prices/edit/:id" element={<PriceForm />} />
                    <Route path="/purchase/rating" element={<VendorRatingList />} />
                    <Route path="/purchase/rating/add" element={<VendorRatingForm />} />
                    <Route path="/purchase/vendors" element={<SupplierMaster />} />
                    <Route path="/purchase/vendors/add" element={<AddSupplier />} />
                    <Route path="/purchase/vendors/view/:id" element={<AddSupplier />} />
                    <Route path="/purchase/vendors/edit/:id" element={<AddSupplier />} />
                    <Route path="/stores" element={<StoresDashboard />} />
                    <Route path="/stores/item-master" element={<ItemMaster />} />
                    <Route path="/stores/item-master/add" element={<AddItem />} />
                    <Route path="/stores/item-master/edit/:id" element={<AddItem />} />
                    <Route path="/stores/grn" element={<GRNList />} />
                    <Route path="/stores/grn/add" element={<GRNForm />} />
                    <Route path="/stores/grn/view/:id" element={<GRNForm />} />
                    <Route path="/stores/grn/edit/:id" element={<GRNForm />} />
                    <Route path="/stores/material-requisitions" element={<MaterialRequisitionList />} />
                    <Route path="/stores/material-requisitions/add" element={<MaterialRequisitionForm />} />
                    <Route path="/stores/material-requisitions/view/:id" element={<MaterialRequisitionForm />} />
                    <Route path="/stores/material-requisitions/edit/:id" element={<MaterialRequisitionForm />} />
                    <Route path="/stores/material-issues" element={<MaterialIssueList />} />
                    <Route path="/stores/material-issues/add" element={<MaterialIssueForm />} />
                    <Route path="/stores/material-issues/view/:id" element={<MaterialIssueForm />} />
                    <Route path="/inventory/ledger" element={<StockLedger />} />
                    <Route path="/stores/stock-audit" element={<StockAuditList />} />
                    <Route path="/stores/stock-audit/add" element={<StockAuditForm />} />
                    <Route path="/stores/stock-audit/view/:id" element={<StockAuditForm />} />
                    <Route path="/stores/stock-audit/edit/:id" element={<StockAuditForm />} />
                    <Route path="/stores/gate-entry" element={<GateEntryList />} />
                    <Route path="/stores/gate-entry/add" element={<GateEntryForm />} />
                    <Route path="/stores/gate-entry/view/:id" element={<GateEntryForm />} />
                    <Route path="/stores/gate-entry/edit/:id" element={<GateEntryForm />} />
                    <Route path="/stores/material-returns" element={<MaterialReturnList />} />
                    <Route path="/stores/material-returns/add" element={<MaterialReturnForm />} />
                    <Route path="/stores/material-returns/view/:id" element={<MaterialReturnForm />} />
                    <Route path="/production" element={<ProductionDashboard />} />
                    <Route path="/production/orders" element={<ProductionOrderList />} />
                    <Route path="/production/orders/add" element={<ProductionOrderForm />} />
                    <Route path="/production/orders/view/:id" element={<ProductionOrderForm />} />
                    <Route path="/planning" element={<PlanningDashboard />} />
                    <Route path="/engineering" element={<EngineeringDashboard />} />
                    <Route path="/engineering/products" element={<ProductMasterList />} />
                    <Route path="/engineering/products/add" element={<ProductMasterForm />} />
                    <Route path="/engineering/products/view/:id" element={<ProductMasterForm />} />
                    <Route path="/engineering/products/edit/:id" element={<ProductMasterForm />} />
                    <Route path="/engineering/bom" element={<BOMList />} />
                    <Route path="/engineering/bom/add" element={<BOMForm />} />
                    <Route path="/engineering/bom/view/:id" element={<BOMForm />} />
                    <Route path="/engineering/bom/edit/:id" element={<BOMForm />} />
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
                    <Route path="/tax" element={<EmployeeTax />} />
                    <Route path="/recruitment" element={<RecruitmentDashboard />} />
                    <Route path="/exit-settlement" element={<ExitSettlementDashboard />} />
                    <Route path="/training" element={<TrainingDashboard />} />
                    <Route path="/pms" element={<PMSDashboard />} />
                    <Route path="/disciplinary" element={<DisciplinaryDashboard />} />
                    <Route path="/attendance-collector" element={<AttendanceCollectorDashboard />} />
                    <Route path="/pf-accounting" element={<PfAccountingDashboard />} />
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
    </ThemeContextProvider>
  );
}

export default App;
