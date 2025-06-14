import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Button} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {InputCommon} from '../../../../common/directives/input.directive';
import {InputTextModule} from 'primeng/inputtext';
import {NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {FetchApiService} from '../../../../common/service/api/fetch-api.service';
import {ToastService} from '../../../../common/service/toast/toast.service';
import {REFUND_ENDPOINT} from '../../../../common/enum/EApiUrl';
import moment from 'moment';
import { QRCodeModule  } from 'angularx-qrcode';

@Component({
  selector: 'app-dialog-authentication',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Button,
    CalendarModule,
    InputCommon,
    InputTextModule,
    QRCodeModule ,
    NgSwitch,
    NgSwitchCase,
    NgClass,
    NgForOf,
    NgIf,
  ],
  templateUrl: './dialog-authentication.component.html',
  styleUrl: './dialog-authentication.component.scss'
})
export class DialogAuthenticationComponent implements OnInit {

  textQrCode: string = "";
  @ViewChild('qrContainer', {static: false}) qrContainer!: ElementRef;

  countdown = 120;
  otpLength = 8;
  countError = 0;
  otpControls: FormControl[] = [];
  otpStatus: 'idle' | 'error' | 'locked' | 'expired' = 'idle';
  qrStatus: 'idle' | 'expired' = 'idle';
  deviceId: any = null;

  constructor(
    public dialogRef: MatDialogRef<DialogAuthenticationComponent>,
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
  ) {
    for (let i = 0; i < this.otpLength; i++) {
      this.otpControls.push(new FormControl(''));
    }
    this.api.get(REFUND_ENDPOINT.GET_DOTP_STATUS, null).subscribe(res => {
        this.deviceId = res['data']['deviceId'];
      },
      error => {
        const errorData = error?.error || {};

      });
    this.textQrCode = `${dataDialog.id}##${dataDialog.transTime}##${dataDialog.userId}##${dataDialog.currentRefundMoney}##${dataDialog.txnReferenceOrigin}##${dataDialog.refundReason}##${this.deviceId || ''}`
  }

  ngOnInit() {
    const timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(timer);
        this.qrStatus = 'expired';
      }
    }, 1000);
  }

  onInput(event: any, index: number) {
    if (this.otpStatus === 'locked') {
      event.target.value = this.otpControls[index].value || '';
      return;
    }

    const input = event.target;
    const value = input.value;

    // Chỉ cho nhập số 0-9
    if (!/^\d$/.test(value)) {
      input.value = '';
      return;
    }

    this.otpControls[index].setValue(value);

    if (value && index < this.otpLength - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
    const isCompleted = this.otpControls.every(control => /^\d$/.test(control.value));
    if (isCompleted) {
      this.verifyOtp(); // gọi hàm xử lý OTP
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (this.otpStatus === 'locked') {
      event.preventDefault();
      return;
    }

    if (event.key === 'Backspace' && !this.otpControls[index].value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  getOtpValue(): string {
    return this.otpControls.map((c) => c.value).join('');
  }

  doAction(actionType: boolean) {
    if (!actionType) {
      this.dialogRef.close({isRedo: true});
      return;
    }

    this.verifyOtp()
  }

  onclose() {
    this.dialogRef.close();
  }

  verifyOtp() {
    const otp = this.getOtpValue();

    if (otp.length !== this.otpLength) {
      this.otpStatus = 'error';
      return;
    }

    let dataReq: any = {
      amount: this.dataDialog?.currentRefundMoney,
      desc: this.dataDialog?.refundReason,
      id: this.dataDialog?.id,
      otp: otp,
      transTime: this.dataDialog?.transTime || '',
      ftNumber: this.dataDialog?.txnReferenceOrigin,
      merchantId: this.dataDialog?.merchantId
    }
    this.api.post(REFUND_ENDPOINT.REFUND, dataReq).subscribe(
      (res) => {
        this.dialogRef.close({
          isRedo: false,
          ftNumber: res['data']['ftNumber'],
          amount: dataReq?.amount,
        });
      }, (error) => {
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == 'OTP_ERROR_O2') {
          this.countError = this.countError + 1;
          if (this.countError >= 5) {
            this.otpStatus = 'locked';
          }
        } else {
          this.onclose();
          this.toast.showError('Đã xảy ra lỗi vui lòng thử lại');
        }
      }
    );

  }

}
