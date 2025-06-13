import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputCommon } from '../../../common/directives/input.directive';
import { ToastService } from '../../../common/service/toast/toast.service';
import { generatePassword } from '../../../common/helpers/Ultils';

@Component({
  selector: 'app-gen-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Button,
    CalendarModule,
    InputCommon,
    InputTextModule,
  ],
  templateUrl: './gen-password.component.html',
  styleUrl: './gen-password.component.scss'
})
export class GenPasswordComponent implements OnInit {

  pass: any;

  constructor(
    public dialogRef: MatDialogRef<GenPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    private toast: ToastService,
  ) {
  }

  ngOnInit() {

  }

  doAction(actionType: boolean) {
    const data = {
      actionType: actionType,
      pass: this.pass
    }
    this.dialogRef.close(data);
  }

  onclose() {
    this.dialogRef.close();
  }

  createPassword() {
    const newPassword = generatePassword();
    this.pass = newPassword;
  }

  // generatePassword(length: number = 9) {
  //   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   let password = '';
  //   for (let i = 0; i < length; i++) {
  //     password += chars.charAt(Math.floor(Math.random() * chars.length));
  //   }
  //   this.pass = password;
  // }

  copyPassword() {
    const password = this.pass;
    if (!password) return;

    navigator.clipboard.writeText(password).then(() => {
      this.toast.showSuccess("Đã sao chép")
    }).catch(() => {
      this.toast.showError("Lỗi, Không thể sao chép!")
    });
  }
}
