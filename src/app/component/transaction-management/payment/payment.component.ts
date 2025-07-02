import {NgClass, NgFor, NgIf} from '@angular/common';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
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
import {BANK_IMAGE_DATA} from '../../../../assets/bank-map';
import { MERCHANT_RULES } from '../../../base/constants/authority.constants';
import { TooltipModule } from 'primeng/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { MbDropdown } from '../../../base/shared/mb-dropdown/mb-dropdown.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    ButtonModule,
    CalendarModule,
    InputTextModule,
    MultiSelectModule,
    NgIf,
    NgClass,
    GridViewComponent,
    InputNumberModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    TreeSelectModule,
    InputCommon,
    MatBadge,
    TooltipModule,
    MatTooltip,
    ShowClearOnFocusDirective,
    MbDropdown,
    NzDatePickerModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  dateRange : (Date | null)[] = [];
  private tempFromDate: Date | null = null;
  lastValidRange: (Date | null)[] | null = null;
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
  pageIndex = 0;
  pageSize = 10;
  totalItem: number = 0;
  totalTrans: number = 0;
  totalAmount: number = 0;
  lastClickedGroup: any = null;
  maxDate: any = null;
  minDate: any = null;
  merchantId: any = null;
  cachedSearchParam: any = null;
  hasRoleExport: boolean = true;
  isClear: boolean = false;
  merchantPage = 1;
  merchantSize = 50;
  isLoadMoreMerchant: boolean = true;
  currentGroupIdList: any = null;
  searchCriteria: {
    transactionCode: string | null;
    ftCode: string | null;
    orderCode: string | null;
    identifierCode: string | null;
    paymentAccountName: string | null;
    accountNumber: string | null;
    paymentAmount: number | null;
  } = {
      transactionCode: null,
      ftCode: null,
      orderCode: null,
      identifierCode: null,
      paymentAccountName: null,
      accountNumber: null,
      paymentAmount: null,
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
            return ['text-left', 'custom-view'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          customBodyRender: (value: any) => {
            return this.formatDateTime(value);
          },
          width: "132px",
          minWidth: "132px"
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
        name: 'merchantBizName',
        label: 'Điểm kinh doanh',
        options: {
          customCss: (obj: any) => {
            return ['text-left', 'mw-180'];
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
              minWidth: "191px",
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
    private cdr: ChangeDetectorRef
  ) {
    const columnsShow = localStorage.getItem(environment.settingPayment)?.split(',').map(api => api.trim());
    if (columnsShow) {
      this.lstColumnShow = columnsShow;
    }
  }

  ngOnInit(): void {

    this.statusOptions = [
      {name: 'Thành công', code: '00'},
      {name: 'Không thành công', code: '03'},
      {name: 'Chờ tra soát', code: '20'},
    ];

    this.initializeDates();
    this.lastValidRange = [...this.dateRange];

    this.getMerchantOptions();

    this.getDataGroup();

    this.getListBank();

    this.getLstPaymentMethod();

    this.onSearch();

    this.hasRoleExport = this.auth.apiTracker([MERCHANT_RULES.TRANS_EXPORT_EXCEL]);
  }

  getLstPaymentMethod() {
    this.api.get(BUSINESS_ENDPOINT.GET_LIST_PAYMENT_METHOD_FILTER).subscribe(res => {
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
      this.bankOptions = this.bankOptions.map((bank: any) => {
        const match = BANK_IMAGE_DATA.find((b: any) => b.code === bank.code);
        const logo = match && match.image && match.image.trim() !== '' ? match.image + '.png' : 'img_default.png';
        return {
          ...bank,
          logo
        };
      });
    },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData.soaErrorDesc);
      });
  }

  getMerchantOptions(groupIdList?: any) {

    this.currentGroupIdList = groupIdList;

    const params = {
      status: null,
      groupIdList: this.currentGroupIdList || null,
      page: this.merchantPage,
      size: this.merchantSize,
    };

    const buildParams = CommonUtils.buildParams(params);

    this.api.get(MERCHANT_ENDPOINT.LIST_MERCHANT, buildParams).subscribe(
      (res) => {
        const newData = res?.data?.subInfo || [];
        const merchantTotal = res?.data?.totalSub ?? 0;

        this.merchantOptions = [...this.merchantOptions, ...newData];
        const loadedMerchantCount = this.merchantOptions.length;

        if (loadedMerchantCount < merchantTotal) {
          this.merchantPage++;
          this.isLoadMoreMerchant = true;
        } else {
          this.isLoadMoreMerchant = false;
        }

      },
      (error) => {
        this.toast.showError(error?.error?.soaErrorDesc || 'Lỗi load merchant');
      }
    );
  }

  onMerchantDropdownShow() {

    setTimeout(() => {
      const panel = document.querySelector('.p-multiselect-items-wrapper');
      if (panel) {
        panel.addEventListener('scroll', this.onMerchantScroll);
      }
    }, 100);
  }

  onMerchantScroll = (event: any) => {
    const target = event.target;
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 5;

    if (isBottom && this.isLoadMoreMerchant) {
      this.getMerchantOptions(this.currentGroupIdList);
    }
  };


  onSearch(pageInfo?: any) {
    if (pageInfo) {
      this.pageIndex = pageInfo["page"] ? pageInfo["page"] : 0;
      this.pageSize = pageInfo["pageSize"]
    } else {
      this.pageIndex = 0;
    }

    let groupIdArray = this.getTopLevelGroupIds(this.filterCriteria?.selectedGroups || []);
    groupIdArray = groupIdArray?.filter(item => item !== this.merchantId)?.map(item => item);
    if (this.filterCriteria?.selectedMerchants?.length > 0) {
      groupIdArray = [];
    }

    let toDate = this.dateRange[1] ? new Date(this.dateRange[1]) : null;

    if (toDate) {
      const now = new Date();
      const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (toDateOnly.getTime() === nowOnly.getTime()) {
        // Cùng ngày hiện tại
        const toMinutes = toDate.getHours() * 60 + toDate.getMinutes();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        if (toMinutes < nowMinutes) {
          toDate.setSeconds(59);
        } else {
          toDate = new Date(); // set về thời điểm hiện tại
        }
      } else {
        toDate.setSeconds(59);
      }
    }

    let param = {
      fromDate: this.dateRange[0] ? moment(this.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: toDate ? moment(toDate).format('DD/MM/YYYY HH:mm:ss') : null,

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

      page: this.pageIndex + 1,
      size: this.pageSize,

      masterId: this.merchantId,

    }

    this.cachedSearchParam = param;

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
        localStorage.setItem(environment.settingPayment, lstColumnShow);
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
    const intPart = value.toString().split('.')[0];
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ';
  }

  formatMoney2(value: any): string {
    if (value == null) return '0';
    const intPart = value.toString().split('.')[0];
    return intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    if (!this.cachedSearchParam) {
      this.toast.showWarn('Vui lòng thực hiện tìm kiếm trước khi xuất Excel.');
      return;
    }

    const param = {
      fromDate: this.cachedSearchParam.fromDate,
      toDate: this.cachedSearchParam.toDate,

      transactionReference: this.cachedSearchParam.txnReference,
      orderId: this.cachedSearchParam.orderId,
      amount: this.cachedSearchParam.amount,
      debitName: this.cachedSearchParam.debitName,
      debitAccount: this.cachedSearchParam.debitAccount,
      orderReference: this.cachedSearchParam.orderReference,
      transactionNumber: this.cachedSearchParam.transactionNumber,

      statusTransaction: this.cachedSearchParam.status,
      transactionMethodID: this.cachedSearchParam.paymentMethodId,
      merchantIdArray: this.cachedSearchParam.merchantIdArray,
      groupId: this.cachedSearchParam.groupIdArray,
      issuerCode: this.cachedSearchParam.issuerCode,

      type: 'TXN',
      masterId: null
    };

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

  onGroupClick(event: any) {
    const clickedNode = event.node;
    this.lastClickedGroup = clickedNode;

    const selected = this.filterCriteria.selectedGroups || [];
    this.isClear = selected.length > 0
    const clickedFullNode = this.findItemById(this.groupOptions, clickedNode.id);
    if (!clickedFullNode) return;

    const targetLevel = clickedFullNode.level;
    const targetParentId = clickedFullNode.parentId;

    // Lọc các node cùng level và cùng parentId
    const sameLevelNodes = selected.filter(item => {
      const fullItem = this.findItemById(this.groupOptions, item.id);
      return fullItem?.level === targetLevel && fullItem?.parentId === targetParentId;
    });

    // Lấy toàn bộ con (mọi cấp) của các node này
    const allWithChildren: any[] = [];

    for (const node of sameLevelNodes) {
      const fullNode = this.findItemById(this.groupOptions, node.id);
      if (fullNode) {
        allWithChildren.push(fullNode);
        const children = this.getAllChildNodes(fullNode);
        allWithChildren.push(...children);
      }
    }

    // Loại bỏ trùng ID
    const uniqueById = Array.from(new Map(allWithChildren.map(item => [item.id, item])).values());

    // Gán lại cho ngModel
    this.filterCriteria.selectedGroups.length = 0;
    this.filterCriteria.selectedGroups.push(...uniqueById);

    // Gọi logic tiếp theo
    this.onChangeGroup();

  }

  getAllChildNodes(node: any): any[] {
    let result: any[] = [];
    if (node?.children && node.children.length > 0) {
      for (const child of node.children) {
        const fullChild = this.findItemById(this.groupOptions, child.id);
        if (fullChild) {
          result.push(fullChild);
          result.push(...this.getAllChildNodes(fullChild)); // đệ quy lấy mọi cấp con
        }
      }
    }
    return result;
  }

  findItemById(nodes: any[], id: any): any {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findItemById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  onChangeGroup() {
    const selected = this.filterCriteria.selectedGroups || [];
    // if (!this.lastClickedGroup || selected.length === 0) return;

    const topLevelIds = this.getTopLevelGroupIds(selected);
    const groupIdList = topLevelIds.filter(id => id !== this.merchantId).join(',');

    this.currentGroupIdList = groupIdList;
    this.merchantPage = 1;
    this.filterCriteria.selectedMerchants = [];
    this.isLoadMoreMerchant = true;
    this.merchantOptions = [];

    this.getMerchantOptions(groupIdList);
  }

  getTopLevelGroupIds(selectedNodes: any[]): string[] {
    const selectedIds = selectedNodes.map(node => node.id);
    const topLevelNodes: any[] = [];

    for (const node of selectedNodes) {
      const fullNode = this.findItemById(this.groupOptions, node.id);
      const hasAncestorInSelected = this.hasParentInList(fullNode, selectedIds);

      if (!hasAncestorInSelected) {
        topLevelNodes.push(fullNode);
      }
    }

    return topLevelNodes.map(node => node.id);
  }

  hasParentInList(node: any, idList: string[]): boolean {
    if (!node || !node.parentId) return false;
    if (idList.includes(node.parentId)) return true;

    const parentNode = this.findItemById(this.groupOptions, node.parentId);
    return this.hasParentInList(parentNode, idList);
  }

  onReset() {

    this.searchCriteria = {
      ...this.searchCriteria,
      transactionCode: null,
      ftCode: null,
      orderCode: null,
      identifierCode: null,
      paymentAccountName: null,
      accountNumber: null,
      paymentAmount: null,
    };

    this.filterCriteria = {
      selectedStatuses: [],
      selectedPaymentMethod: null,
      selectedBanks: null,
      selectedGroups: [],
      selectedMerchants: []
    };

    this.onSearch();
  }

  getDataGroup() {
    this.api.get(BUSINESS_ENDPOINT.GET_GROUP_FILTER).subscribe(
      res => {
        if (res['data']) {
          let dataGroup = res['data'];
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
      const shortLabel = this.shortenLabel(item.groupName);
      return {
        ...item,
        label: shortLabel,
        fullLabel: item.groupName,
        key: item.id,
        children: children,
        showTooltip: shortLabel.includes('...')
      };
    });
  }

  shortenLabel(label: string): string {
    if (!label) return '';
    return label.length > 30 ? label.slice(0, 30) + '...' : label;
  }

  checkHasSearchOrFilterData(): boolean {
    // Check searchCriteria (bỏ qua dateRange)
    const hasSearchData = Object.values(this.searchCriteria).some(value =>
      value !== null && value !== undefined && value !== ''
    );

    // Check filterCriteria
    const hasFilterData = Object.values(this.filterCriteria).some(value =>
      Array.isArray(value) ? value.length > 0 : value !== null && value !== ''
    );

    return hasSearchData || hasFilterData;
  }

  checkSearchNumber() {
    let count = 0;

    Object.values(this.searchCriteria).forEach(value => {
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

  getSelectedNames(selectedItems: any[]): string {
    if (!selectedItems || selectedItems.length === 0) return '';
    return selectedItems.map(item => item.name).join(', ');
  }

  formatDateTime(dateStr: string) {
    const targetMoment = moment(dateStr, 'DD/MM/YYYY HH:mm:ss');
    return targetMoment.format('DD/MM/YYYY HH:mm')
  }

  onToggleSearch() {
    this.isSearch = !this.isSearch;
    this.isFilter = false;
  }

  onToggleFilter() {
    this.isFilter = !this.isFilter;
    this.isSearch = false;
  }


  private initializeDates(): void {
    const now = new Date();

    // Set min date = hiện tại - 365 ngày
    this.minDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    this.maxDate = new Date(now);

    // Khởi tạo dateRange: từ 00:00:00 hôm nay đến thời điểm hiện tại
    if (!this.dateRange || this.dateRange.length !== 2) {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      this.dateRange = [startOfToday, new Date(now)];
      this.lastValidRange = [startOfToday, new Date(now)];
    }
  }

  // Khi mở popup chọn ngày
  onCalendarOpenChange(open: boolean): void {
    if (open) {
      this.tempFromDate = null;
      this.initializeDates();
      this.cdr.detectChanges();

      // Focus vào ô từ ngày
      setTimeout(() => {
        const inputElements = document.querySelectorAll('.ant-picker-input input');
        if (inputElements.length > 0) {
          (inputElements[0] as HTMLInputElement).focus(); // ô đầu là fromDate
        }
      }, 0); // Delay nhỏ để chắc chắn DOM đã render
    } else {
      this.tempFromDate = null;
    }
  }

  // Xử lý khi người dùng chọn from date (chưa chọn to date)
  onCalendarSelect(dates: (Date | null)[]): void {
    if (!dates || dates.length === 0) return;

    const [fromDate, toDate] = dates;

    // Khi chỉ chọn fromDate (chưa chọn toDate)
    if (fromDate && !toDate) {
      this.tempFromDate = fromDate;
      this.cdr.detectChanges(); // Trigger update để disable dates không hợp lệ cho toDate
    }
  }

  // Xử lý khi hoàn thành chọn cả 2 ngày
  onDateRangeChange(dates: (Date | null)[]): void {
    // Nếu không có đủ 2 ngày hoặc bị null
    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      this.restorePreviousValidRange();
      return;
    }

    const [newFromDate, newToDate] = dates;
    const now = new Date();

    // Validate fromDate không được sau hiện tại
    if (newFromDate > now) {
      this.restorePreviousValidRange();
      return;
    }

    // Validate fromDate không được trước minDate
    if (newFromDate < this.minDate) {
      this.restorePreviousValidRange();
      return;
    }

    // Validate toDate không được trước fromDate
    if (newToDate < newFromDate) {
      this.restorePreviousValidRange();
      return;
    }

    // Validate toDate không được sau hiện tại
    if (newToDate > now) {
      this.restorePreviousValidRange();
      return;
    }

    // Validate khoảng cách không quá 30 ngày (chỉ so sánh ngày, không so sánh giờ phút)
    const fromDateOnly = new Date(newFromDate.getFullYear(), newFromDate.getMonth(), newFromDate.getDate());
    const toDateOnly = new Date(newToDate.getFullYear(), newToDate.getMonth(), newToDate.getDate());
    const daysDiff = Math.floor((toDateOnly.getTime() - fromDateOnly.getTime()) / (24 * 60 * 60 * 1000));

    if (daysDiff > 30) {
      this.restorePreviousValidRange();
      return;
    }

    // Tất cả validation đều pass
    this.tempFromDate = null;
    this.dateRange = [newFromDate, newToDate];
    this.lastValidRange = [new Date(newFromDate), new Date(newToDate)]; // Deep copy
    this.cdr.detectChanges();

    // Call API khi có đủ 2 ngày hợp lệ
    this.onSearch();
  }

  private restorePreviousValidRange(): void {
    if (this.lastValidRange && this.lastValidRange[0] && this.lastValidRange[1]) {
      this.dateRange = [
        new Date(this.lastValidRange[0]),
        new Date(this.lastValidRange[1])
      ];
    } else {
      // Fallback về giá trị mặc định
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      this.dateRange = [startOfToday, new Date(now)];
      this.lastValidRange = [startOfToday, new Date(now)];
    }

    this.tempFromDate = null;
    this.cdr.detectChanges();
  }

  // Disabled ngày không hợp lệ
  disabledDate = (current: Date): boolean => {
    if (!current) return false;

    const currentDate = new Date(current);
    currentDate.setHours(0, 0, 0, 0);

    const minDate = new Date(this.minDate);
    minDate.setHours(0, 0, 0, 0);

    const maxDate = new Date(this.maxDate);
    maxDate.setHours(0, 0, 0, 0);

    // Disable ngày ngoài khoảng min/max tổng
    if (currentDate < minDate || currentDate > maxDate) {
      return true;
    }

    // Khi đang chọn toDate (đã có tempFromDate)
    if (this.tempFromDate) {
      const fromDateOnly = new Date(this.tempFromDate);
      fromDateOnly.setHours(0, 0, 0, 0);

      // Disable ngày trước fromDate
      if (currentDate < fromDateOnly) {
        return true;
      }

      // Disable ngày sau fromDate + 30 ngày hoặc sau ngày hiện tại
      const maxToDate = new Date(fromDateOnly.getTime() + 30 * 24 * 60 * 60 * 1000);
      const actualMaxToDate = maxToDate > maxDate ? maxDate : maxToDate;
      actualMaxToDate.setHours(0, 0, 0, 0);

      if (currentDate > actualMaxToDate) {
        return true;
      }
    }

    return false;
  };

  // Disable time cho range picker
  disabledRangeTime = (current: Date | Date[], partial?: 'start' | 'end'): any => {
    if (current instanceof Date && partial) {
      if (partial === 'start') {
        return this.disabledStartTime(current);
      } else {
        const fromDate = this.tempFromDate ?? (this.dateRange?.[0] ?? new Date());
        return this.disabledEndTime(current, fromDate);
      }
    }

    if (Array.isArray(current) && current.length > 0 && partial) {
      if (partial === 'start') {
        return this.disabledStartTime(current[0]);
      } else if (current[1]) {
        return this.disabledEndTime(current[1], current[0]);
      }
    }

    return {};
  };

  private disabledStartTime(date: Date): any {
    if (!date) return {};

    const now = new Date();
    const selectedDate = new Date(date);
    const isToday = this.isSameDay(selectedDate, now);

    // Chỉ disable time nếu chọn ngày hôm nay
    if (!isToday) return {};

    return {
      nzDisabledHours: (): number[] => {
        const hours: number[] = [];
        const currentHour = now.getHours();
        // Disable các giờ sau giờ hiện tại
        for (let i = currentHour + 1; i < 24; i++) {
          hours.push(i);
        }
        return hours;
      },
      nzDisabledMinutes: (hour: number): number[] => {
        if (hour !== now.getHours()) return [];
        const minutes: number[] = [];
        const currentMinute = now.getMinutes();
        // Disable các phút sau phút hiện tại
        for (let i = currentMinute + 1; i < 60; i++) {
          minutes.push(i);
        }
        return minutes;
      },
      nzDisabledSeconds: (): number[] => []
    };
  }

  private disabledEndTime(endDate: Date, startDate: Date): any {
    if (!endDate || !startDate) return {};

    const now = new Date();
    const selectedEndDate = new Date(endDate);
    const selectedStartDate = new Date(startDate);
    const isEndDateToday = this.isSameDay(selectedEndDate, now);
    const isSameStartEndDate = this.isSameDay(selectedStartDate, selectedEndDate);

    // Chỉ disable time nếu chọn ngày hôm nay
    if (!isEndDateToday) return {};

    return {
      nzDisabledHours: (): number[] => {
        const hours: number[] = [];
        const currentHour = now.getHours();

        // Nếu cùng ngày với startDate, thì không được chọn giờ trước startDate
        let minHour = 0;
        if (isSameStartEndDate) {
          minHour = selectedStartDate.getHours();
        }

        // Disable giờ trước minHour
        for (let i = 0; i < minHour; i++) {
          hours.push(i);
        }

        // Disable giờ sau giờ hiện tại
        for (let i = currentHour + 1; i < 24; i++) {
          hours.push(i);
        }

        return hours;
      },
      nzDisabledMinutes: (hour: number): number[] => {
        const minutes: number[] = [];

        // Nếu cùng ngày và cùng giờ với startDate
        if (isSameStartEndDate && hour === selectedStartDate.getHours()) {
          const startMinute = selectedStartDate.getMinutes();
          for (let i = 0; i < startMinute; i++) {
            minutes.push(i);
          }
        }

        // Nếu là giờ hiện tại, disable phút sau phút hiện tại
        if (hour === now.getHours()) {
          const currentMinute = now.getMinutes();
          for (let i = currentMinute + 1; i < 60; i++) {
            minutes.push(i);
          }
        }

        return minutes;
      },
      nzDisabledSeconds: (): number[] => []
    };
  }

  private isSameDay(date1: Date | null | undefined, date2: Date | null | undefined): boolean {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
