export const MERCHANT_RULES = {
  // =================== Quyền Quản lý nhân sự ===================
  USER_MANAGER_DETAIL: '/api/v1/user-management/detail',
  USER_MANAGER_CREATE: '/api/v1/user-management/create',
  USER_MANAGER_UPDATE_PASS: '/api/v1/user-management/change-pass-personel',
  USER_MANAGER_UPDATE: '/api/v1/user-management/update-personel',

  // =================== Quyền thiết lập cơ cấu tổ chức ===================
  ORGANIZATION_CREATE: '/api/v1/group-management/save-organizational-setup',

  // =================== Quyền vai trò ===================
  ROLE_VIEW: '/api/v1/role-management/search',
  ROLE_CREATE: '/api/v1/role-management/save-role',
  ROLE_UPDATE: '/api/v1/role-management/update',
  ROLE_CREATE_USER: '/api/v1/user-management/create',

  // =================== Quyền điểm kinh doanh ===================
  BUSINESS_UPDATE: '/api/v1/subMerchant/update',
  BUSINESS_CREATE: '/api/v1/subMerchant/add',

   // =================== Quyền giao dịch ===================
   TRANS_EXPORT_EXCEL: '/api/v1/excel/export-excel-transaction',
   TRANS_REFUND: '/api/v1/refund/get-refund-info',
   TRANS_PRINT_INVOICE: 'print-invoice',
   TRANS_LIST: '/api/v1/transaction/search'
};