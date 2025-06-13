import {Component, Inject, OnInit} from '@angular/core';
import {DialogConfirmModel} from '../../../model/DialogConfirmModel';
import {NgClass} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'dialog-confirm',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './dialog-confirm.component.html',
  styleUrl: './dialog-confirm.component.scss'
})
export class DialogConfirmComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public dataConfirm: DialogConfirmModel,
  ) {
  }

  ngOnInit() {
  }

  doAction(actionType: boolean) {
    this.dialogRef.close(actionType);
  }

  onclose(){
    this.dialogRef.close();
  }
}
