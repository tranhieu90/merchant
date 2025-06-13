import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import moment from 'moment';
import {ButtonModule} from 'primeng/button';
import {GridViewModel} from '../../../../model/GridViewModel';
import {GridViewComponent} from '../../../../base/shared/grid-view/grid-view.component';
import {DialogRoleComponent, DialogRoleModel} from '../../../role-management/dialog-role/dialog-role.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthenticationService} from '../../../../common/service/auth/authentication.service';
import {UserVerifyStatus} from '../../../../common/constants/CUser';
import {DialogRepayComponent} from '../dialog-repay/dialog-repay.component';
import {NgClass, NgIf} from '@angular/common';
import {DialogAuthenticationComponent} from '../dialog-authentication/dialog-authentication.component';
import * as _ from 'lodash';
import {TRANSACTION_ENDPOINT, USER_ENDPOINT} from '../../../../common/enum/EApiUrl';
import {FetchApiService} from '../../../../common/service/api/fetch-api.service';
import {ToastService} from '../../../../common/service/toast/toast.service';
import {environment} from '../../../../../environments/environment';
import {CommonUtils} from '../../../../base/utils/CommonUtils';
import {UpdateUserComponent} from '../../../user-profile/update-user/update-user.component';
import {DialogConfirmModel} from '../../../../model/DialogConfirmModel';
import {DialogCommonService} from '../../../../common/service/dialog-common/dialog-common.service';
import {MatButton} from '@angular/material/button';
import {PrintInvoice} from '../../print-invoice/print-invoice';
import {NgxPrintDirective} from 'ngx-print';

@Component({
  selector: 'app-detail-payment',
  standalone: true,
  imports: [ButtonModule, GridViewComponent, NgClass, NgIf, MatButton, PrintInvoice, NgxPrintDirective],
  templateUrl: './detail-payment.component.html',
  styleUrl: './detail-payment.component.scss'
})
export class DetailPaymentComponent implements OnInit {

  @ViewChild('printBtn') printBtn!: ElementRef;

  invoiceData = {};

  assetPath = environment.assetPath;
  dataHistory: any = [];
  id: any;
  merchantId: any;
  transTime: any;
  detailTrans: any = {};
  dataRefund: any = null;

  columns: Array<GridViewModel> = [
    {
      name: 'refund_time',
      label: 'Thời gian hoàn trả',
      options: {
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return value ? moment(value).format('DD/MM/YYYY HH:mm') : '';
        }
      }
    },
    {
      name: 'refund_amount',
      label: 'Số tiền hoàn trả (₫)',
      options: {
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return this.formatMoney(value);
        }
      }
    },
    {
      name: 'FTCode',
      label: 'Mã FT hoàn trả',
      options: {
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'refund_status',
      label: 'Trạng thái',
      options: {
        customCss: () => {
          return ['text-center'];
        },
        customCssHeader: () => {
          return ['text-center'];
        },
        customBodyRender: (value: any) => {
          const className = this.getClassStatus(value);
          const label = this.getLabelStatus(value);
          return `<span class='status ${className}'>${label}</span>`;
        },
        width: "170px"
      }
    },
    {
      name: 'refund_txn_reference',
      label: 'Người hoàn trả',
      options: {
        customCss: () => {
          return ['text-left'];
        },

        customCssHeader: () => {
          return ['text-left'];
        }
      }
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private api: FetchApiService,
    private toast: ToastService,
    private dialogCommon: DialogCommonService,
  ) {
    this.routeActive.queryParams.subscribe(params => {
      //this.roleId = params['roleId'] || null;
      if (params['id']) {
        this.id = params['id'];
      }
      if (params['merchantId']) {
        this.merchantId = params['merchantId'];
      }
      if (params['transTime']) {
        this.transTime = params['transTime'];
      }
      this.getDetailData();
    });
  }

  ngOnInit(): void {
  }

  getDetailData() {
    let param = {
      id: this.id,
      merchantId: this.merchantId,
      transTime: this.transTime,
    }

    this.api.post(TRANSACTION_ENDPOINT.GET_DETAIL_TRANSACTION, param).subscribe(res => {
        this.detailTrans = res['data']['content'];
        this.dataHistory = res['data']['refund_history'];
        let totalAmount = Number(this.detailTrans?.amount) + Number(this.detailTrans?.feeAmount || 0) + Number(this.detailTrans?.feeVAT || 0)
        this.invoiceData = {
          ngayGiaoDich: this.detailTrans?.transTime,
          tenTaiKhoan: this.detailTrans?.debitName,
          soTheTaiKhoan: this.detailTrans?.debitAccount,
          phuongThucThanhToan: this.detailTrans?.methodName,
          nganHangThanhToan: this.detailTrans?.issuerName,
          diemKinhDoanh: this.detailTrans?.merchantName,
          maGiaoDich: this.detailTrans?.transactionNumber,
          maFtGiaoDich: this.detailTrans?.txnReference,
          maDinhDanh: this.detailTrans?.orderRef,
          maDonHang: this.detailTrans?.orderId,
          noiDungThanhToan: this.detailTrans?.orderInfo,
          soTien: this.formatMoney(this.detailTrans?.amount),
          tongTien: this.formatMoney(totalAmount),
        };
      },
      error => {
        const errorData = error?.error || {};

      });
  }

  doRepay() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.openDialogRepay();
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

  openDialogRepay() {
    const dialogRef = this.dialog.open(DialogRepayComponent, {
      width: '500px',
      data: {
        id: this.detailTrans?.id,
        transTime: this.detailTrans?.transTime,
        ftNumber: this.detailTrans?.txnReference,
        amount: this.detailTrans?.amount,
        merchantId: this.detailTrans?.merchantId
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const qrData = {
          userId: this.auth.getUserInfo()?.id,
          id: data.id,
          transTime: data.transTime,
          refundReason: data.refundReason,
          currentRefundMoney: data.currentRefundMoney,
          txnReferenceOrigin: data.txnReferenceOrigin,
          merchantId: data.merchantId
        }
        if (this.hasInvalidField(qrData)) {
          this.toast.showError('Đã có lỗi xảy ra, vui lòng thử lại');
          return;
        }
        this.openDialogAuthen(qrData);
      }
    })
  }

  openDialogAuthen(data: any) {
    const dialogRef = this.dialog.open(DialogAuthenticationComponent, {
      panelClass: 'dialog-authen',
      width: '500px',
      data: data
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        if (res?.isRedo) {
          this.getDetailData();
        } else {
          this.dataRefund = res;
        }
      }

    })
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

  formatMoney(value: any): string {
    if (value == null) return '0 đ';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫';
  }

  getClassStatus(status: any) {
    switch (status) {
      case '00':
        return 'success'
      case '03':
        return 'error'
      case '20':
        return 'warning'
      default:
        return ''
    }
  }

  getLabelStatus(status: any) {
    switch (status) {
      case '00':
        return 'THÀNH CÔNG'
      case '03':
        return 'THÁT BẠI'
      case '20':
        return 'CHỜ TRA SOÁT'
      default:
        return ''
    }
  }

  hasInvalidField(qrData: any) {
    for (const key in qrData) {
      const value = qrData[key];
      if (value === null || value === undefined || value === '') {
        return true;
      }
    }
    return false;
  }

  onPrint() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.printInvoice();
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

  printInvoice() {
    this.printBtn.nativeElement.click();
  }
}
