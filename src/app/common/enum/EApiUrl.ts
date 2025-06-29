export enum USER_ENDPOINT {
  USER_INFO = 'api/v1/user/profile',
  UPDATE = 'api/v1/user/update',
  LOCK_ACCOUNT = 'api/v1/user/lock-account',
  UPDATE_MAIL = 'api/v1/user/update-mail',
  UPDATE_AVATAR = 'api/v1/user/update-avatar',
  SEND_VERIFY_MAIL = 'api/v1/user/verification',
  CHANGE_PASSWORD = "api/v1/user/change-pass",
  FORGET_PASSWORD = "api/v1/forget-password/send-mail",
  RESET_PASSWORD = "api/v1/forget-password/reset-password",
  LOGOUT = "api/v1/auth/logout",
  AUTO_LOGOUT = "api/v1/auth/auto-logout",
  VERIFY_MAIL = 'api/v1/user/verify-email',
  CHANGE_NEW_PW = 'api/v1/user/change-new-password',
}

export enum ROlE_ENDPOINT {
  SEARCH_LIST_ROLE = 'api/v1/role-management/search',
  GET_LIST_FUNCTION = 'api/v1/role-management/function-group',
  CREATE_ROLE = 'api/v1/role-management/save-role',
  UPDATE_ROLE = 'api/v1/role-management/update',
  CHECK_ROLE_NAME = "api/v1/role-management/check-role-name",
  GET_DETAILS_FUNC = 'api/v1/role-management/details/',
  GET_NUMBER_USER_IN_ROLE = 'api/v1/role-management/get-number-user-in-role',
  DELETE_ROLE = 'api/v1/role-management/delete',
  GET_LIST_ROLE = 'api/v1/role-management/list-role',
  SEARCH_LIST_USER_ROLE = 'api/v1/role-management/list-user-role',
  AUTO_COMPLETE = 'api/v1/role-management/auto-complete'
}

export enum LOGIN_ENDPOINT {
  LOGIN = 'api/v1/auth/login',
  REFESH_TOKEN = 'api/v1/auth/refresh',
}

export enum ORGANIZATION_ENDPOINT {
  SAVE_ORGANIZATION = 'api/v1/group-management/save-organizational-setup',
  //GET_LIST_MERCHANT = 'api/v1/group-management/get-list-merchant-x',
  GET_LIST_GROUPS = 'api/v1/group-management/get-list-groups',
  UPDATE_GROUP_NAME = 'api/v1/group-management/rename-group',
  ADD_GROUP = 'api/v1/group-management/add-groups',
  VALIDATE_BEFORE_DELETE = 'api/v1/group-management/validate-before-delete',
  DELETE_GROUP = 'api/v1/group-management/delete-group',
  MOVE_LIST_MERCHANT = 'api/v1/group-management/move-list-merchant',
}

export enum GROUP_ENDPOINT {
  GET_POINT_SALE = 'api/v1/query/get-point-sale'
}

export enum BUSINESS_ENDPOINT {
  GET_MERCHANT_DETAIL = 'api/v1/subMerchant/detail',
  GET_GROUP_FILTER = 'api/v1/group-management/filter-group',
  UPDATE_SUB_MERCHANT = 'api/v1/subMerchant/update',
  GET_LIST_PAYMENT_METHOD = 'api/v1/subMerchant/get-merchant-with-payment-method',
  GET_LIST_PAYMENT_METHOD_FILTER='api/v1/query/get-payment-method',
  CREATE_SUB_MERCHANT = 'api/v1/subMerchant/add',
  GEN_QR = 'api/v1/qr/get-qr-code'
}

export enum LOCATION_ENDPOINT {
  GET_PROVINCE = 'api/v1/location/get-province',
  GET_DISTRIC = 'api/v1/location/get-district',
  GET_COMMUNE = 'api/v1/location/get-commune'
}

export enum HR_ENDPOINT {
  GET_LIST_HR = 'api/v1/user/get-by-merchantId',
  CREATE_HR = 'api/v1/user-management/create',
  DETAIL = 'api/v1/user-management/detail',
  GET_ROLE_BY_USER_ID = 'api/v1/user-management/get-role-by-userId',
  GET_SUB = 'api/v1/user-management/get-sub',
  CHANGE_PASS_PERSONEL ='api/v1/user-management/change-pass-personel',
  GET_ROLE_BY_USER_LOGIN = 'api/v1/user-management/role',
  GET_GROUP_BY_USER_UPDATE='api/v1/user-management/group',
  UPDATE_HR='api/v1/user-management/update-personel'
}

export enum EXCEL_ENDPOINT {
  HISTORY_EXPORT = 'api/v1/excel/get-all-request',
  DOWNLOAD_EXCEL = 'api/v1/excel/download',
  EXPORT_TRANSACTION = 'api/v1/excel/export-excel-transaction',
  EXPORT_REFUND = 'api/v1/excel/export-excel-refund',
  EXPORT_REFUND_OLD = 'api/v1/excel/export-excel-refund-old'
}

export enum TRANSACTION_ENDPOINT {
  GET_LIST_TRANSACTION = 'api/v1/transaction/search',
  GET_DETAIL_TRANSACTION = 'api/v1/transaction/get-detail',
  GET_LIST_REFUND = 'api/v1/refund/search',
  GET_DETAIL_REFUND = 'api/v1/refund/get-detail'
}

export enum BANK_ENDPOINT {
  LIST_BANK = 'api/v1/query/get-issuing-organization'
}

export enum MERCHANT_ENDPOINT {
    LIST_MERCHANT = 'api/v1/subMerchant/filter'
}

export enum REFUND_ENDPOINT {
  REFUND = 'api/v1/refund/single',
  GET_INFO_REFUND = 'api/v1/refund/get-refund-info',
  GET_DOTP_STATUS = 'api/d-otp/v1.0/get-status-DOTP'
}

