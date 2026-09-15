// backend/constants/permissions.js
// Central permission taxonomy. Controllers/routes reference these strings via
// requirePermission(); the user-management UI assigns them to roles/users.
// ADMIN always bypasses (see middleware/auth.js).
//
// HR/ERP permission STRING VALUES intentionally match the frontend taxonomy in
// frontend/src/constants/permissions.js so the same stored `user.permissions`
// array is enforced on both client and server.
const ERP_PERMISSIONS = {
  PURCHASE: {
    REQUISITION_VIEW: 'purchase.requisition.view',
    REQUISITION_CREATE: 'purchase.requisition.create',
    REQUISITION_APPROVE: 'purchase.requisition.approve',
    REQUISITION_DELETE: 'purchase.requisition.delete',
    ORDER_VIEW: 'purchase.order.view',
    ORDER_CREATE: 'purchase.order.create',
    ORDER_APPROVE: 'purchase.order.approve',
    ORDER_DELETE: 'purchase.order.delete',
    SUPPLIER_VIEW: 'purchase.supplier.view',
    SUPPLIER_MANAGE: 'purchase.supplier.manage',
    RETURN_CREATE: 'purchase.return.create',
  },
  STORES: {
    GRN_VIEW: 'stores.grn.view',
    GRN_POST: 'stores.grn.post',
    MISSUE_CREATE: 'stores.material_issue.create',
    MRETURN_CREATE: 'stores.material_return.create',
    STOCK_ADJUST: 'stores.stock.adjust',
    ITEM_MANAGE: 'stores.item.manage',
  },
};

const SETTINGS_PERMISSIONS = {
  MANAGE: 'SETTINGS_MANAGE',
};

const HR_PERMISSIONS = {
  PAYROLL_PROC: 'HR_PAYROLL_PROC',
  EMP_MASTER: 'HR_EMP_MASTER',
  ADD_EMP: 'HR_ADD_EMP',
  PHOTO: 'HR_PHOTO',
  PROFILE_APPROVE: 'HR_PROFILE_APPROVE',
  SHIFT_MASTER: 'HR_SHIFT_MASTER',
  HOLIDAY_MASTER: 'HR_HOLIDAY_MASTER',
  LEAVE_MASTER: 'HR_LEAVE_MASTER',
  ATT_ENTRY: 'HR_ATT_ENTRY',
  ATT_MOD: 'HR_ATT_MOD',
  SHIFT_SCHED: 'HR_SHIFT_SCHED',
  MUSTER: 'HR_MUSTER',
  OT_APP: 'HR_OT_APP',
  ATT_COLLECTOR: 'HR_ATT_COLLECTOR',
  ADVANCE: 'HR_ADVANCE',
  ESI_LEAVE: 'HR_ESI_LEAVE',
  PF_ACCOUNTING: 'HR_PAYROLL_PROC',
  TAX: 'HR_PAYROLL_PROC',
  LEAVE_APP: 'HR_LEAVE_APP',
  LEAVE_APPROVE: 'HR_LEAVE_APPROVE',
  ONDUTY: 'HR_ONDUTY',
  ONDUTY_APPROVE: 'HR_ONDUTY_APPROVE',
  TOUR: 'HR_TOUR',
  TOUR_APPROVE: 'HR_TOUR_APPROVE',
  SHIFT_CHG: 'HR_SHIFT_CHG',
  SHIFT_CHG_APPROVE: 'HR_SHIFT_CHG_APPROVE',
  WOFF_CHG: 'HR_WOFF_CHG',
  WOFF_CHG_APPROVE: 'HR_WOFF_CHG_APPROVE',
  RECRUITMENT: 'HR_RECRUITMENT',
  TRAINING: 'HR_TRAINING',
  PMS: 'HR_PMS',
  DISCIPLINARY: 'HR_DISCIPLINARY',
  EXIT: 'HR_EXIT',
  ATTENDANCE_REQUEST: 'HR_ATTENDANCE_REQUEST',
  ATTENDANCE_APPROVE: 'HR_ATTENDANCE_APPROVE',
  REPORTS: 'HR_REPORTS',
  REPORTS_EMP: 'HR_REPORTS_EMP',
  SETTINGS: 'HR_SETTINGS',
  MOD_HR: 'MOD_HR',
};

// Commonly grouped lists for convenience.
ERP_PERMISSIONS.ALL = Object.values(ERP_PERMISSIONS).flatMap((g) => Object.values(g));

module.exports = { ERP_PERMISSIONS, HR_PERMISSIONS, SETTINGS_PERMISSIONS };
