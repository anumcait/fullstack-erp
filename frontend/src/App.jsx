import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PermissionRoute from "./routes/PermissionRoute";
import { getRoutePermission } from "./routes/routePermissions";

import ERPLanding from "./Component/ERP/ERPLanding";
import LoginForm from "./Component/LoginForm/LoginForm";
import CompanySetup from "./Component/Settings/CompanySetup";
import CompanyGate from "./routes/CompanyGate";
import ChangePasswordForm from "./Component/ChangePasswordForm/ChangePasswordForm";
import EmployeeReportForm from "./Component/HR/Employee/EmployeeMasterReport";
import AddEmployeeForm from "./Component/HR/Employee/AddEmployee";
import LeaveReport from "./Component/HR/LeaveApplication/LeaveReport";
import DashBoard from "./Component/HR/DashBoard/DashBoard";
import { ToastProvider } from "./context/ToastContext";
import { CompanyProvider, useCompany } from "./context/CompanyContext";
import CompanyErrorScreen from "./routes/CompanyErrorScreen";
import { NavigationGuardProvider } from "./context/NavigationGuardContext";
import MainLayout from "./Component/Layout/MainLayout";
import DocumentTitle from "./Component/Layout/DocumentTitle";
import OnDutyPreview from "./Component/HR/onduty/OnDutyPreview";
import OnDutyDashboard from "./Component/HR/onduty/OnDutyDashboard";
import ItemMaster from "./Component/ERP/Stores/ItemMaster/ItemMaster";
import AddItem from "./Component/ERP/Stores/ItemMaster/AddItem";
import UOMMaster from "./Component/ERP/Stores/UOMMaster/UOMMaster";
import ItemGroupMaster from "./Component/ERP/Stores/ItemGroupMaster/ItemGroupMaster";
import ItemTypeMaster from "./Component/ERP/Stores/ItemTypeMaster/ItemTypeMaster";
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

// Wrapper combining auth + permission check (dynamic based on current location)
const SecureRoute = ({ children, fallback = '/dashboard' }) => {
  const location = useLocation();
  const userName = localStorage.getItem('userName');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  const userRole = localStorage.getItem('userRole');

  if (!userName) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Only the canonical ADMIN role bypasses permission checks (must match
  // backend middleware/auth.js). A role like "HR_ADMIN" must NOT bypass.
  const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';
  if (isAdmin) {
    return children;
  }

  // Check permission for current pathname
  const permission = getRoutePermission(location.pathname);
  if (!permission) {
    return children; // No specific permission required
  }

  const hasPermission = userPermissions.includes(permission);
  if (!hasPermission) {
    // Redirect to dashboard with permission error in state
    return <Navigate to={fallback} replace state={{ 
      from: location, 
      requiredPermission: permission,
      permissionDenied: true,
      attemptedPath: location.pathname
    }} />;
  }

  return children;
};

// Wrapper for layout routes
const SecureLayout = ({ children }) => <SecureRoute>{children}</SecureRoute>;

// Root route: if no company is configured yet, send the visitor to the
// Create Company form before showing the login screen.
const RootRoute = () => {
  const { companyConfigured, companyLoading, companyError, refreshCompanySettings } = useCompany();
  if (companyError) {
    return <CompanyErrorScreen onRetry={refreshCompanySettings} />;
  }
  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf2ff]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#56c7be]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-gray-500 font-semibold">Loading…</p>
        </div>
      </div>
    );
  }
  if (!companyConfigured) {
    return <Navigate to="/company-setup" replace />;
  }
  return <LoginForm />;
};
import Reports from "./Component/Reports/Reports.jsx";
import Settings from "./Component/Settings/Settings.jsx";
import AccountsDashboard from "./Component/Accounts/AccountsDashboard.jsx";
import ChartOfAccounts from "./Component/AccountPages/Accounting/ChartOfAccounts.jsx";
import VoucherList from "./Component/AccountPages/Vouchers/VoucherList.jsx";
import VoucherForm from "./Component/AccountPages/Vouchers/VoucherForm.jsx";
import VoucherView from "./Component/AccountPages/Accounting/VoucherView.jsx";
import LedgerReport from "./Component/AccountPages/Reports/LedgerReport.jsx";
import DayBook from "./Component/AccountPages/Reports/DayBook.jsx";
import TrialBalance from "./Component/AccountPages/Reports/TrialBalance.jsx";
import ProfitLoss from "./Component/AccountPages/Reports/ProfitLoss.jsx";
import BalanceSheet from "./Component/AccountPages/Reports/BalanceSheet.jsx";
import APReport from "./Component/AccountPages/Reports/APReport.jsx";
import BudgetPage from "./Component/AccountPages/Accounting/BudgetPage.jsx";
import AccountSettings from "./Component/AccountPages/Accounting/AccountSettings.jsx";
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
import GRRPrintView from "./Component/ERP/Purchase/GRN/GRRPrintView.jsx";
import PurchaseApprovals from "./Component/ERP/Purchase/PurchaseApprovals.jsx";
import StoresApprovals from "./Component/ERP/Stores/StoresApprovals.jsx";
import VendorRatingList from "./Component/ERP/Purchase/VendorRating/VendorRatingList.jsx";
import VendorRatingForm from "./Component/ERP/Purchase/VendorRating/VendorRatingForm.jsx";
import SupplierMaster from "./Component/ERP/Purchase/VendorMaster/SupplierMaster.jsx";
import AddSupplier from "./Component/ERP/Purchase/VendorMaster/AddSupplier.jsx";
import StoresDashboard from "./Component/ERP/Stores/StoresDashboard.jsx";
import MaterialRequisitionList from "./Component/ERP/Stores/MaterialRequisition/MaterialRequisitionList.jsx";
import MaterialRequisitionForm from "./Component/ERP/Stores/MaterialRequisition/MaterialRequisitionForm.jsx";
import MRPrintView from "./Component/ERP/Stores/MaterialRequisition/MRPrintView.jsx";
import MaterialIssueList from "./Component/ERP/Stores/MaterialIssue/MaterialIssueList.jsx";
import MaterialIssueForm from "./Component/ERP/Stores/MaterialIssue/MaterialIssueForm.jsx";
import ProductionDashboard from "./Component/ERP/Production/ProductionDashboard.jsx";
import ProductionOrderList from "./Component/ERP/Production/JobOrder/ProductionOrderList.jsx";
import JobOrderForm from "./Component/ERP/Production/JobOrder/JobOrderForm.jsx";
import MachineList from "./Component/ERP/Production/MachineList.jsx";
import MachineForm from "./Component/ERP/Production/MachineForm.jsx";
import DailyEntryList from "./Component/ERP/Production/DailyEntryList.jsx";
import DailyEntryForm from "./Component/ERP/Production/DailyEntryForm.jsx";
import DowntimeList from "./Component/ERP/Production/DowntimeList.jsx";
import DowntimeForm from "./Component/ERP/Production/DowntimeForm.jsx";
import PlanningDashboard from "./Component/ERP/Planning/PlanningDashboard.jsx";
import ScheduleList from "./Component/ERP/Planning/ScheduleList.jsx";
import ScheduleForm from "./Component/ERP/Planning/ScheduleForm.jsx";
import MRPList from "./Component/ERP/Planning/MRPList.jsx";
import MRPForm from "./Component/ERP/Planning/MRPForm.jsx";
import CapacityList from "./Component/ERP/Planning/CapacityList.jsx";
import CapacityForm from "./Component/ERP/Planning/CapacityForm.jsx";
import EngineeringDashboard from "./Component/ERP/Engineering/EngineeringDashboard.jsx";
import BOMList from "./Component/ERP/Engineering/BOM/BOMList.jsx";
import BOMForm from "./Component/ERP/Engineering/BOM/BOMForm.jsx";
import ProductMasterList from "./Component/ERP/Engineering/ProductMaster/ProductMasterList.jsx";
import AssemblyTree from "./Component/ERP/Engineering/ProductMaster/AssemblyTree.jsx";
import ProductMasterForm from "./Component/ERP/Engineering/ProductMaster/ProductMasterForm.jsx";
import CategoryMaster from "./Component/ERP/Engineering/CategoryMaster/CategoryMaster.jsx";
import MarketingDashboard from "./Component/ERP/Marketing/MarketingDashboard.jsx";
import CustomerMaster from "./Component/ERP/Marketing/Customers/CustomerMaster.jsx";
import AddCustomer from "./Component/ERP/Marketing/Customers/AddCustomer.jsx";
import LeadList from "./Component/ERP/Marketing/Leads/LeadList.jsx";
import LeadForm from "./Component/ERP/Marketing/Leads/LeadForm.jsx";
import QuotationList from "./Component/ERP/Marketing/Quotations/QuotationList.jsx";
import QuotationForm from "./Component/ERP/Marketing/Quotations/QuotationForm.jsx";
import SalesOrderList from "./Component/ERP/Marketing/SalesOrders/SalesOrderList.jsx";
import SalesOrderForm from "./Component/ERP/Marketing/SalesOrders/SalesOrderForm.jsx";
import QualityDashboard from "./Component/Quality/QualityDashboard.jsx";
import InspectionList from "./Component/Quality/InspectionList.jsx";
import InspectionForm from "./Component/Quality/InspectionForm.jsx";
import NonConformanceList from "./Component/Quality/NonConformanceList.jsx";
import NonConformanceForm from "./Component/Quality/NonConformanceForm.jsx";
import SubcontractDashboard from "./Component/ERP/Subcontract/SubcontractDashboard.jsx";
import OrderList from "./Component/ERP/Subcontract/OrderList.jsx";
import OrderForm from "./Component/ERP/Subcontract/OrderForm.jsx";
import IssueList from "./Component/ERP/Subcontract/IssueList.jsx";
import IssueForm from "./Component/ERP/Subcontract/IssueForm.jsx";
import ReceiptList from "./Component/ERP/Subcontract/ReceiptList.jsx";
import ReceiptForm from "./Component/ERP/Subcontract/ReceiptForm.jsx";
import MaintenanceDashboard from "./Component/ERP/Maintenance/MaintenanceDashboard.jsx";
import MaintenanceMachineList from "./Component/ERP/Maintenance/MachineList.jsx";
import MaintenanceMachineForm from "./Component/ERP/Maintenance/MachineForm.jsx";
import AssetList from "./Component/ERP/Maintenance/AssetList.jsx";
import AssetForm from "./Component/ERP/Maintenance/AssetForm.jsx";
import MaintenanceScheduleList from "./Component/ERP/Maintenance/ScheduleList.jsx";
import MaintenanceScheduleForm from "./Component/ERP/Maintenance/ScheduleForm.jsx";
import AccountsReports from "./Component/Accounts/AccountsReports.jsx";
import PurchaseReports from "./Component/ERP/Purchase/PurchaseReports.jsx";
import DailyReports from "./Component/ERP/Purchase/DailyReports.jsx";
import JobOrderList from "./Component/ERP/Purchase/JobOrderList.jsx";
import PRAmendment from "./Component/ERP/Purchase/PRAmendment.jsx";
import PRPrintView from "./Component/ERP/Purchase/Requisition/PRPrintView.jsx";
import PRAmendmentCompare from "./Component/ERP/Purchase/Requisition/PRAmendmentCompare.jsx";
import PRSanction from "./Component/ERP/Purchase/PRSanction.jsx";
import PurchaseSettings from "./Component/ERP/Purchase/PurchaseSettings.jsx";
import StoresReports from "./Component/ERP/Stores/StoresReports.jsx";
import StoresSettings from "./Component/ERP/Stores/StoresSettings.jsx";
import StockLedger from "./Component/ERP/Stores/StockLedger/StockLedger.jsx";
import StockStatement from "./Component/ERP/Stores/StockStatement/StockStatement.jsx";
import WarehouseMaster from "./Component/ERP/Stores/WarehouseMaster/WarehouseMaster.jsx";
import BatchMaster from "./Component/ERP/Stores/BatchMaster/BatchMaster.jsx";
import DayWiseStock from "./Component/ERP/Stores/DayWiseStock/DayWiseStock.jsx";
import StockAuditList from "./Component/ERP/Stores/StockAudit/StockAuditList.jsx";
import StockAuditForm from "./Component/ERP/Stores/StockAudit/StockAuditForm.jsx";
import GateEntryList from "./Component/ERP/Stores/GateEntry/GateEntryList.jsx";
import DeliveryChallanList from "./Component/ERP/Stores/DeliveryChallan/DeliveryChallanList.jsx";
import DeliveryChallanForm from "./Component/ERP/Stores/DeliveryChallan/DeliveryChallanForm.jsx";
import DcPreparationForm from "./Component/ERP/Stores/DeliveryChallan/DcPreparationForm.jsx";
import RepairChallanForm from "./Component/ERP/Stores/DeliveryChallan/RepairChallanForm.jsx";
import MaintenanceChallanForm from "./Component/ERP/Stores/DeliveryChallan/MaintenanceChallanForm.jsx";
import NonReturnableChallanForm from "./Component/ERP/Stores/DeliveryChallan/NonReturnableChallanForm.jsx";
import NonReturnableChallanList from "./Component/ERP/Stores/DeliveryChallan/NonReturnableChallanList.jsx";
import InwardRegisterList from "./Component/ERP/Stores/InwardRegister/InwardRegisterList.jsx";
import InwardRegisterForm from "./Component/ERP/Stores/InwardRegister/InwardRegisterForm.jsx";
import DcBillingList from "./Component/ERP/Stores/SaleOnApproval/DcBillingList.jsx";
import BillingList from "./Component/ERP/Stores/Billing/BillingList.jsx";
import BillingForm from "./Component/ERP/Stores/Billing/BillingForm.jsx";
import RepairBilling from "./Component/ERP/Stores/Billing/RepairBilling.jsx";
import MaintenanceBilling from "./Component/ERP/Stores/Billing/MaintenanceBilling.jsx";
import MiscVoucherBilling from "./Component/ERP/Stores/Billing/MiscVoucherBilling.jsx";
import Cancellations from "./Component/ERP/Stores/Cancellations/Cancellations.jsx";
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
axios.defaults.withCredentials = true;

function useIdleLogout(timeoutMs = 30 * 60 * 1000) {
  React.useEffect(() => {
    if (!localStorage.getItem('userName')) return;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try { await axios.post('/api/auth/logout', {}, { withCredentials: true }); } catch {}
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }, timeoutMs);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeoutMs]);
}

function App() {
  useIdleLogout();
  React.useEffect(() => {
    if (localStorage.getItem('userName')) {
      axios.get('/api/auth/me', { withCredentials: true }).catch(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }, []);
  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          const isLoginRequest = error.config?.url?.includes('/api/auth/login');
          const isMeRequest = error.config?.url?.includes('/api/auth/me');
          const isAtLoginPath = window.location.pathname === '/' || window.location.pathname === '/login';
          const isAuthenticated = !!localStorage.getItem('userName');

          if (isAuthenticated && !isLoginRequest && !isMeRequest && !isAtLoginPath) {
            console.warn('Session expired or unauthorized, redirecting to login.');
            localStorage.clear();
            sessionStorage.clear();
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
                <DocumentTitle />
                <Routes>
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/company-setup" element={<CompanySetup />} />
                  <Route path="/change-password" element={<ChangePasswordForm />} />
                  <Route element={<CompanyGate />}>
                  <Route
                    path="/dashboard"
                    element={<SecureRoute><ERPLanding /></SecureRoute>}
                  />
                  <Route element={<SecureLayout><MainLayout /></SecureLayout>}>
                    <Route path="/hr" element={<DashBoard />} />
                    <Route path="/accounts" element={<AccountsDashboard />} />
                    <Route path="/accounts/coa" element={<ChartOfAccounts />} />
                    <Route path="/accounts/budgets" element={<BudgetPage />} />
                    <Route path="/accounts/settings" element={<AccountSettings />} />

                    {/* Invoice routes (sidebar links from old AccInv submenu) */}
                    <Route path="/invoice/sales" element={<VoucherList type="sales" />} />
                    <Route path="/invoice/purchase" element={<VoucherList type="purchase" />} />
                    <Route path="/invoice/debit-note" element={<VoucherList type="debit-note" />} />
                    <Route path="/invoice/credit-note" element={<VoucherList type="credit-note" />} />

                    {/* Voucher routes (sidebar links from AccVouch submenu) */}
                    <Route path="/accounts/payment" element={<VoucherList type="payment" />} />
                    <Route path="/accounts/receipt" element={<VoucherList type="receipt" />} />
                    <Route path="/accounts/journal" element={<VoucherList type="journal" />} />
                    <Route path="/accounts/contra" element={<VoucherList type="contra" />} />

                    {/* Voucher add/edit */}
                    <Route path="/accounts/voucher/:type/add" element={<VoucherForm />} />
                    <Route path="/accounts/voucher/:type/:id" element={<VoucherView />} />

                    {/* Accounts reports */}
                    <Route path="/accounts/reports" element={<AccountsReports />} />
                    <Route path="/reports/ledger" element={<LedgerReport />} />
                    <Route path="/reports/daybook" element={<DayBook />} />
                    <Route path="/reports/trial-balance" element={<TrialBalance />} />
                    <Route path="/reports/pl" element={<ProfitLoss />} />
                    <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
                    <Route path="/reports/ap" element={<APReport />} />
                    <Route path="/reports/ar" element={<APReport />} />

                    {/* ERP & Operations Modules */}
                    <Route path="/purchase" element={<PurchaseDashboard />} />
                    <Route path="/purchase/req" element={<Navigate to="/purchase/requisitions" replace />} />
                    <Route path="/purchase/requisitions" element={<RequisitionList />} />
                    <Route path="/purchase/requisitions/add" element={<RequisitionForm />} />
                    <Route path="/purchase/requisitions/view/:id" element={<RequisitionForm />} />
                    <Route path="/purchase/requisitions/edit/:id" element={<RequisitionForm />} />
                    <Route path="/purchase/requisitions/print/:id" element={<PRPrintView />} />
                    <Route path="/purchase/requisitions/sanction" element={<PRSanction />} />
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
                    <Route path="/purchase/approvals" element={<PurchaseApprovals />} />
                    <Route path="/stores/approvals" element={<StoresApprovals />} />
                    <Route path="/stores" element={<StoresDashboard />} />
                    <Route path="/stores/item-master" element={<ItemMaster />} />
                    <Route path="/stores/item-master/add" element={<AddItem />} />
                    <Route path="/stores/item-master/edit/:id" element={<AddItem />} />
                    <Route path="/stores/uom" element={<UOMMaster />} />
                    <Route path="/stores/item-groups" element={<ItemGroupMaster />} />
                    <Route path="/stores/item-types" element={<ItemTypeMaster />} />
                    <Route path="/stores/grr" element={<GRNList />} />
                    <Route path="/stores/grr/add" element={<GRNForm />} />
                    <Route path="/stores/grr/view/:id" element={<GRNForm />} />
                    <Route path="/stores/grr/edit/:id" element={<GRNForm />} />
                    <Route path="/stores/grr/print/:id" element={<GRRPrintView />} />
                    <Route path="/stores/material-requisitions" element={<MaterialRequisitionList />} />
                    <Route path="/stores/material-requisitions/add" element={<MaterialRequisitionForm />} />
                    <Route path="/stores/material-requisitions/view/:id" element={<MaterialRequisitionForm />} />
                    <Route path="/stores/material-requisitions/edit/:id" element={<MaterialRequisitionForm />} />
                    <Route path="/stores/material-requisitions/print/:id" element={<MRPrintView />} />
                    <Route path="/stores/material-issues" element={<MaterialIssueList />} />
                    <Route path="/stores/material-issues/add" element={<MaterialIssueForm />} />
                    <Route path="/stores/material-issues/view/:id" element={<MaterialIssueForm />} />
                    <Route path="/stores/material-issues/edit/:id" element={<MaterialIssueForm />} />
                    <Route path="/inventory/ledger" element={<StockLedger />} />
                    <Route path="/stores/stock-statement" element={<StockStatement />} />
                    <Route path="/stores/warehouses" element={<WarehouseMaster />} />
                    <Route path="/stores/batches" element={<BatchMaster />} />
                    <Route path="/stores/day-wise-stock" element={<DayWiseStock />} />
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
                    <Route path="/stores/material-returns/edit/:id" element={<MaterialReturnForm />} />

                    {/* Delivery Challan */}
                    <Route path="/stores/delivery-challans" element={<DeliveryChallanList />} />
                    <Route path="/stores/delivery-challans/add" element={<DeliveryChallanForm />} />
                    <Route path="/stores/delivery-challans/prepare/:dcCode" element={<DcPreparationForm />} />
                    <Route path="/stores/delivery-challans/view/:id" element={<DcPreparationForm />} />
                    <Route path="/stores/delivery-challans/edit/:id" element={<DcPreparationForm />} />
                    <Route path="/stores/delivery-challans/repair/new" element={<RepairChallanForm />} />
                    <Route path="/stores/delivery-challans/repair/view/:id" element={<RepairChallanForm />} />
                    <Route path="/stores/delivery-challans/repair/edit/:id" element={<RepairChallanForm />} />
                    <Route path="/stores/delivery-challans/maintenance/new" element={<MaintenanceChallanForm />} />
                    <Route path="/stores/delivery-challans/maintenance/view/:id" element={<MaintenanceChallanForm />} />
                    <Route path="/stores/delivery-challans/maintenance/edit/:id" element={<MaintenanceChallanForm />} />

                    {/* Non Returnable Gate Pass (separate menu from Delivery Challans) */}
                    <Route path="/stores/non-returnable-gate-passes" element={<NonReturnableChallanList />} />
                    <Route path="/stores/non-returnable-gate-passes/new" element={<NonReturnableChallanForm />} />
                    <Route path="/stores/non-returnable-gate-passes/view/:id" element={<NonReturnableChallanForm />} />
                    <Route path="/stores/non-returnable-gate-passes/edit/:id" element={<NonReturnableChallanForm />} />

                    {/* Inward Register */}
                    <Route path="/stores/inward-registers" element={<InwardRegisterList />} />
                    <Route path="/stores/inward-registers/add" element={<InwardRegisterForm />} />
                    <Route path="/stores/inward-registers/edit/:id" element={<InwardRegisterForm />} />
                    <Route path="/stores/inward-registers/view/:id" element={<InwardRegisterForm />} />

                    {/* Jobwork & Sale on Approval Billing */}
                    <Route path="/stores/sale-approval" element={<DcBillingList />} />

                    {/* Billing (Tax Invoice) */}
                    <Route path="/stores/invoices" element={<BillingList />} />
                    <Route path="/stores/invoices/add" element={<BillingForm />} />
                    <Route path="/stores/invoices/view/:id" element={<BillingForm />} />
                    <Route path="/stores/invoices/edit/:id" element={<BillingForm />} />
                    <Route path="/stores/repair-billing" element={<RepairBilling />} />
                    <Route path="/stores/maintenance-billing" element={<MaintenanceBilling />} />
                    <Route path="/stores/misc-voucher-billing" element={<MiscVoucherBilling />} />
                    <Route path="/stores/cancellations" element={<Cancellations />} />
                    <Route path="/production" element={<ProductionDashboard />} />
                    <Route path="/production/orders" element={<ProductionOrderList />} />
                    <Route path="/production/machines" element={<MachineList />} />
                    <Route path="/production/machines/add" element={<MachineForm />} />
                    <Route path="/production/machines/view/:id" element={<MachineForm />} />
                    <Route path="/production/machines/edit/:id" element={<MachineForm />} />
                    <Route path="/production/daily-entry" element={<DailyEntryList />} />
                    <Route path="/production/daily-entry/add" element={<DailyEntryForm />} />
                    <Route path="/production/daily-entry/view/:id" element={<DailyEntryForm />} />
                    <Route path="/production/daily-entry/edit/:id" element={<DailyEntryForm />} />
                    <Route path="/production/downtime" element={<DowntimeList />} />
                    <Route path="/production/downtime/add" element={<DowntimeForm />} />
                    <Route path="/production/downtime/view/:id" element={<DowntimeForm />} />
                    <Route path="/production/downtime/edit/:id" element={<DowntimeForm />} />
                    <Route path="/planning" element={<PlanningDashboard />} />
                    <Route path="/planning/schedule" element={<ScheduleList />} />
                    <Route path="/planning/schedule/add" element={<ScheduleForm />} />
                    <Route path="/planning/schedule/view/:id" element={<ScheduleForm />} />
                    <Route path="/planning/schedule/edit/:id" element={<ScheduleForm />} />
                    <Route path="/planning/mrp" element={<MRPList />} />
                    <Route path="/planning/mrp/add" element={<MRPForm />} />
                    <Route path="/planning/mrp/view/:id" element={<MRPForm />} />
                    <Route path="/planning/mrp/edit/:id" element={<MRPForm />} />
                    <Route path="/planning/capacity" element={<CapacityList />} />
                    <Route path="/planning/capacity/add" element={<CapacityForm />} />
                    <Route path="/planning/capacity/view/:id" element={<CapacityForm />} />
                    <Route path="/planning/capacity/edit/:id" element={<CapacityForm />} />
                    <Route path="/engineering" element={<EngineeringDashboard />} />
                    <Route path="/engineering/categories" element={<CategoryMaster />} />
                    <Route path="/engineering/products" element={<ProductMasterList />} />
                    <Route path="/engineering/products/add" element={<ProductMasterForm />} />
                    <Route path="/engineering/products/view/:id" element={<ProductMasterForm />} />
                    <Route path="/engineering/products/edit/:id" element={<ProductMasterForm />} />
                    <Route path="/engineering/products/:id/structure" element={<AssemblyTree />} />
                    <Route path="/engineering/bom" element={<BOMList />} />
                    <Route path="/engineering/bom/add" element={<BOMForm />} />
                    <Route path="/engineering/bom/view/:id" element={<BOMForm />} />
                    <Route path="/engineering/bom/edit/:id" element={<BOMForm />} />
                    <Route path="/quality" element={<QualityDashboard />} />
                    <Route path="/quality/incoming" element={<InspectionList />} />
                    <Route path="/quality/process" element={<InspectionList />} />
                    <Route path="/quality/final" element={<InspectionList />} />
                    <Route path="/quality/inspections/add" element={<InspectionForm />} />
                    <Route path="/quality/inspections/view/:id" element={<InspectionForm />} />
                    <Route path="/quality/inspections/edit/:id" element={<InspectionForm />} />
                    <Route path="/quality/non-conformances" element={<NonConformanceList />} />
                    <Route path="/quality/non-conformances/add" element={<NonConformanceForm />} />
                    <Route path="/quality/non-conformances/view/:id" element={<NonConformanceForm />} />
                    <Route path="/quality/non-conformances/edit/:id" element={<NonConformanceForm />} />
                    <Route path="/marketing" element={<MarketingDashboard />} />
                    <Route path="/marketing/customers" element={<CustomerMaster />} />
                    <Route path="/marketing/customers/add" element={<AddCustomer />} />
                    <Route path="/marketing/customers/view/:id" element={<AddCustomer />} />
                    <Route path="/marketing/customers/edit/:id" element={<AddCustomer />} />
                    <Route path="/marketing/leads" element={<LeadList />} />
                    <Route path="/marketing/leads/add" element={<LeadForm />} />
                    <Route path="/marketing/leads/view/:id" element={<LeadForm />} />
                    <Route path="/marketing/leads/edit/:id" element={<LeadForm />} />
                    <Route path="/marketing/quotes" element={<QuotationList />} />
                    <Route path="/marketing/quotes/add" element={<QuotationForm />} />
                    <Route path="/marketing/quotes/view/:id" element={<QuotationForm />} />
                    <Route path="/marketing/quotes/edit/:id" element={<QuotationForm />} />
                    <Route path="/marketing/orders" element={<SalesOrderList />} />
                    <Route path="/marketing/orders/add" element={<SalesOrderForm />} />
                    <Route path="/marketing/orders/view/:id" element={<SalesOrderForm />} />
                    <Route path="/marketing/orders/edit/:id" element={<SalesOrderForm />} />
                    <Route path="/subcontract" element={<SubcontractDashboard />} />
                    <Route path="/subcontract/orders" element={<OrderList />} />
                    <Route path="/subcontract/orders/add" element={<OrderForm />} />
                    <Route path="/subcontract/orders/view/:id" element={<OrderForm />} />
                    <Route path="/subcontract/orders/edit/:id" element={<OrderForm />} />
                    <Route path="/subcontract/issue" element={<IssueList />} />
                    <Route path="/subcontract/issue/add" element={<IssueForm />} />
                    <Route path="/subcontract/issue/view/:id" element={<IssueForm />} />
                    <Route path="/subcontract/issue/edit/:id" element={<IssueForm />} />
                    <Route path="/subcontract/receipt" element={<ReceiptList />} />
                    <Route path="/subcontract/receipt/add" element={<ReceiptForm />} />
                    <Route path="/subcontract/receipt/view/:id" element={<ReceiptForm />} />
                    <Route path="/subcontract/receipt/edit/:id" element={<ReceiptForm />} />
                    <Route path="/maintenance" element={<MaintenanceDashboard />} />
                    <Route path="/maintenance/machines" element={<MaintenanceMachineList />} />
                    <Route path="/maintenance/machines/add" element={<MaintenanceMachineForm />} />

                    <Route path="/maintenance/machines/view/:id" element={<MaintenanceMachineForm />} />

                    <Route path="/maintenance/machines/edit/:id" element={<MaintenanceMachineForm />} />
                    <Route path="/maintenance/assets" element={<AssetList />} />
                    <Route path="/maintenance/assets/add" element={<AssetForm />} />
                    <Route path="/maintenance/assets/view/:id" element={<AssetForm />} />
                    <Route path="/maintenance/assets/edit/:id" element={<AssetForm />} />
                    <Route path="/maintenance/schedule" element={<MaintenanceScheduleList />} />
                    <Route path="/maintenance/schedule/add" element={<MaintenanceScheduleForm />} />
                    <Route path="/maintenance/schedule/view/:id" element={<MaintenanceScheduleForm />} />
                    <Route path="/maintenance/schedule/edit/:id" element={<MaintenanceScheduleForm />} />

                    {/* Departmental Reports */}
                    <Route path="/hr/reports" element={<Reports />} />
                    <Route path="/accounts/reports" element={<AccountsReports />} />
                    <Route path="/purchase/reports" element={<PurchaseReports />} />
                    <Route path="/purchase/daily-reports" element={<DailyReports />} />
                    <Route path="/purchase/job-orders" element={<JobOrderList />} />
                    <Route path="/purchase/job-orders/add" element={<JobOrderForm />} />
                    <Route path="/purchase/job-orders/view/:id" element={<JobOrderForm />} />
                    <Route path="/purchase/job-orders/edit/:id" element={<JobOrderForm />} />
                    <Route path="/purchase/pr-amendment" element={<PRAmendment />} />
                    <Route path="/purchase/requisitions/amend-compare/:id" element={<PRAmendmentCompare />} />

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
                    <Route path="/attendance-mod" element={<AttendanceModification />} />
                    <Route path="/hr-attendance" element={<HRAttendance />} />
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
