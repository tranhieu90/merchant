import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { ModalModel } from '../../../model/ModalModel';
 
@Component({
  selector: 'app-m-modal',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './m-modal.component.html',
  styleUrl: './m-modal.component.scss'
})
export class MModalComponent implements OnInit{
  constructor(
    public dialogRef: MatDialogRef<MModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dataModal: ModalModel,
  ) {
  }
  ngOnInit(): void {
  }
  onclose(actionType:boolean) {
    this.dialogRef.close(actionType);
  }
}