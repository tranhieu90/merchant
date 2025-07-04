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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
@Component({
  selector: 'app-m-toast',
  standalone: true,
  imports: [ToastModule, ButtonModule, RippleModule, NavBarComponent, NzDatePickerModule],
  templateUrl: './m-toast.component.html',
  styleUrl: './m-toast.component.scss',
  providers: [MessageService]
})
export class MToastComponent {
  navCollapsed: boolean = false;
  private tempFromDate: Date | null = null;
  maxDate: any = null;
  minDate: any = null;
  constructor(private messageService: MessageService,
    private dialogCommon: DialogCommonService,
    private dialog: MatDialog
  ) { }

  disabledDate = (current: Date): boolean => {
    if (!current) return false;

    const currentDate = new Date(current);
    currentDate.setHours(0, 0, 0, 0);

    const minDate = new Date(this.minDate);
    minDate.setHours(0, 0, 0, 0);

    const maxDate = new Date(this.maxDate);
    maxDate.setHours(0, 0, 0, 0);

    // Disable ngày ngoài khoảng min/max tổng
    if (currentDate < minDate || currentDate > maxDate) {
      return true;
    }

    // Khi đang chọn toDate (đã có tempFromDate)
    if (this.tempFromDate) {
      const fromDateOnly = new Date(this.tempFromDate);
      fromDateOnly.setHours(0, 0, 0, 0);

      // Disable ngày trước fromDate
      if (currentDate < fromDateOnly) {
        return true;
      }

      // Disable ngày sau fromDate + 30 ngày hoặc sau ngày hiện tại
      const maxToDate = new Date(fromDateOnly.getTime() + 30 * 24 * 60 * 60 * 1000);
      const actualMaxToDate = maxToDate > maxDate ? maxDate : maxToDate;
      actualMaxToDate.setHours(0, 0, 0, 0);

      if (currentDate > actualMaxToDate) {
        return true;
      }
    }

    return false;
  };
  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
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
  collapsed() {
    this.navCollapsed = !this.navCollapsed;
  }

}
