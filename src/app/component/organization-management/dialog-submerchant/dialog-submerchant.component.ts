import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { GridViewModel } from '../../../model/GridViewModel';
import { DialogConfirmComponent } from '../../../base/shared/dialog-confirm/dialog-confirm.component';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';

@Component({
  selector: 'app-dialog-submerchant',
  standalone: true,
  imports: [ButtonModule, GridViewComponent],
  templateUrl: './dialog-submerchant.component.html',
  styleUrl: './dialog-submerchant.component.scss'
})
export class DialogSubmerchantComponent {
  countRowSelected: number = 3;
  columnsLocation: Array<GridViewModel> = [
    {
      name: 'id',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-center'];
        },
      }
    },
    {
      name: 'name',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        customCss: (obj: any) => {
          return ['text-center'];
        },
      }
    },
    {
      name: 'formatAddress',
      label: 'ĐỊA CHỈ',
      options: {
        customCss: (obj: any) => {
          return ['text-center'];
        },

      }
    },
    {
      name: 'status',
      label: 'TRẠNG THÁI',
      options: {
        customCss: (obj: any) => {
          return ['text-center'];
        },
        customBodyRender: (value: any, obj: any) => {
          let msg;
          if (value === 1) {
            msg = "<span class='status lock'> Đã khóa </span>";
          } else {
            msg = "<span class='status success'> Hoạt động </span>";
          }
          return msg;
        },
      }
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<DialogSubmerchantComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  onClose() {
    this.dialogRef.close();
  }

  doAction(actionType: boolean) {
    
    let lstRowSeclectId = this.data.filter((item : any) => item.checked === true).map((item: any) => item.id);

    if (this.countRowSelected > 1000) {
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
      this.dialogRef.close(lstRowSeclectId);
    }

  }

}
