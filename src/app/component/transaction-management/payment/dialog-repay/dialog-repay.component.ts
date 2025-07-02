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
import { InputSanitizeDirective2 } from '../../../../common/directives/inputSanitize2.directive';

@Component({
  selector: 'app-dialog-repay',
  standalone: true,
  imports: [ButtonModule, InputTextModule, InputTextareaModule, InputNumberModule, ReactiveFormsModule, InputCommon, InputSanitizeDirective2],
  templateUrl: './dialog-repay.component.html',
  styleUrl: './dialog-repay.component.scss'
})
export class DialogRepayComponent {
  formRepay!: FormGroup;
  maxMoney: number = 0;
  totalNumberCanRefund: number = 0;
  isExpireDate: any;
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
      description: ['Hoan tra giao dich', [Validators.required, Validators.maxLength(50)]]
    });

    this.isExpireDate = this.getExpiredDate(dataDialog?.transTime);
    console.log("this.isExpireDate", this.isExpireDate);
    if (this.isExpireDate) {
      this.toast.showError('Giao dịch không thể thực hiện do đã quá 6 tháng kể từ ngày phát sinh giao dịch thanh toán');
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
        const amountRefund = res['data']['totalAmountRefund'] || 0;
        this.traceTransfer = res['data']['traceTransfer'];
        this.maxMoney = this.dataDialog.amount - Number(amountRefund);
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
    if (this.formRepay.invalid || this.totalNumberCanRefund <= 0 || this.isExpireDate) {
      this.formRepay.markAllAsTouched();
      this.formRepay.markAsDirty();
      return;
    }
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
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ';
  }

  getExpiredDate(dateStr: string): boolean {

    const UTC_PLUS_7_OFFSET_MINUTES = 7 * 60;

    const targetMoment = moment(dateStr, 'DD/MM/YYYY HH:mm:ss');
    if (!targetMoment.isValid()) {
      console.error(`Lỗi: Không thể parse chuỗi ngày: '${dateStr}' với định dạng 'DD/MM/YYYY HH:mm:ss'`);
      return true;
    }

    targetMoment.utcOffset(UTC_PLUS_7_OFFSET_MINUTES, true);

    const expiredMoment = targetMoment.clone().add(6, 'months').startOf('day');

    const todayMoment = moment().utcOffset(UTC_PLUS_7_OFFSET_MINUTES, true).startOf('day');


    return todayMoment.isAfter(expiredMoment);
  }

  onEnterSubmit(event: any) {
    event.preventDefault();

    const inputEl = (event.target as HTMLElement);
    if (inputEl && inputEl.id === 'integeronly') {
      const fakeEvent = { target: { value: this.formRepay.get('money')?.value?.toString() || '' } };
      this.onBlurMoney(fakeEvent);
    }

    Object.keys(this.formRepay.controls).forEach(field => {
      const control = this.formRepay.get(field);
      control?.markAsTouched({ onlySelf: true });
    });

    if (this.formRepay.valid && this.totalNumberCanRefund > 0 && !this.isExpireDate) {
      this.doAction();
    }
  }
}
