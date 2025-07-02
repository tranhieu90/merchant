import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService: MessageService) { }

  showSuccess(message: string,textDetail?:string) {
    this.messageService.add({
      severity: 'success',
      summary: message,
      detail: textDetail,
      icon: 'icon-check_small',
    });
  }

  showInfo(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: message,
      icon: 'icon-information'
    });
  }

  showWarn(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: message,
      icon: 'icon-warning'
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: message,
      icon: 'icon-close_small'
    });
  }
}
