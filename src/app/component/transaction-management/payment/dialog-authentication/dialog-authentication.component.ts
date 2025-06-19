import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputCommon } from '../../../../common/directives/input.directive';
import { InputTextModule } from 'primeng/inputtext';
import { NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FetchApiService } from '../../../../common/service/api/fetch-api.service';
import { ToastService } from '../../../../common/service/toast/toast.service';
import { REFUND_ENDPOINT } from '../../../../common/enum/EApiUrl';
import moment from 'moment';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';

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
    QRCodeModule,
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
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef;

  countdown = 120;
  otpLength = 8;
  countError = 0;
  otpControls: FormControl[] = [];
  otpStatus: 'idle' | 'error' | 'locked' | 'expired' = 'idle';
  qrStatus: 'idle' | 'expired' = 'idle';
  deviceId: any = null;
  transactionId = '';

  constructor(
    public dialogRef: MatDialogRef<DialogAuthenticationComponent>,
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
  ) {
    this.transactionId = this.generateTransactionId();
    for (let i = 0; i < this.otpLength; i++) {
      this.otpControls.push(new FormControl(''));
    }
    this.api.get(REFUND_ENDPOINT.GET_DOTP_STATUS, null).subscribe(res => {
      this.deviceId = res['data']['deviceId'] || '';
      this.generateQr();
    },
      error => {
        const errorData = error?.error || {};
        this.deviceId = '';
        this.generateQr();
      });
  
  }

  generateQr() {
    const now = new Date();
    const expireTime = moment(new Date(now.getTime() + 120 * 1000)).format('DD/MM/YYYY HH:mm:ss');
    this.textQrCode = `${this.dataDialog.id}##${this.dataDialog.transTime}##${this.dataDialog.username}##${this.dataDialog.currentRefundMoney}##${this.dataDialog.txnReferenceOrigin}##${this.dataDialog.refundReason}##${this.deviceId}##${expireTime}##${this.dataDialog?.merchantId || ''}##${this.transactionId}`;
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

    if (this.otpStatus === 'error') {
      this.otpStatus = 'idle';
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
      this.dialogRef.close({ isRedo: true });
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
    this.api.postV2(REFUND_ENDPOINT.REFUND, dataReq, null, { transactionId: this.transactionId }).subscribe(
      (res) => {
        this.dialogRef.close({
          isRedo: false,
          ftNumber: res['data']['ftNumber'],
          amount: dataReq?.amount,
        });
      }, (error) => {
        console.log('refund error', error);
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == 'OTP_ERROR_O2') {
          this.otpStatus = 'error';
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
  isDisable() {
    const otp = this.getOtpValue();
    if (otp.length != this.otpLength || this.otpStatus == 'error') {
      return true;
    }
    return false;
  }

  generateTransactionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const timestamp = year + month + day + hours + minutes + seconds;

    return result + timestamp;
  }

}
