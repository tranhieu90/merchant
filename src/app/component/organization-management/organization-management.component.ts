import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import _ from 'lodash';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../common/service/toast/toast.service';
import { DialogRoleComponent, DialogRoleModel } from '../role-management/dialog-role/dialog-role.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { UserVerifyStatus } from '../../common/constants/CUser';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { CreateOrganizationComponent } from './create-organization/create-organization.component';
import { UpdateOrganizationComponent } from './update-organization/update-organization.component';
import { ORGANIZATION_ENDPOINT, USER_ENDPOINT } from '../../common/enum/EApiUrl';
import { environment } from '../../../environments/environment';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { CommonUtils } from '../../base/utils/CommonUtils';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { UpdateUserComponent } from '../user-profile/update-user/update-user.component';
import { MERCHANT_RULES } from '../../base/constants/authority.constants';
import { VerifyUserService } from '../../common/service/verify/verify-user.service';

@Component({
  selector: 'app-organization-management',
  standalone: true,
  imports: [ButtonModule, InputTextModule, NgIf, CreateOrganizationComponent, UpdateOrganizationComponent],
  templateUrl: './organization-management.component.html',
  styleUrl: './organization-management.component.scss'
})

export class OrganizationManagementComponent {
  private MERCHANT_RULES = MERCHANT_RULES;
  assetPath = environment.assetPath;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isPermission: boolean = true;
  lstAreas: any = [];
  isAccountNotVerified: boolean = false;
  merchantName: string = '';
  hasRole?: boolean;

  constructor(
    private dialog: MatDialog,
    private toast: ToastService,
    private router: Router,
    private auth: AuthenticationService,
    private api: FetchApiService,
    private dialogCommon: DialogCommonService,
     private verify:VerifyUserService
  ) {
  }

  ngOnInit() {
    let userInfo = localStorage.getItem(environment.userInfo);
    this.hasRole = this.auth.apiTracker([MERCHANT_RULES.ORGANIZATION_CREATE]);
    if (userInfo) {
      this.merchantName = JSON.parse(userInfo)["merchantName"];
    }
    this.getLstAreas();
  }

  getLstAreas() {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.isUpdate = true;
          this.lstAreas = res.data;
        }
      }, (error: any) => {
        const errorData = error?.error || {};
        switch (errorData.soaErrorCode) {
          case 'ACCOUNT_ERROR_001':
            this.verify.openDialogUnverifiedAccountAndNoEmail();
            this.isAccountNotVerified = true;
            break;
          case 'ACCOUNT_ERROR_002':
            this.verify.openDialogUnverifiedAccountAndEmail();
            this.isAccountNotVerified = true;
            break;
          case 'GROUP_ERROR_019':
            break;
          default:
            if (errorData?.soaErrorCode !== 'GROUP_ERROR_007') {
              this.toast.showError(errorData?.soaErrorDesc);
            }
        }
      });
  }

  doCancelCreate() {
    this.isCreate = false;
  }

  doCreateSuccess() {
    this.isCreate = false;
    this.isUpdate = true;
    this.getLstAreas();
  }

  doCreateOrg() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.isCreate = true;
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.verify.openDialogUnverifiedAccountAndEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.verify.openDialogUnverifiedAccountAndNoEmail();
        break;
      default:
        console.warn("Trạng thái xác minh không hợp lệ:", verifyUser);
        break;
    }
  }

}
