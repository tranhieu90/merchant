import {NgClass, NgFor, NgIf} from '@angular/common';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
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
import { MERCHANT_RULES } from '../../../base/constants/authority.constants';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { MbDropdown } from '../../../base/shared/mb-dropdown/mb-dropdown.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { VerifyUserService } from '../../../common/service/verify/verify-user.service';

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
    ShowClearOnFocusDirective,
    MbDropdown,
    NzDatePickerModule
  ],
  templateUrl: './cashback.component.html',
  styleUrl: './cashback.component.scss',

})

export class CashbackComponent implements OnInit {
  dateRange : (Date | null)[] = [];
  private tempFromDate: Date | null = null;
  lastValidRange: (Date | null)[] | null = null;
  wasPickerOpened = false;
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
  cachedSearchParam: any = null;
  hasRoleExport: boolean = true;
  merchantPage = 1;
  merchantSize = 1000;
  isLoadMoreMerchant: boolean = true;
  currentGroupIdList: any = null;

  searchCriteria: {
    transactionNumber: string | null;
    transactionOriginNumber: string | null;
    orderReferenceOrigin: string | null;
  } = {
    transactionNumber: null,
    transactionOriginNumber: null,
    orderReferenceOrigin: null,
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
    private cdr: ChangeDetectorRef,
     private verify:VerifyUserService
  ) {
    const columnsShow = localStorage.getItem(environment.settingCashback)?.split(',').map(api => api.trim());
    if (columnsShow) {
      this.lstColumnShow = columnsShow;
    }
  }

  ngOnInit(): void {

    this.initializeDates();
    this.lastValidRange = [...this.dateRange];

    this.statusOptions = [
      {name: 'Tất cả ', code: 'ALL'},
      {name: 'Thành công', code: '00'},
      {name: 'Không thành công', code: '03'},
      {name: 'Chờ tra soát', code: '20'},
    ];

    this.getMerchantOptions();

    this.getListBank();

    this.getLstPaymentMethod();

    this.onSearch();

    this.hasRoleExport = this.auth.apiTracker([MERCHANT_RULES.TRANS_EXPORT_EXCEL]);
  }

  onSearch(pageInfo?: any) {
    if (pageInfo) {
      this.pageIndex = pageInfo["page"] ? pageInfo["page"]  : 0;
      this.pageSize = pageInfo["pageSize"]
    } else {
      this.pageIndex = 0;
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

      transactionNumber: this.searchCriteria.transactionNumber || null,
      transactionOriginNumber: this.searchCriteria.transactionOriginNumber || null,
      originOrderRef: this.searchCriteria.orderReferenceOrigin || null,

      status: (this.filterCriteria?.selectedStatuses == 'ALL' || this.filterCriteria?.selectedStatuses == null) ? null : this.filterCriteria?.selectedStatuses,
      paymentMethodId: (this.filterCriteria?.selectedPaymentMethod == 'ALL' || this.filterCriteria?.selectedPaymentMethod == null) ? null : this.filterCriteria?.selectedPaymentMethod,
      merchantIdArray: this.filterCriteria?.selectedMerchants || [],
      // merchantIdArray: ['202852'],
      issuerCode: this.filterCriteria?.selectedBanks || null,

      page: this.pageIndex + 1,
      size: this.pageSize,

    }

    this.cachedSearchParam = param;

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

  onSetting() {
    const dialogRef = this.dialog.open(CashbackDialogSettingComponent, {
      width: '500px',
      data: this.lstColumnShow,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((lstColumnShow: any) => {
      if (lstColumnShow != undefined) {
        this.lstColumnShow = lstColumnShow;
        localStorage.setItem(environment.settingCashback, lstColumnShow);
      }
    })
  }

  doDetail(item: any) {
    this.router.navigate(['/transaction/cashback/detail'], {
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

  exportExcel() {

    if (!this.cachedSearchParam) {
      this.toast.showWarn('Vui lòng thực hiện tìm kiếm trước khi xuất Excel.');
      return;
    }

    let param = {
      fromDate: this.cachedSearchParam.fromDate,
      toDate: this.cachedSearchParam.toDate,

      transactionNumber: this.cachedSearchParam.transactionNumber,
      transactionOriginNumber: this.cachedSearchParam.transactionOriginNumber,
      originOrderRef: this.cachedSearchParam.originOrderRef,

      status: this.cachedSearchParam.status,
      paymentMethodId: this.cachedSearchParam.paymentMethodId,
      merchantIdArray: this.cachedSearchParam.merchantIdArray,
      issuerCode: this.cachedSearchParam.issuerCode,

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

  setValueMerchantDefault() {
    this.filterCriteria.selectedMerchants = [];
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
      this.wasPickerOpened = true;
      this.initializeDates();
      this.cdr.detectChanges();

      // Focus vào ô từ ngày
      setTimeout(() => {
        const inputElements = document.querySelectorAll('.ant-picker-input input');
        if (inputElements.length > 0) {
          (inputElements[0] as HTMLInputElement).focus(); // ô đầu là fromDate
        }
      }, 100); // Delay nhỏ để chắc chắn DOM đã render
    } else {
      // Khi đóng popup - nếu đã mở và có dateRange hợp lệ thì call API
      if (this.wasPickerOpened && this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
        this.onSearch();
      }

      this.tempFromDate = null;
      this.wasPickerOpened = false;
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

    // ✅ Tất cả validation đều pass
    this.tempFromDate = null;
    this.dateRange = [newFromDate, newToDate];
    this.lastValidRange = [new Date(newFromDate), new Date(newToDate)]; // Deep copy
    this.cdr.detectChanges();

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
