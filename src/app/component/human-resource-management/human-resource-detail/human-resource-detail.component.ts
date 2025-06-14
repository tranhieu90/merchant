import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatStep, MatStepper, MatStepperIcon } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';
import { Button } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { environment } from '../../../../environments/environment';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import {
  GROUP_ENDPOINT,
  HR_ENDPOINT,
  ROlE_ENDPOINT,
} from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { AreaModel } from '../../../model/AreaModel';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { GridViewModel } from '../../../model/GridViewModel';
import { IFuntionGroup } from '../../../model/ma/funtion-group.model';
import {
  IGroupList,
  IPersonelDetail,
  IRolePersonel,
} from '../../../model/ma/personel.model';
import { AreaItemComponent } from '../../organization-management/area-item/area-item.component';
import { GenPasswordComponent } from '../gen-password/gen-password.component';
import { FunctionModel } from '../../../model/FunctionModel';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import moment from 'moment';
import { fomatAddress } from '../../../common/helpers/Ultils';
import { TooltipModule } from 'primeng/tooltip';
import { DirectiveModule } from '../../../base/module/directive.module';
import { MERCHANT_RULES } from '../../../base/constants/authority.constants';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-human-resource-detail',
  standalone: true,
  imports: [
    Button,
    TabViewModule,
    MatCheckbox,
    NgForOf,
    NgIf,
    FormsModule,
    NgClass,
    GridViewComponent,
    AreaItemComponent,
    MatButton,
    MatStep,
    MatStepper,
    MatStepperIcon,
    MatProgressSpinnerModule,
    TooltipModule,
    MatTooltipModule,
    DirectiveModule,
  ],
  templateUrl: './human-resource-detail.component.html',
  styleUrl: './human-resource-detail.component.scss',
})
export class HumanResourceDetailComponent implements OnInit {
  readonly MERCHANT_RULES = MERCHANT_RULES;
  personDetail?: IPersonelDetail;
  rolePesonel?: any;
  subMerchantList?: any;
  assetPath = environment.assetPath;
  listFunctionConvert: FunctionModel[] = [];
  changePassInfo: any;
  isUpdatePassSuccess?: boolean = true;
  pageIndex = 1;
  pageSize = 10;
  totalItem: number = 0;
  isLoading = false;
  hasMoreData = true;
  userInfo?: any;
  columns: Array<GridViewModel> = [
    {
      name: 'merchantId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return '#' + value;
        },
      },
    },
    {
      name: 'merchantBizName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'formatAddress',
      label: 'ĐỊA CHỈ',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
  ];
  lstAreas: AreaModel[] = [];
  lstAreaByOrder: AreaModel[] = [];
  areaActive: AreaModel = new AreaModel();
  userId: any;
  changePasswordStatus: number = 0;
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private dialogCommon: DialogCommonService
  ) {
    this.routeActive.queryParams.subscribe((params) => {
      this.userId = params['userId'] || null;
      if (params['userId']) {
        this.userId = _.toNumber(params['userId']);
      } else {
      }
    });
  }

  ngOnInit() {
    this.userInfo = this.auth.getUserInfo();
    this.getDetail();
  }

  buildGroupTree(groups: IGroupList[]): AreaModel[] {
    const groupMap = new Map<number, AreaModel>();
    const roots: AreaModel[] = [];

    for (const group of groups) {
      groupMap.set(group.id, {
        id: group.id,
        groupName: group.groupName,
        children: [],
        parentId: group.parentId ?? null,
        name: undefined,
        level: group.level ?? 0,
        lstMerchant: [],
      });
    }

    for (const group of groups) {
      const node = groupMap.get(group.id)!;
      roots.push(node);
    }

    return roots;
  }

  // convertLstFunc(list: FunctionModel[], parentId?: number | null): any[] {
  //   let result = list.filter(item => item.parentId === parentId);

  //   result.forEach(item => {
  //     let children = this.convertLstFunc(list, item.id);
  //     item.children = children;
  //   });

  //   return result;
  // }

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

  convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
    let result = list.filter((item) => item.parentId === parentId);

    result.forEach((item) => {
      let children = this.convertLstAreaByOrder(list, item.id);
      item.children = children;
    });

    return result;
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

  doActiveArea(area: AreaModel) {
    this.areaActive = area;
    if (area.children.length === 0) {
      this.getLstMerchant(area.id);
    }
  }

  getLstMerchant(areaId?: any) {
    let dataReq = {
      groupIdList: [areaId],
      status: '',
      methodId: [],
      mappingKey: '',
    };

    let param = {
      page: 1,
      size: 1000,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api
      .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
      .subscribe(
        (res: any) => {
          if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
            this.subMerchantList = res['data']['subInfo'];
            this.subMerchantList = res['data']['subInfo'].map((item: any) => ({
              ...item,
              formatAddress: fomatAddress([
                item.address,
                item.communeName,
                item.districtName,
                item.provinceName,
              ]),
            }));
          } else {
            this.subMerchantList = [];
          }
        },
        (error: any) => {
          this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.');
        }
      );
  }

  openChangeLockUser() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = `${
      this.personDetail?.isActive == 0 ? 'Mở khóa nhân sự' : 'Khóa nhân sự'
    }`;
    dataDialog.message = `${
      this.personDetail?.isActive == 0
        ? 'Cân nhắc kiểm tra thông tin phân quyền và tổ chức của nhân sự để không ảnh hưởng đến hoạt động của doanh nghiệp. Bạn có chắc chắn muốn mở khoá nhân sự không?'
        : 'Nhân sự bị khoá sẽ không thể truy cập vào hệ thống. Bạn có chắc chắn muốn khoá nhân sự không?'
    }`;
    dataDialog.icon = `${
      this.personDetail?.isActive == 0 ? 'icon-lock' : 'icon-lock'
    }`;
    dataDialog.viewCancel = true;
    dataDialog.iconColor = 'icon warning';
    dataDialog.buttonLabel = `${
      this.personDetail?.isActive == 1 ? 'Mở khóa' : 'Khóa'
    }`;
    dataDialog.width = '30%';
    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
        if (this.personDetail?.isActive == 1) {
          this.openDialogBusinessUnActive();
        }
      }
    });
  }

  openDialogBusinessUnActive() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Điểm kinh doanh không hoạt động';
    dataDialog.message = 'Vui lòng chọn tổ chức mới cho nhân sự';
    dataDialog.icon = 'icon-warning';
    dataDialog.viewCancel = true;
    dataDialog.iconColor = 'icon warning';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.width = '23,5%';
    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
      }
    });
  }

  getDetail() {
    this.api.get(HR_ENDPOINT.DETAIL, { userId: this.userId }).subscribe(
      (res) => {
        this.personDetail = res?.data;
        this.getDetailFunc(this.personDetail?.roleId!);
        if (
          !!this.personDetail?.groupList &&
          this.personDetail?.groupList?.length > 0
        ) {
          const treeData = this.buildGroupTree(this.personDetail.groupList);
          this.lstAreas = treeData;
          this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
        } else {
          // if(this.personDetail?.orgType === 2) {
          this.api
            .post(HR_ENDPOINT.GET_SUB, {
              userId: this.userId,
              page: 1,
              size: 10,
            })
            .subscribe((res) => {
              this.subMerchantList = res['data']['getPushSubInfos'];
              this.subMerchantList = res['data']['getPushSubInfos'].map(
                (item: any) => ({
                  ...item,
                  formatAddress: fomatAddress([
                    item.address,
                    item.communeName,
                    item.districtName,
                    item.provinceName,
                  ]),
                })
              );
            });
        }
      },
      () => {
        this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    );
  }

  getDetailFunc(roleId: number) {
    this.api.get(ROlE_ENDPOINT.GET_DETAILS_FUNC + roleId).subscribe((res) => {
      if (res) {
        this.rolePesonel = res.data;
        this.listFunctionConvert = this.convertLstFunc(
          res?.data?.functionGroupModels,
          null
        );
      }
    });
  }

  // getRoleDetail() {
  //   this.api.get(ROlE_ENDPOINT.GET_DETAILS_FUNC, { userId: this.userId }).subscribe(res => {
  //     this.rolePesonel = res?.data;
  //     if (this.rolePesonel?.function) {
  //       this.setSelectedItem(this.listFunctionConvert);
  //       this.updateFunctionSelectionStateList(this.listFunctionConvert);
  //     }
  //   }, () => {
  //     this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
  //   });
  // }

  doSearch(pageInfo?: any) {
    this.isLoading = true;
    let params: any = {
      page: this.pageIndex,
      size: this.pageSize,
      userId: this.userId,
    };

    this.api.post(HR_ENDPOINT.GET_SUB, params).subscribe((res) => {
      if (res?.data?.getPushSubInfos) {
        this.subMerchantList.push(res?.data?.getPushSubInfos);
      }
      this.hasMoreData = false;
      this.isLoading = false;
    });
  }

  onScroll(event: any) {
    const offset = event.target.scrollTop + event.target.clientHeight;
    const height = event.target.scrollHeight;
    if (offset === height && !this.isLoading && this.hasMoreData) {
      this.pageIndex++;
      this.doSearch();
    }
  }

  // getFuntionGroup() {
  //   this.api.get(ROlE_ENDPOINT.GET_LIST_FUNCTION).subscribe(res => {
  //     this.listFunctionConvert = this.convertLstFunc(res?.data, null);
  //     this.getRoleDetail();

  //   }, () => {
  //     this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
  //   });
  // }

  setSelectedItem(groups: FunctionModel[]) {
    groups.forEach((g) => {
      if (g.children.length > 0) {
        this.setSelectedItem(g.children);
      }
      const existGroup = this.rolePesonel?.function?.some(
        (rp: any) => rp.functionId === g.id
      );
      if (existGroup) {
        g.isChoose = true;
      } else {
        g.isChoose = false;
      }
    });
  }

  updateFunctionSelectionStateList(list: FunctionModel[]): void {
    for (const node of list) {
      this.updateFunctionSelectionState(node);
    }
  }

  private updateFunctionSelectionState(node: FunctionModel): void {
    if (!node.children || node.children.length === 0) return;

    for (const child of node.children) {
      this.updateFunctionSelectionState(child);
    }

    const total = node.children.length;
    const selected = node.children.filter((c) => c.isChoose).length;

    node.isChoose = selected === total;
    node.partiallyComplete = selected > 0 && selected < total;
  }

  openGenNewPassword() {
    const dialogRef = this.dialog.open(GenPasswordComponent, {
      panelClass: 'dialog-gen-pass',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.actionType) {
        this.changePasswordStatus = 1;
        this.api
          .postEncrypted(HR_ENDPOINT.CHANGE_PASS_PERSONEL, {
            userId: this.userId,
            password: result?.pass,
          })
          .subscribe(
            (res) => {
              this.changePassInfo = res?.data;
            },
            () => {
              this.isUpdatePassSuccess = false;
            }
          );
        // this.openConfirmChangePassword(result?.pass);
      }
    });
  }

  openConfirmChangePassword() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Cấp lại mật khẩu';
    dataDialog.message =
      'Mật khẩu hiện tại sẽ vô hiệu hoá và bắt buộc phải sử dụng mật khẩu mới để truy cập vào hệ thống. Bạn có chắc chắn muốn cấp lại mật khẩu cho nhân sự không?';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.icon = 'icon-change_password';
    dataDialog.viewCancel = true;
    dataDialog.iconColor = 'icon warning';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.width = '30%';
    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
        // this.changePasswordStatus = 1;
        // this.api.postEncrypted(HR_ENDPOINT.CHANGE_PASS_PERSONEL, { userId: this.userId, password: pass }).subscribe(res => {
        //   this.changePassInfo = res?.data
        // }, () => {
        //   this.isUpdatePassSuccess = false;
        // });
        this.openGenNewPassword();
      }
    });
  }

  doUpdateHuman() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Cập nhật nhân sự';
    dataDialog.message =
      'Việc thay đổi sẽ ảnh hưởng đến quyền truy cập của nhân sự. Bạn có chắc chắn muốn cập nhật nhân sự không?';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.icon = 'icon-warning';
    dataDialog.viewCancel = true;
    dataDialog.iconColor = 'icon warning';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.width = '30%';
    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
        this.router.navigate(['hr/hr-update'], {
          state: {
            dataInput: {
              groupList: this.personDetail?.groupList,
              roleId: this.personDetail?.roleId,
              userId: this.personDetail?.id,
              masterId:
                this.personDetail?.orgType === 0
                  ? this.userInfo?.merchantId
                  : 0,
              selectedMerchant:
                this.subMerchantList?.length === 1
                  ? this.subMerchantList[0].merchantId
                  : undefined,
              orgType: this.personDetail?.orgType,
            },
          },
        });
      }
    });
  }

  reloadChangePass() {
    window.location.reload();
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return moment(date).isValid() ? moment(date).format('DD/MM/YYYY') : '';
  }
}
