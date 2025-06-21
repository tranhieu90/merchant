import { Routes } from '@angular/router';
import { InputDemoComponent } from './base/shared/input-demo/input-demo.component';
import { MButtonComponent } from './base/shared/m-button/m-button.component';
import { MCheckboxComponent } from './base/shared/m-checkbox/m-checkbox.component';
import { MDropdownComponent } from './base/shared/m-dropdown/m-dropdown.component';
import { MTabComponent } from './base/shared/m-tab/m-tab.component';
import { MToastComponent } from './base/shared/m-toast/m-toast.component';
import { authGuard } from './common/guards/auth.guard';
import { BusinessCreateComponent } from './component/business/business-management/business-create/business-create.component';
import { BusinessDetailComponent } from './component/business/business-management/business-detail/business-detail.component';
import { BusinessManagementComponent } from './component/business/business-management/business-management.component';
import { BusinessPaymentComponent } from './component/business/business-management/business-payment/business-payment.component';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { HumanResourceCreateComponent } from './component/human-resource-management/human-resource-create/human-resource-create.component';
import { HumanResourceDetailComponent } from './component/human-resource-management/human-resource-detail/human-resource-detail.component';
import { HumanResourceManagementComponent } from './component/human-resource-management/human-resource-management.component';
import { LoginComponent } from './component/login/login.component';
import { OrganizationManagementComponent } from './component/organization-management/organization-management.component';
import { CloneRoleComponent } from './component/role-management/clone-role/clone-role.component';
import { CreateRoleComponent } from './component/role-management/create-role/create-role.component';
import { DetailRoleComponent } from './component/role-management/detail-role/detail-role.component';
import { RoleManagementComponent } from './component/role-management/role-management.component';
import { DetailPaymentComponent } from './component/transaction-management/payment/detail-payment/detail-payment.component';
import { PaymentComponent } from './component/transaction-management/payment/payment.component';
import { CashbackComponent } from './component/transaction-management/cashback/cashback.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { HistoryExportComponent } from './component/transaction-management/history-export/history-export.component';
import { CashbackDetailComponent } from './component/transaction-management/cashback-detail/cashback-detail.component';
import { HumanResourceUpdateComponent } from './component/human-resource-management/human-resource-update/human-resource-update.component';
import { TimepickerComponent } from './base/shared/timepicker/timepicker.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'change-password', component: ChangePasswordComponent,
    // canActivate:[authGuard]
  },
  {
    path: 'demo-input', component: InputDemoComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'demo-selection', component: MCheckboxComponent,
    //canActivate: [authGuard]
  },
  {
    path: 'demo-button', component: MButtonComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'demo-dropdown', component: MDropdownComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'demo-toast', component: MToastComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'demo-tab', component: MTabComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'demo-checkbox', component: MCheckboxComponent,
    // canActivate: [authGuard]
  },
    {
    path: 'demo-timepicker', component: TimepickerComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'profile', component: UserProfileComponent,
    data: { breadcrumb: 'Hồ sơ người dùng' },
    canActivate: [authGuard]
  },
  {
    path: 'role',
    data: { breadcrumb: 'Quản lý vai trò' },
    children: [
      {
        path: '',
        component: RoleManagementComponent,
      },
      {
        path: 'create-role',
        component: CreateRoleComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Thêm mới vai trò',
          breadcrumb2: 'Chỉnh sửa vai trò'
        },
      },
      {
        path: 'detail-role', component: DetailRoleComponent,
        data: {
          breadcrumb: 'Chi tiết vai trò',
        },
        canActivate: [authGuard]
      },
      {
        path: 'clone-role', component: CloneRoleComponent,
        data: {
          breadcrumb: 'Sao chép vai trò',
        },
        canActivate: [authGuard]
      },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'business',
    data: { breadcrumb: 'Quản lý điểm kinh doanh' },
    children: [
      {
        path: '',
        component: BusinessManagementComponent,
      },
      {
        path: 'business-create',
        component: BusinessCreateComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Tạo mới điểm kinh doanh',
        },
      },
      {
        path: 'business-detail',
        component: BusinessDetailComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Xem chi tiết điểm kinh doanh',
        },
      },
      {
        path: 'business-payment',
        component: BusinessPaymentComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Cập nhật phương thức thanh toán',
        },
      },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'organization', component: OrganizationManagementComponent,
    data: {
      breadcrumb: 'Quản lý tổ chức',
    },
    canActivate: [authGuard]
  },
  {
    path: 'hr',
    data: { breadcrumb: 'Quản lý nhân sự' },
    children: [
      {
        path: '',
        component: HumanResourceManagementComponent,
      },
      {
        path: 'hr-detail', component: HumanResourceDetailComponent,
        data: {
          breadcrumb: 'Chi tiết nhân sự',
        },
        canActivate: [authGuard]
      },
      {
        path: 'hr-create',
        component: HumanResourceCreateComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Thêm mới nhân sự',
        },
      },
      {
        path: 'hr-update',
        // component: HumanResourceUpdateV2Component,
        component: HumanResourceUpdateComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Cập nhật nhân sự',
        },
      },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'transaction',
    data: { breadcrumb: 'Giao dịch' },
    children: [
      {
        path: 'payment', 
        component: PaymentComponent,
        data: {
          breadcrumb: 'Thanh toán',
        },
        //canActivate: [authGuard]
      },
      {
        path: 'payment-detail', component: DetailPaymentComponent,
        data: {
          breadcrumb: 'Chi tiết thanh toán',
        },
        //canActivate: [authGuard]
      },
      {
        path: 'cashback', 
        component: CashbackComponent,
        data: {
          breadcrumb: 'Hoàn trả',
        },
        //canActivate: [authGuard]
      },
      {
        path: 'cashback-detail', component: CashbackDetailComponent,
        data: {
          breadcrumb: 'Chi tiết hoàn trả',
        },
        //canActivate: [authGuard]
      },
      {
        path: 'history-export', 
        component: HistoryExportComponent,
        data: {
          breadcrumb: 'Lịch sử xuất file excel',
        },
        //canActivate: [authGuard]
      },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'dashboard', component: DashboardComponent,
    data: { breadcrumb: 'Trang chủ' },
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
