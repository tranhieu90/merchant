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
import {BANK_IMAGE_DATA} from '../../../../assets/bank-map';

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
  isFilter: boolean = false;
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
  minDate: any = null;

  searchCriteria: {
    transactionNumber: string | null;
    transactionOriginNumber: string | null;
    orderReferenceOrigin: string | null;
    dateRange: Date[] | [];
  } = {
    transactionNumber: null,
    transactionOriginNumber: null,
    orderReferenceOrigin: null,
    dateRange: [],
  };

  filterCriteria: {
    selectedStatuses: string | null;
    selectedPaymentMethod: string | null;
    selectedBanks: string | null;
    selectedMerchants: string[];
  } = {
    selectedStatuses: null,
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
            return ['text-left', 'custom-view'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          customBodyRender: (value: any) => {
            return value ? moment(value).format('DD/MM/YYYY HH:mm') : '';
          },
          width: "132px",
          minWidth: "132px"
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
                width: "149px",
                minWidth: "149px"
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
        name: 'paymentDesc',
        label: 'NỘI DUNG HOÀN TRẢ',
        options: {
          customCss: (obj: any) => {
            return ['text-left', 'mv-180'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          width: "170px",
          minWidth: "170px"
        }
      },
      {
        name: 'orderReferenceOrigin',
        label: 'MÃ ĐỊNH DANH',
        options: {
          customCss: (obj: any) => {
            return ['text-left', 'mv-180'];
          },
          customCssHeader: () => {
            return ['text-left'];
          },
          width: "170px",
          minWidth: "170px"
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
      ...(this.lstColumnShow.includes("refundFTCode")
          ? [
            {
              name: 'txnReference',
              label: 'Mã FT giao dịch hoàn',
              options: {
                customCss: (obj: any) => ['text-left'],
                customCssHeader: () => ['text-left'],
                width: "175px",
                minWidth: "175px"
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
                width: "167px",
                minWidth: "167px"
              }
            }
          ] : []
      ),
      {
        name: 'creditAccount',
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
            const accountNumber = params.creditAccount || '';
            const accountHolder = params.creditName || '';

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
                width: "136px",
                minWidth: "136px"
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

    const minDate = new Date();
    minDate.setDate(today.getDate() - 365);
    this.minDate = minDate;

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
      this.pageIndex = pageInfo["page"] ? pageInfo["page"]  : 0;
      this.pageSize = pageInfo["pageSize"]
    } else {
      this.pageIndex = 0;
    }

    let param = {
      fromDate: this.searchCriteria?.dateRange[0] ? moment(this.searchCriteria?.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: this.searchCriteria?.dateRange[1] ? moment(this.searchCriteria?.dateRange[1]).format('DD/MM/YYYY HH:mm:ss') : null,

      transactionNumber: this.searchCriteria.transactionNumber || null,
      transactionOriginNumber: this.searchCriteria.transactionOriginNumber || null,
      originOrderRef: this.searchCriteria.orderReferenceOrigin || null,

      status: this.filterCriteria?.selectedStatuses || null,
      paymentMethodId: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],
      // merchantIdArray: ['202852'],
      issuerCode: this.filterCriteria?.selectedBanks || null,

      page: this.pageIndex + 1,
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
          return {
            ...bank,
            logo: match ? match.image + '.png' : null
          };
        });
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
    const intPart = value.toString().split('.')[0];
    return intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
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

    let param = {
      fromDate: this.searchCriteria?.dateRange[0] ? moment(this.searchCriteria?.dateRange[0]).format('DD/MM/YYYY HH:mm:ss') : null,
      toDate: this.searchCriteria?.dateRange[1] ? moment(this.searchCriteria?.dateRange[1]).format('DD/MM/YYYY HH:mm:ss') : null,

      transactionNumber: this.searchCriteria.transactionNumber || null,
      transactionOriginNumber: this.searchCriteria.transactionOriginNumber || null,
      originOrderRef: this.searchCriteria.orderReferenceOrigin || null,

      status: this.filterCriteria?.selectedStatuses || null,
      paymentMethodId: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],
      issuerCode: this.filterCriteria?.selectedBanks || null,

    }

    this.api.post(EXCEL_ENDPOINT.EXPORT_REFUND_OLD, param).subscribe(res => {
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

    this.searchCriteria = {
      ...this.searchCriteria,
      transactionNumber: null,
      transactionOriginNumber: null,
      orderReferenceOrigin: null,
    };

    this.filterCriteria = {
      selectedStatuses: null,
      selectedPaymentMethod: null,
      selectedBanks: null,
      selectedMerchants: []
    };

    this.onSearch();
  }

  onDateRangeSelect(range: any): void {
    if (range[1] == null) {
      const startDate = range[0];
      const thirtyDaysLater = new Date(startDate);
      thirtyDaysLater.setDate(startDate.getDate() + 30);
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

  transform(value: string): string {
    if (!value || value.length < 10) {
      return value;
    }

    const start = value.substring(0, 6);
    const end = value.substring(value.length - 4);
    const masked = 'x'.repeat(value.length - 10);

    return `${start}${masked}${end}`;
  }

  onToggleSearch() {
    this.isSearch = !this.isSearch;
    this.isFilter = false;
  }

  onToggleFilter() {
    this.isFilter = !this.isFilter;
    this.isSearch = false;
  }

}
