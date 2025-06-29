import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { NavigationService } from '../../../base/utils/NavigationService';
import { LoginNotificationComponent } from '../../../component/dialog/login-notification/login-notification.component';
import { LOGIN_ENDPOINT, USER_ENDPOINT } from '../../enum/EApiUrl';
import { FetchApiService } from '../api/fetch-api.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private idleSubscription: Subscription | null = null;
  timer: number = 15 * 60;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private api: FetchApiService,
    private toast: ToastService,
    private bnIdle: BnNgIdleService,
    private navigate: NavigationService,
  ) {
  }

  startIdleWatching(): void {
    if (typeof window !== 'undefined') {
      this.idleSubscription = this.bnIdle.startWatching(this.timer).pipe(take(1)).subscribe((res) => {
        if (res) {
          this.logoutAuto();
        }
      });
    }
  }

  stopIdleWatching(): void {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
      this.idleSubscription = null;
    }
    this.bnIdle.stopTimer();
  }

  logoutAuto() {
    this.navigate.navigateAndBlockBack(['/login']);
    this.dialog.open(LoginNotificationComponent, {
      panelClass: 'dialog-login-noti',
      data: {
        title: 'Phiên đăng nhập hết hạn',
        message: 'Bạn vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.',
        lockText: 'Tôi đã hiểu',
        icon: 'icon-warning',
        typeClass: 'warning',
        accountLock: true,
        close: false
      },
      width: '30%',
      disableClose: true,
    });
    let token: any = localStorage.getItem(environment.accessToken);
    let dataReq = { token: token }
    this.api.post(USER_ENDPOINT.AUTO_LOGOUT, dataReq).subscribe(
      (res) => {
        if (res.status === 200) {
          localStorage.removeItem(environment.accessToken);
          localStorage.removeItem(environment.userInfo);
          localStorage.removeItem(environment.settingPayment);
          localStorage.removeItem(environment.settingCashback);
          this.router.navigate(['/login']);
        }
      }, () => {
        this.toast.showError("Đã xảy ra lỗi, vui lòng thử lại!")
      },
    );
    this.stopIdleWatching();
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(environment.refeshToken);
    if (refreshToken) {
      return this.api.post(LOGIN_ENDPOINT.REFESH_TOKEN, refreshToken).pipe(
        map((res) => {
          localStorage.removeItem(environment.accessToken);
          localStorage.removeItem(environment.refeshToken);
          localStorage.setItem(environment.accessToken, res.access_token);
          localStorage.setItem(environment.refeshToken, res.refresh_token);
          const decoded: any = jwtDecode(res.access_token);
          localStorage.setItem(environment.userInfo, decoded.sub);
          return res.access_token;
        }),
        catchError(err => {
          this.toast.showError("Token không hợp lệ!");
          return throwError(() => err);
        })
      );
    } else {
      return throwError(() => new Error('No refresh token found'));
    }
  }

}
