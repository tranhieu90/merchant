import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { LoginNotificationComponent } from '../../../component/dialog/login-notification/login-notification.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { DialogChangePwComponent } from '../../../component/change-password/dialog-change-pw/dialog-change-pw.component';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'nav-header',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatBadgeModule, MatMenuModule, MatListModule, ButtonModule, CommonModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  assetPath = environment.assetPath;
  @Output() NavCollapse = new EventEmitter<boolean>();
  isCollapsed = false;
  hidden = false;
  userName!: string;
  userNameFomat!: string;
  avatarBase64!: string;
  roleName!: string;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.authService.userInfo$.subscribe(userInfo => {
      if (userInfo) {
        this.userName = userInfo.fullName;
        this.userNameFomat = this.userName.length > 16 ? this.userName.slice(0, 16) + '...' : this.userName;
        this.avatarBase64 = userInfo?.avatar;
        this.roleName = userInfo?.roleName?.length > 16 ? userInfo?.roleName?.slice(0, 16) + '...' : userInfo?.roleName;
      }
    });
  }


  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }

  toggleNavCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.NavCollapse.emit(this.isCollapsed);
  }

  doViewProfile() {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.dialog.open(LoginNotificationComponent, {
      panelClass: 'dialog-login-noti',
      data: {
        title: 'Đăng xuất',
        message: 'Bạn chắc chắn muốn đăng xuất khỏi hệ thống?',
        lockText: 'Đồng ý',
        icon: 'icon-warning',
        typeClass: 'warning',
        type: 'logout',
        accountLock: true,
        close: true
      },
      width: '30%',
      disableClose: true,
    })
    ;
  }

  doChangePassword() {
    this.dialog.open(DialogChangePwComponent, {
      width: '600px',
      panelClass: 'dialog-change-pw',
      data: {
        title: 'Đổi mật khẩu mới',
      },
      disableClose: true
    });
  }
}
