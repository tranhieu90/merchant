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
import { BUSINESS_ENDPOINT } from '../../../../common/enum/EApiUrl';
import { CommonUtils } from '../../../../base/utils/CommonUtils';
import { CommonModule } from '@angular/common';
import { QRCodeModule  } from 'angularx-qrcode'
import moment from 'moment';
@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule, MatButtonModule, CommonModule, QRCodeModule ],
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
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private routeActive: ActivatedRoute,
    private auth: AuthenticationService
  ) {
    this.routeActive.queryParams.subscribe(params => {
      if (params['merchantId']) {
        this.subId = params['merchantId'];
        this.getDataDetail(this.subId);
      }
    });
  }
  ngOnInit(): void {
    if (!this.paymentQR) {
      this.genQRCode();
    }
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
          } else if (item.methodId == 333) {
            this.lstPaymentPod = item.paymentInfo
          } else {
            this.lstPaymentTHDD = item.paymentInfo
          }
        })
      }
      if (res['status'] == 400) {
        this.toast.showError('not support create payment method!');
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
}
