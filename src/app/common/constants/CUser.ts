export enum UserVerifyStatus {
  VERIFIED = 'VERIFIED', // Đã xác minh
  UN_VERIFIED_WITH_EMAIL = 'UN_VERIFIED_WITH_EMAIL', // Có email chưa xác thực
  UN_VERIFIED_WITHOUT_EMAIL = 'UN_VERIFIED_WITHOUT_EMAIL', // Chưa có email
}
