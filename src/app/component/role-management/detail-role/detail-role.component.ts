import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { GridViewModel } from '../../../model/GridViewModel';
import { TooltipModule } from 'primeng/tooltip';
import {
  DialogRoleComponent,
  DialogRoleModel,
} from '../dialog-role/dialog-role.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeRoleComponent } from '../change-role/change-role.component';
import * as _ from 'lodash';
import { ROlE_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { FormsModule } from '@angular/forms';
import { FunctionModel } from '../../../model/FunctionModel';
import { UserVerifyStatus } from '../../../common/constants/CUser';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { ToastService } from '../../../common/service/toast/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-detail-role',
  standalone: true,
  imports: [
    ButtonModule,
    TabViewModule,
    BadgeModule,
    MatCheckboxModule,
    NgFor,
    NgIf,
    GridViewComponent,
    TooltipModule,
    FormsModule,
    NgClass,
  ],
  templateUrl: './detail-role.component.html',
  styleUrl: './detail-role.component.scss',
})
export class DetailRoleComponent {
  assetPath = environment.assetPath;
  pageIndex = 0;
  pageSize = 10;
  totalUsers: number = 0;
  listFunction: any = [];
  listFunctionConvert: FunctionModel[] = [];
  roleId!: number;
  roleInfo: any;
  userInfo: any;
  viewPageIndex: number = 0;
  numberUserInRole: number = 0;
  roleNameChange: any;

  dataUsers: any = [];

  columnsUser: Array<GridViewModel> = [
    {
      name: 'userId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: (obj: any) => {
          return ['text-left'];
        },
        width: '150px',
      },
    },
    {
      name: 'fullName',
      label: 'HỌ VÀ TÊN',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: (obj: any) => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'isActive',
      label: 'TRẠNG THÁI',
      options: {
        width: '350px',
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: (obj: any) => {
          return ['text-left'];
        },
        customBodyRender: (value: any, obj: any) => {
          let msg;
          if (value === 0) {
            msg = "<span class='status lock'> Khóa </span>";
          } else {
            msg = "<span class='status success'> Hoạt động </span>";
          }
          return msg;
        },
      },
    },
  ];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private routeActive: ActivatedRoute,
    private api: FetchApiService,
    private auth: AuthenticationService,
    private toast: ToastService,
    private dialogCommon: DialogCommonService
  ) {
    this.routeActive.queryParams.subscribe((params) => {
      this.roleId = params['roleId'] || null;
      if (params['roleId']) {
        this.roleId = _.toNumber(params['roleId']);
      }
      this.getDetailFunc();
      this.getLstUsers();
    });
  }

  ngOnInit(): void {
    this.userInfo = this.auth.getUserInfo();
  }

  getDetailFunc() {
    this.api
      .get(ROlE_ENDPOINT.GET_DETAILS_FUNC + this.roleId)
      .subscribe((res) => {
        if (res) {
          this.defaultDataDetail(res['data']);
        }
      });
  }

  defaultDataDetail(val: any) {
    this.roleInfo = val;
    this.listFunction = val['functionGroupModels'];
    this.listFunctionConvert = this.convertLstFunc(this.listFunction, null);
  }

  getRoleType(type?: number | undefined) {
    switch (type) {
      case 1:
        return 'Vai trò thiết lập';
      case 2:
        return 'Vai trò quản trị';
      case 3:
        return 'Vai trò người dùng';
      default:
        return '';
    }
  }

  getRoleTypeClass(type?: number | undefined) {
    switch (type) {
      case 1:
        return 'config';
      case 2:
        return 'admin';
      case 3:
        return 'user';
      default:
        return '';
    }
  }

  doOpenPage(code?: string) {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        let roleId = this.roleId;
        if (code == 'createUser') {
          this.router.navigate(['/hr/hr-create'], {
            queryParams: { roleId: roleId },
          });
        } else {
          if (this.totalUsers > 0) {
            let dataDialog: DialogConfirmModel = new DialogConfirmModel();
            dataDialog.title =
              'Vai trò đang gán cho ' + this.totalUsers + ' nhân sự';
            dataDialog.message =
              'Việc thay đổi thông tin vai trò sẽ ảnh hưởng đến danh sách tính năng được sử dụng của nhân sự. Bạn có chắc chắn muốn tiếp tục cập nhật vai trò không?';
            dataDialog.buttonLabel = 'Xác nhận';
            dataDialog.icon = 'icon-warning';
            dataDialog.viewCancel = true;
            dataDialog.iconColor = 'icon warning';
            this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
              if (result) {
                this.router.navigate(['/role/create-role'], {
                  queryParams: { roleId: roleId },
                });
              }
            });
            return;
          } else {
            this.router.navigate(['/role/create-role'], {
              queryParams: { roleId: roleId },
            });
          }
        }
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.openDialogUnverifiedAccountAndEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.openDialogUnverifiedAccountAndNoEmail();
        break;
      default:
        console.warn('Trạng thái xác minh không hợp lệ:', verifyUser);
        break;
    }
  }

  doOpenPageClone() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        let roleId = this.roleId;
        this.router.navigate(['/role/clone-role'], {
          queryParams: { roleId: roleId },
        });
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.openDialogUnverifiedAccountAndEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.openDialogUnverifiedAccountAndNoEmail();
        break;
      default:
        console.warn('Trạng thái xác minh không hợp lệ:', verifyUser);
        break;
    }
  }

  convertLstFunc(list: any[], parentId: number | null): any[] {
    let result = list.filter((item) => item.parentId === parentId);

    result.forEach((item) => {
      let children = this.convertLstFunc(list, item.id);
      item.children = children;
      if (children.length > 0 && parentId === null) {
        const totalChild = this.getTotalChildren(item);
        const totalchildIsChoose = this.getTotalChildIsChoose(item);

        if (totalchildIsChoose > 0 && totalchildIsChoose < totalChild) {
          item.partiallyComplete = true;
        }
      }
    });

    return result;
  }

  getTotalChildren(parent: FunctionModel) {
    let total = 0;

    if (parent.children && parent.children.length > 0) {
      total += parent.children.length;

      parent.children.forEach((child) => {
        total += this.getTotalChildren(child);
      });
    }

    return total;
  }

  getTotalChildIsChoose(parent: FunctionModel) {
    let total = 0;

    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child) => {
        if (child.isChoose) {
          total += 1;
        }
        total += this.getTotalChildIsChoose(child);
      });
    }
    return total;
  }

  getLstUsers(pageInfo?: any) {
    let param = {
      roleId: this.roleId,
      pageIndex: pageInfo ? pageInfo['page'] : this.pageIndex,
      pageSize: pageInfo ? pageInfo['pageSize'] : this.pageSize,
    };
    //let buildParams = CommonUtils.buildParams(param);
    this.api
      .get(ROlE_ENDPOINT.SEARCH_LIST_USER_ROLE, param)
      .subscribe((res) => {
        this.dataUsers = res['data']['list'];
        this.totalUsers = res['data']['count'];
      });
  }

  onDeleteRole() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.handleDeleteRole();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.openDialogUnverifiedAccountAndEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.openDialogUnverifiedAccountAndNoEmail();
        break;
      default:
        console.warn('Trạng thái xác minh không hợp lệ:', verifyUser);
        break;
    }
  }

  handleDeleteRole() {
    let param = {
      roleId: this.roleId,
    };

    this.getLstUsers();
    // this.api.get(ROlE_ENDPOINT.GET_NUMBER_USER_IN_ROLE, param).subscribe(res => {
    //   this.numberUserInRole = res['data'] || 0;
    //   if (this.numberUserInRole > 0) {
    //     this.openDialogDeleteRoleHasUser(this.numberUserInRole);
    //   } else {
    //     this.openDialogDeleteRoleNoUser();
    //   }
    // });
  }

  openDialogDeleteRoleNoUser() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Xóa vai trò';
    dataDialog.message = `Khi bạn xoá vai trò sẽ không thể khôi phục dữ liệu được nữa. Bạn có chắc chắn muốn xoá vai trò <b> ${this.roleInfo?.name} </b> không?`;
    dataDialog.icon = 'icon-error';
    dataDialog.iconColor = 'error';
    dataDialog.buttonLabel = 'Xóa';
    dataDialog.viewCancel = true;
    dataDialog.buttonColor = 'error';

    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
        //call API
        const param = {
          currentRoleId: this.roleId,
        };
        this.api.post(ROlE_ENDPOINT.DELETE_ROLE, param).subscribe(
          (res) => {
            this.toast.showSuccess(`Đã xoá vai trò ${this.roleInfo?.name}`);
            this.router.navigate(['/role']);
          },
          (error) => {
            let message =
              error?.error?.soaErrorCode ||
              'Có lỗi xảy ra, vui lòng thử lại sau';
            this.toast.showError(message);
          }
        );
      }
    });
  }

  openDialogDeleteRoleHasUser(numberUserInRole: number) {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Xóa vai trò';
    dataDialog.message = `Vai trò <b>${this.roleInfo?.name}</b> đang được gán cho <b>(${numberUserInRole})</b> người dùng. Vui lòng chuyển đổi tất cả người dùng sang vai trò khác trước khi xóa.`;
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonLabel = 'Chuyển đổi vai trò';
    dataDialog.viewCancel = true;
    dataDialog.buttonColor = 'error';

    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
        this.deleteRoleWithChangeUser();
      }
    });
  }

  deleteRoleWithChangeUser() {
    //Chuyển đổi vai trò
    const dialogRef = this.dialog.open(ChangeRoleComponent, {
      panelClass: 'custom-dialog-panel-123',
      width: '600px',
      data: {
        roleInfo: this.roleInfo,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roleNameChange = result['roleNameChange'];
        const param = {
          currentRoleId: result['currentRole'],
          newRoleId: result['newRole'],
        };
        this.viewPageIndex = 1;
        this.api.post(ROlE_ENDPOINT.DELETE_ROLE, param).subscribe(
          (res) => {
            this.viewPageIndex = 2;
          },
          (error) => {
            this.viewPageIndex = 3;
          }
        );
      }
    });
  }

  redoDelete() {
    this.viewPageIndex = 0;
  }

  openDialogUnverifiedAccountAndEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message = `Hệ thống sẽ gửi liên kết xác thực tới <b>${this.userInfo?.emailChange}</b>.`;
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
      if (result != undefined) {
        this.router.navigate(['/profile']);
      } else {
      }
    });
  }

  openDialogUnverifiedAccountAndNoEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message =
      'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonRightLabel = 'Bổ sung email';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/profile']);
      } else {
      }
    });
  }
}
