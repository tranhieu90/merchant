import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputCommon } from '../../../../common/directives/input.directive';
import { REGEX_PATTERN } from '../../../../common/enum/RegexPattern';
import { ToastService } from '../../../../common/service/toast/toast.service';

@Component({
  selector: 'app-cashback-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Button,
    CalendarModule,
    InputCommon,
    InputTextModule,
  ],
  templateUrl: './cashback-dialog.component.html',
  styleUrl: './cashback-dialog.component.scss'
})
export class CashbackDialogComponent implements OnInit {

  pass: any;
  formCashback!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CashbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.formCashback = this.fb.group({
      money: ['', [Validators.required]],
      content: ['', [Validators.maxLength(500)]],
    })
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


  clearValue(nameInput: string) {
    this.formCashback.get(nameInput)?.setValue('');
  }

}
