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
  LEAVE_APP: 'HR_LEAVE_APP',
  LEAVE_APPROVE: 'HR_LEAVE_APPROVE',
  ATT_ENTRY: 'HR_ATT_ENTRY',
  ATT_MOD: 'HR_ATT_MOD',
  PF_ACCOUNTING: 'HR_PAYROLL_PROC', // shares payroll permission
  TAX: 'HR_PAYROLL_PROC',           // shares payroll permission
};

// Commonly grouped lists for convenience.
ERP_PERMISSIONS.ALL = Object.values(ERP_PERMISSIONS).flatMap((g) => Object.values(g));

module.exports = { ERP_PERMISSIONS, HR_PERMISSIONS, SETTINGS_PERMISSIONS };
