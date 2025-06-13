import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
@Component({
  selector: 'app-m-toast',
  standalone: true,
  imports: [ToastModule, ButtonModule, RippleModule],
  templateUrl: './m-toast.component.html',
  styleUrl: './m-toast.component.scss',
  providers: [MessageService]
})
export class MToastComponent {

  constructor(private messageService: MessageService) { }

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Title',
      // detail: 'Đã lưu thành công!', 
      icon: 'icon-check_small',
      life:500000 //dùng icon font của MB
    });
  }

  showInfo() {
    this.messageService.add({ severity: 'info', summary: 'Infoooooooooooooooooooooo', icon: 'icon-information' });
  }

  showWarn() {
    this.messageService.add({ severity: 'warn', summary: 'Warnnnnnnnnnnnnnnn', icon: 'icon-warning'});
  }

  showError() {
    this.messageService.add({ severity: 'error', summary: 'Errorrrrrrrrrrrrrrrrr', icon: 'icon-close_small' });
  }

}
