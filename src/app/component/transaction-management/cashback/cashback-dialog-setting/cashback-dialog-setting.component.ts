import {Component, Inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';


@Component({
  selector: 'app-cashback-dialog-setting',
  standalone: true,
  imports: [ButtonModule, CheckboxModule, FormsModule],
  templateUrl: './cashback-dialog-setting.component.html',
  styleUrl: './cashback-dialog-setting.component.scss'
})
export class CashbackDialogSettingComponent implements OnInit {
  checked: boolean = true;
  lstChecked: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CashbackDialogSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
  ) {
  }

  ngOnInit(): void {
    this.lstChecked = this.dataDialog;
  }

  onDefault() {
    this.lstChecked = [
      'refundTransactionCode',
      'refundFTCode',
      'rawFTCode',];
  }

  onClose() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close(this.lstChecked);
  }
}
