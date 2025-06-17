import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { AreaModel } from '../../../model/AreaModel';
import { AreaViewComponent } from '../area-view/area-view.component';
import { NgFor, NgIf } from '@angular/common';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { DialogConfirmComponent } from '../../../base/shared/dialog-confirm/dialog-confirm.component';

export class MoveMerchantModel {
  lstAreas: AreaModel[] = [];
  lstAreaByOrder: AreaModel[] = [];
  areaIdActive: number = 0;
  lstMerchantIdSelected: number[] = [];  // ✅ thêm dòng này
  isCallApi: boolean = false;
}

@Component({
  selector: 'app-dialog-move-merchant',
  standalone: true,
  imports: [ButtonModule, AreaViewComponent, NgFor, NgIf],
  templateUrl: './dialog-move-merchant.component.html',
  styleUrl: './dialog-move-merchant.component.scss'
})
export class DialogMoveMerchantComponent implements OnInit {
  areaIdMove: number = 0;

  constructor(
    public dialogRef: MatDialogRef<DialogMoveMerchantComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: MoveMerchantModel,
  ) {
  }

  ngOnInit(): void {
    this.areaIdMove = this.data.areaIdActive;
  }

  onClose() {
    this.dialogRef.close();
  }

  doChangeAreaIdMove(areaMove: AreaModel) {
    this.areaIdMove = areaMove.id;
  }

  doAction() {
    this.dialogRef.close({
      areaId: this.areaIdMove,
      merchantIds: this.data.lstMerchantIdSelected
    });
  }
}
