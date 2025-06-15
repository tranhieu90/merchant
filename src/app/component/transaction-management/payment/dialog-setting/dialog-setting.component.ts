import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';


@Component({
  selector: 'app-dialog-setting',
  standalone: true,
  imports: [ButtonModule, CheckboxModule, FormsModule],
  templateUrl: './dialog-setting.component.html',
  styleUrl: './dialog-setting.component.scss'
})
export class DialogSettingComponent implements OnInit {
  checked: boolean = true;
  lstChecked: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
  ) {
  }

  ngOnInit(): void {
    this.lstChecked = this.dataDialog;
  }

  onDefault() {
    this.lstChecked = [
      'paymentContent',
      'ftCode',
      'transactionCode'
    ];
  }

  onClose() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close(this.lstChecked);
  }
}
