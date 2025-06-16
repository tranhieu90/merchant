import {NgClass, NgFor, NgIf} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatStepperModule} from '@angular/material/stepper';
import {Router} from '@angular/router';
import moment from 'moment';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {CheckboxModule} from 'primeng/checkbox';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MultiSelectModule} from 'primeng/multiselect';
import {environment} from '../../../../environments/environment';
import {GridViewComponent} from '../../../base/shared/grid-view/grid-view.component';
import {InputCommon} from '../../../common/directives/input.directive';
import {InputSanitizeDirective} from '../../../common/directives/inputSanitize.directive';
import {DialogCommonService} from '../../../common/service/dialog-common/dialog-common.service';
import {DialogConfirmModel} from '../../../model/DialogConfirmModel';
import {GridViewModel} from '../../../model/GridViewModel';
import {CashbackDialogSettingComponent} from './cashback-dialog-setting/cashback-dialog-setting.component';
import {
  BANK_ENDPOINT,
  BUSINESS_ENDPOINT,
  EXCEL_ENDPOINT,
  MERCHANT_ENDPOINT,
  TRANSACTION_ENDPOINT,
  USER_ENDPOINT
} from '../../../common/enum/EApiUrl';
import {CommonUtils} from '../../../base/utils/CommonUtils';
import {FetchApiService} from '../../../common/service/api/fetch-api.service';
import {ToastService} from '../../../common/service/toast/toast.service';
import {DropdownModule} from 'primeng/dropdown';
import {UserVerifyStatus} from '../../../common/constants/CUser';
import {DialogRoleComponent, DialogRoleModel} from '../../role-management/dialog-role/dialog-role.component';
import {UpdateUserComponent} from '../../user-profile/update-user/update-user.component';
import {AuthenticationService} from '../../../common/service/auth/authentication.service';
import {MatBadge} from '@angular/material/badge';

@Component({
  selector: 'app-refund-transaction',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InputTextModule,
    GridViewComponent,
    InputTextareaModule,
    ButtonModule,
    NgFor,
    NgIf,
    CheckboxModule,
    MatCheckboxModule,
    MatIconModule,
    InputNumberModule,
    InputCommon,
    InputSanitizeDirective,
    NgClass,
    MultiSelectModule,
    CalendarModule,
    DropdownModule,
    MatBadge,
  ],
  templateUrl: './cashback.component.html',
  styleUrl: './cashback.component.scss',

})

export class CashbackComponent implements OnInit {

  assetPath = environment.assetPath;
  statusOptions: any = [];
  paymentMethodOptions: any = [];
  merchantOptions: any = [];
  bankOptions: any = [];
  isSearch: boolean = true;
  dataTable: any = [];
  lstColumnShow: string[] = [
    'refundTransactionCode',
    'refundFTCode',
    'rawFTCode',
  ];

  pageIndex = 1;
  pageSize = 10;
  totalItem: number = 0;
  totalTrans: number = 0;
  totalAmount: number = 0;
  maxDate: any = null;

  searchCriteria: {
    txn_reference: string | null;
    txn_reference_origin: string | null;
    credit_account: string | null;
    amount: string | null;
    dateRange: Date[] | [];
  } = {
    txn_reference: null,
    txn_reference_origin: null,
    credit_account: null,
    amount: null,
    dateRange: [],
  };

  filterCriteria: {
    selectedStatuses: string[];
    selectedPaymentMethod: string | null;
    selectedBanks: string | null;
    selectedMerchants: string[];
  } = {
    selectedStatuses: [],
    selectedPaymentMethod: null,
    selectedBanks: null,
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
        name: 'tranTime',
        label: 'Ngày giao dịch',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          customBodyRender: (value: any) => {
            return value ? moment(value).format('DD/MM/YYYY HH:mm') : '';
          },
          width: "131px",
          minWidth: "131px"
        }
      },
      ...(this.lstColumnShow.includes("refundTransactionCode")
          ? [
            {
              name: 'transNumber',
              label: 'Mã giao dịch hoàn',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
                width: "155px",
                minWidth: "155px"
              }
            }
          ] : []
      ),
      ...(this.lstColumnShow.includes("rawTransactionCode")
          ? [
            {
              name: 'transactionReferenceId',
              label: 'Mã giao dịch gốc',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
                width: "148px",
                minWidth: "148px"
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
        label: 'Số tiền hoàn (₫)',
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
      {
        name: 'status',
        label: 'Trạng thái',
        options: {
          customCss: (obj: any) => {
            return ['text-left'];
          },
          customCssHeader: () => {
            return ['text-left'];
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
      ...(this.lstColumnShow.includes("refundFTCode")
          ? [
            {
              name: 'txnReference',
              label: 'Mã FT giao dịch hoàn',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
                width: "173px",
                minWidth: "173px"
              }
            }
          ] : []
      ),
      ...(this.lstColumnShow.includes("rawFTCode")
          ? [
            {
              name: 'txnReferenceOrigin',
              label: 'Mã FT giao dịch gốc',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
                width: "165px",
                minWidth: "165px"
              }
            }
          ] : []
      ),
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
      ...(this.lstColumnShow.includes("feeTransaction")
          ? [
            {
              name: 'feeAmount',
              label: 'Phí giao dịch (₫)',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
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
              name: 'feeVAT',
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

    this.getListBank();

    this.getLstPaymentMethod();

    this.onSearch();

  }

  onSearch(pageInfo?: any) {
    if (pageInfo) {
      this.pageIndex = pageInfo["page"] || 1;
      this.pageSize = pageInfo["pageSize"]
    } else {
      this.pageIndex = 1;
    }

    let param = {
      fromDate: this.searchCriteria?.dateRange[0] ? moment(this.searchCriteria?.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: this.searchCriteria?.dateRange[1] ? moment(this.searchCriteria?.dateRange[1]).format('DD/MM/YYYY HH:mm:ss') : null,

      transactionNumber: this.searchCriteria.txn_reference || null,
      transactionOriginNumber: this.searchCriteria.txn_reference_origin || null,
      creditAccount: this.searchCriteria.credit_account || null,
      amount: this.searchCriteria.amount || null,

      statusRefund: this.filterCriteria?.selectedStatuses || [],
      paymentMethodId: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],
      // merchantIdArray: ['202852'],
      issuerCode: this.filterCriteria?.selectedBanks || null,

      page: this.pageIndex,
      size: this.pageSize,

    }

    this.api.post(TRANSACTION_ENDPOINT.GET_LIST_REFUND, param).subscribe(res => {
        this.dataTable = res['data']['refunds'];
        this.totalItem = Number(res['data']['totalCount']) || 0;
        this.totalTrans = res['data']['totalCount'];
        this.totalAmount = res['data']['totalAmount'];
      },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData.soaErrorDesc);

      });
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

  getMerchantOptions() {

    let param = {
      status: null,
      page: 1,
      size: 999999999
    };
    let buildParams = CommonUtils.buildParams(param);

    this.api.get(MERCHANT_ENDPOINT.LIST_MERCHANT, buildParams).subscribe(res => {
        this.merchantOptions = res['data']['subInfo'] || [];
      },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData.soaErrorDesc);
      });
  }

  onSetting() {
    const dialogRef = this.dialog.open(CashbackDialogSettingComponent, {
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
    this.router.navigate(['/transaction/cashback-detail'], {
      queryParams: {
        id: item['id'],
        transTime: item['tranTime'],
        merchantId: item['merchantId']
      }
    });
  }

  formatMoney(value: any): string {
    if (value == null) return '0 đ';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
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

    let param = {
      fromDate: this.searchCriteria?.dateRange[0] ? moment(this.searchCriteria?.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: this.searchCriteria?.dateRange[1] ? moment(this.searchCriteria?.dateRange[1]).format('DD/MM/YYYY HH:mm:ss') : null,

      txnReference: this.searchCriteria.txn_reference || null,
      txnReferenceOrigin: this.searchCriteria.txn_reference_origin || null,
      creditAccount: this.searchCriteria.credit_account || null,
      amount: this.searchCriteria.amount || null,

      statusRefund: this.filterCriteria?.selectedStatuses || [],
      refundMethodID: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],
      issuerCode: this.filterCriteria?.selectedBanks || null,

      type: 'RFN'

    }

    this.api.post(EXCEL_ENDPOINT.EXPORT_REFUND, param).subscribe(res => {
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

  onReset() {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0);

    this.searchCriteria = {
      txn_reference: null,
      txn_reference_origin: null,
      credit_account: null,
      amount: null,
      dateRange: [],
    };

    this.filterCriteria = {
      selectedStatuses: [],
      selectedPaymentMethod: null,
      selectedBanks: null,
      selectedMerchants: []
    };

    this.searchCriteria.dateRange = [startDate, endDate];

    this.onSearch();
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

  checkHasSearchOrFilterData(): boolean {
    // Check searchCriteria (bỏ qua dateRange)
    const { dateRange, ...restSearch } = this.searchCriteria;
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
