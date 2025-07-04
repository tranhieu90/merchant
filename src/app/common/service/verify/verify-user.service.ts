import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { DialogRoleComponent, DialogRoleModel } from '../../../component/role-management/dialog-role/dialog-role.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserComponent } from '../../../component/user-profile/update-user/update-user.component';
import { Router } from '@angular/router';
import { FetchApiService } from '../api/fetch-api.service';
import { USER_ENDPOINT } from '../../enum/EApiUrl';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { DialogCommonService } from '../dialog-common/dialog-common.service';

@Injectable({
  providedIn: 'root'
})
export class VerifyUserService {

  constructor(
    private router: Router,
    private api: FetchApiService,
    private dialog: MatDialog,
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService,) { }

  openDialogUnverifiedAccountAndEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message = `Hệ thống sẽ gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(this.auth?.getUserInfo()?.emailChange)}</b>.`;
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonLeftLabel = 'Thay đổi email';
    dataDialog.buttonRightLabel = 'Xác thực email';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.verifyEmail();
      } else {
        this.updateEmail();
      }
    });
  }

  openDialogUnverifiedAccountAndNoEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message =
      'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
    dataDialog.icon = 'icon-warning';
    dataDialog.hiddenButtonLeft = true;
    dataDialog.iconColor = 'warning';
    dataDialog.buttonRightLabel = 'Bổ sung email';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateEmail();
      } else {
      }
    });
  }

  updateEmail() {
    this.handleDevelopAfter();
    return;
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '600px',
      panelClass: 'dialog-update-user',
      data: {
        title: 'Cập nhật email',
        type: 'email',
        isEmailInfo: true,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/profile']);
      }
    })
  }

  verifyEmail() {
    this.api.post(USER_ENDPOINT.SEND_VERIFY_MAIL).subscribe(res => {
      let content = `Chúng tôi vừa gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(this.auth?.getUserInfo()?.emailChange)}</b>, vui lòng kiểm tra email và làm theo hướng dẫn để hoàn tất xác thực tài khoản.`
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Hệ thống đã gửi liên kết xác thực';
      dataDialog.message = content;
      dataDialog.buttonLabel = 'Tôi đã hiểu';
      dataDialog.icon = 'icon-mail';
      dataDialog.iconColor = 'icon info';
      dataDialog.viewCancel = false;
      const dialogRef = this.dialogCommon.openDialogInfo(dataDialog);
      dialogRef.subscribe(res => {
        this.router.navigate(['/profile']);
      })
    })
  }

  handleDevelopAfter() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Lỗi tính năng';
    dataDialog.message = 'Tính năng đang trong giai đoạn phát triển.';
    dataDialog.buttonLabel = 'Thử lại';
    dataDialog.icon = 'icon-warning';
    dataDialog.width = '500px'
    dataDialog.iconColor = 'icon warning';
    dataDialog.viewCancel = false;
    dataDialog.buttonLabel = 'Tôi đã hiểu'
    this.dialogCommon.openDialogInfo(dataDialog)
  }
}