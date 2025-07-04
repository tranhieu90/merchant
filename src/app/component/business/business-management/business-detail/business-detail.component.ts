import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { environment } from '../../../../../environments/environment';
import { AuthenticationService } from '../../../../common/service/auth/authentication.service';
import { ToastService } from '../../../../common/service/toast/toast.service';
import { FetchApiService } from '../../../../common/service/api/fetch-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BusinessDialogComponent } from '../business-dialog/business-dialog.component';
import { BUSINESS_ENDPOINT, USER_ENDPOINT } from '../../../../common/enum/EApiUrl';
import { CommonUtils } from '../../../../base/utils/CommonUtils';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import { DialogRoleComponent, DialogRoleModel } from '../../../role-management/dialog-role/dialog-role.component';
import { UserVerifyStatus } from '../../../../common/constants/CUser';
import { UpdateUserComponent } from '../../../user-profile/update-user/update-user.component';
import { DialogConfirmModel } from '../../../../model/DialogConfirmModel';
import { DialogCommonService } from '../../../../common/service/dialog-common/dialog-common.service';
import { QRCodeComponent, QRCodeModule} from 'angularx-qrcode';
import { MERCHANT_RULES } from '../../../../base/constants/authority.constants';
@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule, MatButtonModule, CommonModule, QRCodeModule],
  templateUrl: './business-detail.component.html',
  styleUrl: './business-detail.component.scss'
})
export class BusinessDetailComponent implements OnInit {
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef;
  assetPath = environment.assetPath;
  dataDetail !: any
  paymentQR: any;
  lstPaymentPod: any = [];
  lstPaymentTHDD: any = [];
  methodIds: number[] = [324, 333, 332];
  subId!: number
  isShowAllPos: boolean = false;
  isShowAllThd: boolean = false;
  hasRoleUpdate?: boolean
  readonly MERCHANT_RULES = MERCHANT_RULES;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private routeActive: ActivatedRoute,
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService,
  ) {
    this.routeActive.queryParams.subscribe(params => {
      if (params['merchantId']) {
        this.subId = params['merchantId'];
        this.getDataDetail(this.subId);
      }
    });
  }
  ngOnInit(): void {
     this.hasRoleUpdate = this.auth.apiTracker([MERCHANT_RULES.BUSINESS_UPDATE]);
  }

  getDataDetail(subId: number) {
    let param = {
      subId: subId,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api.get(BUSINESS_ENDPOINT.GET_MERCHANT_DETAIL, buildParams).subscribe(res => {
      if (res && res['status'] == 200) {
        this.dataDetail = res.data;
        let merchantPaymentMethodList = this.dataDetail['merchantPaymentMethodList'];
        merchantPaymentMethodList.forEach((item: any) => {
          if (item.methodId == 324) {
            this.paymentQR = item.paymentInfo[0];
            if (!this.paymentQR?.qrCode) {
              this.genQRCode();
            }
          } else if (item.methodId == 333) {
            this.lstPaymentPod = item.paymentInfo
          } else {
            this.lstPaymentTHDD = item.paymentInfo
          }
        })
      }
      if (res['status'] == 400) {
        this.toast.showError(res?.soaErrorDesc);
      }
    }, (error) => {
      this.toast.showError('Xem chi tiết điểm bán xảy ra lỗi');
    });
  }

  fomatDate(value: any) {
    return value ? moment(value).format('DD/MM/YYYY') : '';
  }

  doEdit() {
    const dialogRef = this.dialog.open(BusinessDialogComponent, {
      width: '40%',
      data: this.dataDetail,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getDataDetail(this.subId);
      }
    })
  }

  doEditBusinessPayment() {
    this.router.navigate(['/business/business-payment'], {
      state: {
        dataInput: {
          merchantId: this.dataDetail.merchantId,
          subId: this.dataDetail.subId,
          lstPaymentQR: this.paymentQR,
          lstPaymentPod: this.lstPaymentPod,
          lstPaymentTHDD: this.lstPaymentTHDD
        }
      }
    });
  }

  genQRCode() {
    let param = {
      merchantId: this.subId,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api.get(BUSINESS_ENDPOINT.GEN_QR, buildParams).subscribe(res => {
      if (res && res['status'] == 200) {
        this.getDataDetail(this.subId);
      }else if(res && res['status']==400){
        this.toast.showError(res?.soaErrorDesc);
      }
    }, (error) => {
      this.toast.showError('GenQR xảy ra lỗi, vui lòng thử lại');
    });
  }

  downloadQRCode() {
    const canvas: HTMLCanvasElement | null = this.qrContainer.nativeElement.querySelector('canvas');

    if (canvas) {
      const scale = 3;
      const width = canvas.width * scale;
      const height = canvas.height * scale;

      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = width;
      resizedCanvas.height = height;

      const ctx = resizedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, width, height);

        const imgData = resizedCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'qr-code.png';
        link.click();
      } else {
        console.error('Không thể tạo context cho canvas mới');
      }
    } else {
      console.error('Không tìm thấy canvas trong QRCode');
    }
  }

  fomatAddress(address: string, commune: string, district: string, province: string) {
    return [address, commune, district, province]
      .filter(part => part?.trim())
      .map(part => part.trim())
      .join(', ');
  }

  toggleShowPoS() {
    this.isShowAllPos = !this.isShowAllPos;
  }
  toggleShowThd() {
    this.isShowAllThd = !this.isShowAllThd;
  }

  checkOpenUpdate(type: number) {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        type == 1 ? this.doEdit() : this.doEditBusinessPayment();
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
}
