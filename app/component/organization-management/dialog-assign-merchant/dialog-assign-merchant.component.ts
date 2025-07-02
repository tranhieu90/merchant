import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogConfirmComponent } from '../../../base/shared/dialog-confirm/dialog-confirm.component';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import _ from 'lodash';
import { TableMerchantComponent } from '../table-merchant/table-merchant.component';

@Component({
  selector: 'app-dialog-assign-merchant',
  standalone: true,
  imports: [ButtonModule, TableMerchantComponent],
  templateUrl: './dialog-assign-merchant.component.html',
  styleUrl: './dialog-assign-merchant.component.scss'
})
export class DialogAssignMerchantComponent implements OnInit {
  dataSource: any = [];
  lstRowChecked: any = [];

  constructor(
    public dialogRef: MatDialogRef<DialogAssignMerchantComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit(): void {
    this.dataSource = _.cloneDeep(this.data);
  }

  onClose() {
    this.dialogRef.close();
  }

  doAction() {
    if (this.lstRowChecked.length > 1000) {
      let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
      dataConfirm.title = 'Số lượng điểm kinh doanh đã vượt quá số lượng tối đa (1000 điểm)';
      dataConfirm.message = 'Vui lòng chuyển điểm kinh doanh sang nhóm khác';
      dataConfirm.icon = 'icon-warning';
      dataConfirm.iconColor = 'warning';
      dataConfirm.viewCancel = false;
      dataConfirm.buttonLabel = "Tôi đã hiểu"

      this.dialog.open(DialogConfirmComponent, {
        width: '500px',
        data: dataConfirm,
        disableClose: true,
      });
    }
    else {
      let lstRowCheckedId = this.lstRowChecked.map((item: any) => item.merchantId);
      this.dialogRef.close(lstRowCheckedId);
    }
  }

  returnRowsChecked(lst: any) {
    this.lstRowChecked = lst;
  }
}
