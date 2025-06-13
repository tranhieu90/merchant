import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogSettingComponent} from '../dialog-setting/dialog-setting.component';
import {ButtonModule} from 'primeng/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {InputNumberModule} from 'primeng/inputnumber';
import {FetchApiService} from '../../../../common/service/api/fetch-api.service';
import {REFUND_ENDPOINT} from '../../../../common/enum/EApiUrl';
import {CommonUtils} from '../../../../base/utils/CommonUtils';
import moment from 'moment';
import {ToastService} from '../../../../common/service/toast/toast.service';
import {InputCommon} from '../../../../common/directives/input.directive';
import {InputSanitizeDirective} from '../../../../common/directives/inputSanitize.directive';

@Component({
  selector: 'app-dialog-repay',
  standalone: true,
  imports: [ButtonModule, InputTextModule, InputTextareaModule, InputNumberModule, ReactiveFormsModule, InputCommon, InputSanitizeDirective],
  templateUrl: './dialog-repay.component.html',
  styleUrl: './dialog-repay.component.scss'
})
export class DialogRepayComponent {
  formRepay!: FormGroup;
  maxMoney: number = 0;
  totalNumberCanRefund: number = 0;
  timeCanRefund: number = 0;
  traceTransfer: any;

  constructor(
    public dialogRef: MatDialogRef<DialogRepayComponent>,
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
  ) {

    this.formRepay = this.fb.group({
      money: [null, [Validators.required]],
      description: ['Hoan tra giao dich', [Validators.required, Validators.maxLength(500)]]
    });

    this.timeCanRefund = this.getDaysPassed(dataDialog?.transTime);
    if (this.timeCanRefund > 30) {
      this.toast.showError('Giao dịch không thể thực hiện do đã quá 30 ngày kể từ ngày phát sinh giao dịch thanh toán');
    }


    this.getRefundInfo(dataDialog?.ftNumber);
  }

  getRefundInfo(ftNumber: any) {
    let param = {
      id: this.dataDialog?.id,
      merchantId: this.dataDialog?.merchantId,
      transTime: this.dataDialog?.transTime
    }

    this.api.post(REFUND_ENDPOINT.GET_INFO_REFUND, param).subscribe(res => {
        this.totalNumberCanRefund = res['data']['totalNumberCanRefund'];
        const amountRefund = res['data']['amount'] || 0;
        this.traceTransfer = res['data']['traceTransfer'];
        this.maxMoney = this.dataDialog.amount - Number(amountRefund);
        if (this.totalNumberCanRefund <= 0) {
          this.toast.showError('Giao dịch không thể thực hiện do vượt quá số lần hoàn tiền quy định');
          return;
        }
        if (this.maxMoney <= 2000) {
          this.toast.showError('Giao dịch không thể thực hiện do số tiền có thể hoàn nhỏ hơn số tiền quy định');
          return;
        }
        this.formRepay.controls['money'].setValue(this.maxMoney);
      },
      error => {
        const errorData = error?.error || {};

      });
  }

  onBlurMoney(event: any) {
    let strMoney = event?.target?.value;
    if (strMoney.length > 0) {
      let money = Number(strMoney.replaceAll(",", "").replaceAll(" ₫", ""));
      if (money < 2000 || money === 2000) {
        this.formRepay.get('money')!.setErrors({minSmall: true})
      } else if (money > this.maxMoney) {
        this.formRepay.get('money')!.setErrors({maxBig: true})
      }
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  doAction() {
    let refundData = {
      currentRefundMoney: this.formRepay.get('money')?.value,
      refundReason: this.formRepay.get('description')?.value,
      id: this.dataDialog?.id,
      transTime: this.dataDialog?.transTime,
      txnReferenceOrigin: this.dataDialog?.ftNumber,
      merchantId: this.dataDialog?.merchantId
    }
    this.dialogRef.close(refundData);
  }

  clearValue(nameInput: string) {
    this.formRepay.get(nameInput)?.setValue('');
  }

  formatMoney(value: any): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫';
  }

  getDaysPassed(dateStr: string): number {
    // Định nghĩa offset cho UTC+7 (7 giờ * 60 phút = 420 phút)
    const UTC_PLUS_7_OFFSET_MINUTES = 7 * 60;

    const targetMoment = moment(dateStr, 'DD/MM/YYYY HH:mm:ss');

    if (!targetMoment.isValid()) {
      console.error(`Lỗi: Không thể parse chuỗi ngày: '${dateStr}' với định dạng 'DD/MM/YYYY HH:mm:ss'`);
      return NaN;
    }

    targetMoment.utcOffset(UTC_PLUS_7_OFFSET_MINUTES, true);

    const targetStartOfDay = targetMoment.startOf('day');

    const todayMoment = moment();

    todayMoment.utcOffset(UTC_PLUS_7_OFFSET_MINUTES, true);

    const todayStartOfDay = todayMoment.startOf('day');

    return todayStartOfDay.diff(targetStartOfDay, 'days');
  }
}
