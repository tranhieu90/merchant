import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { NavBarComponent } from '../../layout/nav-bar/nav-bar.component';
import { ModalModel } from '../../../model/ModalModel';
import { MatDialog } from '@angular/material/dialog';
import { MModalComponent } from '../m-modal/m-modal.component';
@Component({
  selector: 'app-m-toast',
  standalone: true,
  imports: [ToastModule, ButtonModule, RippleModule,NavBarComponent],
  templateUrl: './m-toast.component.html',
  styleUrl: './m-toast.component.scss',
  providers: [MessageService]
})
export class MToastComponent {

  constructor(private messageService: MessageService,
    private dialogCommon: DialogCommonService,
    private dialog:MatDialog
  ) { }

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Title',
      // detail: 'Đã lưu thành công!', 
      icon: 'icon-check_small',
      life: 500000 //dùng icon font của MB
    });
  }

  showInfo() {
    this.messageService.add({ severity: 'info', summary: 'Infoooooooooooooooooooooo', icon: 'icon-information' });
    this.showConfimDialog('icon-information', 'icon info');
  }

  showWarn() {
    this.messageService.add({ severity: 'warn', summary: 'Warnnnnnnnnnnnnnnn', icon: 'icon-warning' });
    this.showConfimDialog('icon-warning', 'icon warning');
  }

  showError() {
    this.messageService.add({ severity: 'error', summary: 'Errorrrrrrrrrrrrrrrrr', icon: 'icon-close_small' });
    this.showConfimDialog('icon-error', 'icon error', 'error');
  }

  showConfimDialog(icon: string, iconColor: string, btnColor?: any, btnCancel?: number) {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Title';
    dataDialog.message = 'message...';
    dataDialog.buttonLabel = 'Thử lại';
    dataDialog.icon = icon;
    dataDialog.width = '500px'
    dataDialog.iconColor = iconColor;
    dataDialog.buttonColor = btnColor ?? null;
    dataDialog.viewCancel = btnCancel && btnCancel == 1 ? false : true;
    this.dialogCommon.openDialogInfo(dataDialog)
  }

  showModal() {
    let dataModal: ModalModel = new ModalModel();
    dataModal.title = 'title',
      dataModal.textTitle = 'message title',
      dataModal.labelLeft = 'Hủy',
      dataModal.labelRight = 'Xác nhận'
    const dialogRef = this.dialog.open(MModalComponent, {
      width: '500px',
      data: dataModal,
      disableClose: true,
    });
  }

}
