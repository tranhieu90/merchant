import {NgClass, NgFor, NgIf} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {InputTextModule} from 'primeng/inputtext';
import {MultiSelectModule} from 'primeng/multiselect';
import {GridViewComponent} from '../../../base/shared/grid-view/grid-view.component';
import {GridViewModel} from '../../../model/GridViewModel';
import {DialogSettingComponent} from './dialog-setting/dialog-setting.component';
import {MatDialog} from '@angular/material/dialog';
import moment from 'moment';
import {environment} from '../../../../environments/environment';
import {Router} from '@angular/router';
import {InputNumberModule} from 'primeng/inputnumber';
import {DialogConfirmModel} from '../../../model/DialogConfirmModel';
import {DialogCommonService} from '../../../common/service/dialog-common/dialog-common.service';
import {
  BANK_ENDPOINT,
  BUSINESS_ENDPOINT, EXCEL_ENDPOINT,
  MERCHANT_ENDPOINT,
  ROlE_ENDPOINT,
  TRANSACTION_ENDPOINT, USER_ENDPOINT
} from '../../../common/enum/EApiUrl';
import {FetchApiService} from '../../../common/service/api/fetch-api.service';
import {ToastService} from '../../../common/service/toast/toast.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {TreeSelectModule} from 'primeng/treeselect';
import {CommonUtils} from '../../../base/utils/CommonUtils';
import {DialogRoleComponent, DialogRoleModel} from '../../role-management/dialog-role/dialog-role.component';
import {UpdateUserComponent} from '../../user-profile/update-user/update-user.component';
import {AuthenticationService} from '../../../common/service/auth/authentication.service';
import {UserVerifyStatus} from '../../../common/constants/CUser';
import {InputCommon} from '../../../common/directives/input.directive';
import {MatBadge} from '@angular/material/badge';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ButtonModule, CalendarModule, InputTextModule, MultiSelectModule, NgIf, NgClass, GridViewComponent, InputNumberModule, FormsModule, DropdownModule, ReactiveFormsModule, TreeSelectModule, InputCommon, MatBadge],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  assetPath = environment.assetPath;
  statusOptions: any = [];
  bankOptions: any[] = [];
  paymentMethodOptions: any = [{name: 'Tất cả', code: null}];
  merchantOptions: any = [];
  groupOptions: any = [];
  isSearch: boolean = true;
  isFilter: boolean = false;
  dataTable: any = [];
  lstColumnShow: string[] = [
    'paymentContent',
    'ftCode',
    'transactionCode'
  ];
  pageIndex = 1;
  pageSize = 10;
  totalItem: number = 0;
  totalTrans: number = 0;
  totalAmount: number = 0;
  lastClickedGroup: any = null;
  maxDate: any = null;
  merchantId: any = null;

  searchCriteria: {
    transactionCode: string | null;
    ftCode: string | null;
    orderCode: string | null;
    identifierCode: string | null;
    paymentAccountName: string | null;
    accountNumber: string | null;
    paymentAmount: number | null;
    dateRange: Date[] | [];
  } = {
    transactionCode: null,
    ftCode: null,
    orderCode: null,
    identifierCode: null,
    paymentAccountName: null,
    accountNumber: null,
    paymentAmount: null,
    dateRange: [],
  };

  // 2. Đối tượng lưu trữ dữ liệu lọc (từ box-filter)
  filterCriteria: {
    selectedStatuses: string[];
    selectedPaymentMethod: string | null;
    selectedBanks: string | null;
    selectedGroups: any[];
    selectedMerchants: string[];
  } = {
    selectedStatuses: [],
    selectedPaymentMethod: null,
    selectedBanks: null,
    selectedGroups: [],
    selectedMerchants: []
  };

  action: any = [
    {
      icon: 'icon-eye_on',
      title: 'Xem chi tiết',
      doAction: (item: any) => {
        this.doDetail(item);
      },
    },
  ]

  get columns(): Array<GridViewModel> {
    return [
      {
        name: 'transTime',
        label: 'Ngày giao dịch',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          width: "131px",
          minWidth: "131px"
        }
      },
      ...(this.lstColumnShow.includes("transactionCode")
          ? [
            {
              name: 'transactionNumber',
              label: 'Mã giao dịch',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
                width: "154px",
                minWidth: "154px"
              }
            }
          ] : []
      ),
      {
        name: 'merchantName',
        label: 'Điểm kinh doanh',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          width: "170px",
          minWidth: "170px"
        }
      },
      {
        name: 'amount',
        label: 'Số tiền (₫)',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          customBodyRender: (value: any) => {
            return this.formatMoney2(value);
          },
          width: "139px",
          minWidth: "139px"
        }
      },
      ...(this.lstColumnShow.includes("paymentContent")
          ? [
            {
              name: 'orderInfo',
              label: 'Nội dung thanh toán',
              options: {
                customCss: (obj: any) => {
                  return ['text-left', 'mw-180'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                width: "174px",
                minWidth: "174px"
              }
            },
          ] : []
      ),
      {
        name: 'orderRef',
        label: 'Mã định danh',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          width: "121px",
          minWidth: "121px"
        }
      },
      ...(this.lstColumnShow.includes("orderCode")
          ? [
            {
              name: 'orderId',
              label: 'Mã đơn hàng',
              options: {
                customCss: (obj: any) => {
                  return ['text-left'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                width: "121px",
                minWidth: "121px"
              }
            }
          ] : []
      ),
      {
        name: 'status',
        label: 'Trạng thái',
        options: {
          customCss: (obj: any) => {
            return ['text-center'];
          },
          customCssHeader: () => {
            return ['text-center'];
          },
          customBodyRender: (value: any) => {
            switch (value) {
              case '00':
                return "<span class='status success'> Thành công </span>";
              case '03':
                return "<span class='status fail'> Không thành công </span>";
              case '20':
                return "<span class='status wait'> Chờ tra soát </span>";
              default:
                return '';
            }
          },
          width: "169px",
          minWidth: "169px"
        },

      },
      {
        name: 'methodName',
        label: 'Phương thức thanh toán',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          width: "226px",
          minWidth: "226px"
        }
      },
      ...(this.lstColumnShow.includes("ftCode")
          ? [
            {
              name: 'txnReference',
              label: 'Mã FT giao dịch',
              options: {
                customCss: (obj: any) => {
                  return ['text-left'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                width: "134px",
                minWidth: "134px"
              }
            },
          ] : []
      ),
      {
        name: 'debitAccount',
        label: 'Tài khoản/Thẻ thanh toán',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          customBodyRender: (obj: any, params: any) => {

            const bankName = params.issuerName || '';
            const accountNumber = params.debitAccount || '';
            const accountHolder = params.debitName || '';

            return `
              <div class="paragraph-m-semibold mb-1">${bankName}</div>
              <div class="paragraph-s-regular color-text-neutral-sub">${accountNumber}</div>
              <div class="paragraph-s-regular color-text-neutral-sub">${accountHolder}</div>
            `;
          },
          width: "226px",
          minWidth: "226px"
        }
      },
      ...(this.lstColumnShow.includes("businessAccount")
          ? [
            {
              name: 'creditAccount',
              label: 'Tài khoản doanh nghiệp',
              options: {
                customCss: (obj: any) => {
                  return ['text-left'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                width: "191px",
                minWidth: "191px"
              }
            }
          ] : []
      ),
      ...(this.lstColumnShow.includes("keyCode")
          ? [
            {
              name: 'terminalId',
              label: 'Mã key dịch vụ',
              options: {
                customCss: (obj: any) => {
                  return ['text-left'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                width: "129px",
                minWidth: "129px"
              }
            }
          ] : []
      ),
      ...(this.lstColumnShow.includes("expense")
          ? [
            {
              name: 'feeAmount',
              label: 'Phí giao dịch (₫)',
              options: {
                customCss: (obj: any) => {
                  return ['text-left'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                customBodyRender: (value: any) => {
                  return this.formatMoney2(value);
                },
                width: "135px",
                minWidth: "135px"
              }
            }
          ] : []
      ),
      ...(this.lstColumnShow.includes("vat")
          ? [
            {
              name: 'feeVat',
              label: 'VAT (₫)',
              options: {
                customCss: (obj: any) => {
                  return ['text-left'];
                },
                customCssHeader: () => {
                  return ['text-left'];
                },
                customBodyRender: (value: any) => {
                  return this.formatMoney2(value);
                },
                width: "78px",
                minWidth: "78px"
              }
            }
          ] : []
      )
    ];
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private dialogCommon: DialogCommonService,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
  ) {

  }

  ngOnInit(): void {

    const today = new Date();

    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0);

    this.searchCriteria.dateRange = [startDate, endDate];

    this.statusOptions = [
      {name: 'Thành công', code: '00'},
      {name: 'Không thành công', code: '03'},
      {name: 'Chờ tra soát', code: '20'},
    ];

    this.getMerchantOptions();

    this.getDataGroup();

    this.getListBank();

    this.getLstPaymentMethod();

    this.onSearch();

  }

  getLstPaymentMethod() {
    this.api.get(BUSINESS_ENDPOINT.GET_LIST_PAYMENT_METHOD).subscribe(res => {
      if (res['data']) {
        const allOption = {paymentMethodId: 'ALL', paymentMethodName: 'Tất cả '};
        this.paymentMethodOptions = [allOption, ...res['data']['paymentMethodList']];
      }
    }, (error) => {
      this.paymentMethodOptions = [];
      this.toast.showError('Lấy phương thức thanh toán xảy ra lỗi')
    });
  }

  getListBank() {
    this.api.get(BANK_ENDPOINT.LIST_BANK, null).subscribe(res => {
        this.bankOptions = res['data'];
      },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData.soaErrorDesc);
      });
  }

  getMerchantOptions(groupIdList?: any) {

    let param = {
      status: null,
      groupIdList: groupIdList || null,
      page: 1,
      size: 999999999
    };
    let buildParams = CommonUtils.buildParams(param);

    this.api.get(MERCHANT_ENDPOINT.LIST_MERCHANT, buildParams).subscribe(res => {
        this.merchantOptions = res['data']['subInfo'] || [];
      },
      error => {
        const errorData = error?.error || {};
        this.paymentMethodOptions = [];
        this.toast.showError(errorData.soaErrorDesc);
      });
  }


  onSearch(pageInfo?: any) {
    if (pageInfo) {
      this.pageIndex = pageInfo["page"] || 1;
      this.pageSize = pageInfo["pageSize"]
    } else {
      this.pageIndex = 1;
    }

    let groupIdArray = this.filterCriteria?.selectedGroups?.filter(item => item?.id !== this.merchantId)?.map(item => item?.id);

    if (this.filterCriteria?.selectedMerchants?.length > 0) {
      groupIdArray = [];
    }

    let param = {
      fromDate: this.searchCriteria?.dateRange[0] ? moment(this.searchCriteria?.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: this.searchCriteria?.dateRange[1] ? moment(this.searchCriteria?.dateRange[1]).format('DD/MM/YYYY HH:mm:ss') : null,

      txnReference: this.searchCriteria.ftCode || null,
      orderId: this.searchCriteria?.orderCode || null,
      amount: this.searchCriteria?.paymentAmount || null,
      debitName: this.searchCriteria?.paymentAccountName || null,
      debitAccount: this.searchCriteria?.accountNumber || null,
      orderReference: this.searchCriteria?.identifierCode || null,
      transactionNumber: this.searchCriteria?.transactionCode || null,

      status: this.filterCriteria?.selectedStatuses || [],
      paymentMethodId: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],

      groupIdArray: groupIdArray,
      issuerCode: this.filterCriteria?.selectedBanks || null,

      transactionChannel: null,

      page: this.pageIndex,
      size: this.pageSize,

      masterId: this.merchantId,

    }

    this.api.post(TRANSACTION_ENDPOINT.GET_LIST_TRANSACTION, param).subscribe(res => {
        this.dataTable = res['data']['content'];
        this.totalItem = res['data']['paging']['total'];
        this.totalTrans = res['data']['totalRecord'];
        this.totalAmount = res['data']['totalAmount'];
      },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData.soaErrorDesc);

      });
  }

  onSetting() {
    const dialogRef = this.dialog.open(DialogSettingComponent, {
      width: '500px',
      data: this.lstColumnShow,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((lstColumnShow: any) => {
      if (lstColumnShow != undefined) {
        this.lstColumnShow = lstColumnShow;
      }
    })
  }

  doDetail(item: any) {
    this.router.navigate(['/transaction/payment-detail'], {
      queryParams: {
        id: item['id'],
        merchantId: item['merchantId'],
        transTime: item['transTime']
      }
    });
  }

  formatMoney(value: any): string {
    if (value == null) return '0 đ';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ';
  }

  formatMoney2(value: any): string {
    if (value == null) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  onExport() {

    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.exportExcel();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.openDialogUnverifiedAccountHasEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.openDialogUnverifiedAccountNoEmail();
        break;
      default:
        console.warn("Trạng thái xác minh không hợp lệ:", verifyUser);
        break;
    }
  }

  exportExcel() {
    const groupIdArray = this.filterCriteria?.selectedGroups?.filter(item => item?.id !== this.merchantId)?.map(item => item?.id);

    let param = {
      fromDate: this.searchCriteria?.dateRange[0] ? moment(this.searchCriteria?.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: this.searchCriteria?.dateRange[1] ? moment(this.searchCriteria?.dateRange[1]).format('DD/MM/YYYY HH:mm:ss') : null,

      transactionReference: this.searchCriteria.ftCode || null,
      orderId: this.searchCriteria?.orderCode || null,
      amount: this.searchCriteria?.paymentAmount || null,
      debitName: this.searchCriteria?.paymentAccountName || null,
      debitAccount: this.searchCriteria?.accountNumber || null,
      orderReference: this.searchCriteria?.identifierCode || null,
      transactionNumber: this.searchCriteria?.transactionCode || null,

      statusTransaction: this.filterCriteria?.selectedStatuses || [],
      transactionMethodID: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],

      groupId: groupIdArray,
      issuerCode: this.filterCriteria?.selectedBanks || null,

      type: 'TXN',

      masterId: null,

    }

    this.api.post(EXCEL_ENDPOINT.EXPORT_TRANSACTION, param).subscribe(res => {
        let dataDialog: DialogConfirmModel = new DialogConfirmModel();
        dataDialog.title = 'Xuất file excel';
        dataDialog.message = 'Yêu cầu xuất file đang được xử lý. Vui lòng truy cập Lịch sử xuất file excel để nhận kết quả.';
        dataDialog.icon = 'icon-information';
        dataDialog.viewCancel = true;
        dataDialog.iconColor = 'icon info';
        dataDialog.buttonLabel = 'Xác nhận'
        dataDialog.width = "30%";
        this.dialogCommon.openDialogInfo(dataDialog).subscribe((result: any) => {
          if (result) {
            this.router.navigate(['/transaction/history-export']);
          }
        });
      },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData.soaErrorDesc);

      });
  }

  openDialogUnverifiedAccountHasEmail() {
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
    })
  }

  openDialogUnverifiedAccountNoEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message = 'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonRightLabel = 'Bổ sung email';
    dataDialog.hiddenButtonLeft = true
    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateEmail();
      }
    })
  }


  updateEmail() {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '600px',
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
    }, (error) => {
      const errorData = error?.error || {};
      // if (errorData.soaErrorCode == 'AUTH_ERROR_007') {
      //   this.dialog.open(LoginNotificationComponent, {
      //     panelClass: 'dialog-login-noti',
      //     data: {
      //       title: 'Email đã được xác thực bởi tài khoản khác',
      //       message: 'Vui lòng thay đổi email để xác thực tài khoản.',
      //       icon: 'icon-mail',
      //       typeClass: 'warning',
      //       expired: true,
      //       textLeft: 'Hủy',
      //       type: 'email',
      //       textRight: 'Thay đổi email',
      //       isEmailInfo: true
      //     },
      //     width: '30%',
      //     disableClose: true,
      //   })
      // }
    })
  }

  onDateRangeSelect(range: any): void {
    if (range[1] == null) {
      const startDate = range[0];
      const thirtyDaysLater = new Date(startDate);
      thirtyDaysLater.setDate(startDate.getDate() + 31);
      this.maxDate = thirtyDaysLater;
    }
    if (range?.length === 2 && range[0] != null && range[1] != null) {
      this.onSearch();
      this.maxDate = null;
    }
  }

  onGroupClick(event: any) {
    const clickedNode = event.node;

    // Lưu lại node vừa click (nếu cần)
    this.lastClickedGroup = clickedNode;

    // Delay nhỏ để đợi ngModel cập nhật xong
    setTimeout(() => {
      const selected = this.filterCriteria.selectedGroups || [];
      const parentId = clickedNode.parentId;

      // Giữ lại các lựa chọn có cùng parentId với node vừa click
      const filtered = selected.filter(item => item.parentId === parentId);

      // Cập nhật lại ngModel
      this.filterCriteria.selectedGroups = filtered;

      // Gọi API/logic khác nếu cần
      this.onChangeGroup();
    }, 0);
  }

  findItemById(tree: any[], id: number): any {
    for (let node of tree) {
      if (node.id === id) {
        return node;
      }
      if (node.children?.length) {
        const found = this.findItemById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  onChangeGroup() {
    const selected = this.filterCriteria.selectedGroups || [];
    if (!this.lastClickedGroup || selected.length === 0) return;

    const clickedNode = this.findItemById(this.groupOptions, this.lastClickedGroup.id);
    if (!clickedNode) return;

    const targetLevel = clickedNode.level;
    const targetParentId = clickedNode.parentId;

    const filtered = selected.filter(item => {
      const current = this.findItemById(this.groupOptions, item.id);
      return current?.level === targetLevel && current?.parentId === targetParentId;
    });

    // Gán lại danh sách đã lọc
    this.filterCriteria.selectedGroups = filtered;

    const groupIdList = filtered.filter(item => item.id !== this.merchantId).map(item => item.id).join(',');
    this.getMerchantOptions(groupIdList);
  }

  onReset() {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0);

    this.searchCriteria = {
      transactionCode: null,
      ftCode: null,
      orderCode: null,
      identifierCode: null,
      paymentAccountName: null,
      accountNumber: null,
      paymentAmount: null,
      dateRange: [],
    };

    this.filterCriteria = {
      selectedStatuses: [],
      selectedPaymentMethod: null,
      selectedBanks: null,
      selectedGroups: [],
      selectedMerchants: []
    };

    this.searchCriteria.dateRange = [startDate, endDate];

    this.onSearch();
  }

  getDataGroup() {
    this.api.get(BUSINESS_ENDPOINT.GET_GROUP_FILTER).subscribe(
      res => {
        if (res['data']) {
          let dataGroup = res['data'];
          console.log("dataGroup", dataGroup);
          const userInfo = this.auth.getUserInfo();
          if (userInfo.orgType === 0 && dataGroup.length > 0) {
            this.merchantId = dataGroup[0].merchantId;
            const merchantName = userInfo.merchantName;

            const rootNode = {
              id: this.merchantId,
              groupName: merchantName,
              level: 0,
              parentId: null,
              merchantId: this.merchantId,
            };

            // Cập nhật parentId cho các node cấp cao nhất (nếu chưa có)
            const updatedDataGroup = dataGroup.map((item: any) => {
              return {
                ...item,
                parentId: item.parentId === null ? this.merchantId : item.parentId,
              };
            });

            const newDataGroup = [rootNode, ...updatedDataGroup];

            this.groupOptions = this.convertLstAreaByOrder(newDataGroup, newDataGroup[0].parentId);
          } else {
            this.groupOptions = this.convertLstAreaByOrder(dataGroup, dataGroup[0].parentId);
          }

          console.log('groupNameOptions', this.groupOptions);
        }
      },
      error => {
        this.groupOptions = [];
        this.toast.showError('Lấy phương thức thanh toán xảy ra lỗi');
      }
    );
  }

  convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
    let result = list.filter(item => item.parentId === parentId);

    return result.map(item => {
      let children = this.convertLstAreaByOrder(list, item.id);
      return {
        ...item,
        label: item.groupName,
        key: item.id,
        children: children
      };
    });
  }

  checkHasSearchOrFilterData(): boolean {
    // Check searchCriteria (bỏ qua dateRange)
    const {dateRange, ...restSearch} = this.searchCriteria;
    const hasSearchData = Object.values(restSearch).some(value =>
      value !== null && value !== undefined && value !== ''
    );

    // Check filterCriteria
    const hasFilterData = Object.values(this.filterCriteria).some(value =>
      Array.isArray(value) ? value.length > 0 : value !== null && value !== ''
    );

    return hasSearchData || hasFilterData;
  }

  checkSearchNumber() {
    const {dateRange, ...restSearch} = this.searchCriteria;
    let count = 0;

    Object.values(restSearch).forEach(value => {
      if (value !== null && value !== undefined && value !== '') {
        count++;
      }
    });

    return count > 0 ? count : null;
  }

  checkFilterNumber() {
    let count = 0;

    Object.values(this.filterCriteria).forEach(value => {
      if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else if (value !== null && value !== '') {
        count++;
      }
    });

    return count > 0 ? count : null;
  }


}
