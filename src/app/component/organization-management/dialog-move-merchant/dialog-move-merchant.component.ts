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
  //lstMerchantIdMove: number[] = [];
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
    this.dialogRef.close(this.areaIdMove);
    // let areaActive = this.data.lstAreas.find(item => item.id == this.data.areaIdActive);
    // let areaMove = this.data.lstAreas.find(item => item.id == this.areaIdMove);
    // if (areaActive && areaMove) {
    //   let countMerchant = this.data.lstMerchantIdMove.length + areaMove.lstMerchant.length;
    //   if (countMerchant > 1000) {
    //     let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
    //     dataConfirm.title = 'Số lượng điểm kinh doanh đã vượt quá số lượng tối đa (1000 điểm)';
    //     dataConfirm.message = 'Vui lòng chuyển điểm kinh doanh sang nhóm khác';
    //     dataConfirm.icon = 'icon-warning';
    //     dataConfirm.iconColor = 'warning';
    //     dataConfirm.viewCancel = false;
    //     dataConfirm.buttonLabel = "Tôi đã hiểu"

    //     this.dialog.open(DialogConfirmComponent, {
    //       width: '500px',
    //       data: dataConfirm,
    //       disableClose: true,
    //     });
    //   }
    //   else{
    //     areaActive.lstMerchant = areaActive.lstMerchant.filter((item: any) => !this.data.lstMerchantIdMove.includes(item));
    //     areaMove.lstMerchant = areaMove.lstMerchant.concat(this.data.lstMerchantIdMove);
        
    //     this.dialogRef.close(true);
    //   }
    // }

  }
}
