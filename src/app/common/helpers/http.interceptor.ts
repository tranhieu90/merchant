import { environment } from '../../../environments/environment';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  retry,
  switchMap,
  take,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../service/toast/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { IdleService } from '../service/idle/idle.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { LOGIN_ENDPOINT, REFUND_ENDPOINT } from '../enum/EApiUrl';
import { DialogCommonService } from '../service/dialog-common/dialog-common.service';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  private _totalRq: number = 0;
  private lstUrlNoAuth: string[] = [
    'auth/login',
    'forget-password/send-mail',
    'forget-password/reset-password',
  ];
  private lstUrlNoRefresh: string[] = [
    'auth/login',
    'auth/auto-logout',
    'auth/logout',
    'user/verify-email',
  ];
  private urlVerify: string = 'api/v1/user/verify-email';
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  constructor(
    private router: Router,
    private toast: ToastService,
    private idleService: IdleService,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialog,
    private dialogCommon: DialogCommonService
  ) {}

  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    //lưu last_action và pre_last_action:
    const now = new Date().toISOString();
    const currentLastActive = sessionStorage.getItem('last_action');
    if (currentLastActive) {
      sessionStorage.setItem('previous_last_action', currentLastActive);
    }
    sessionStorage.setItem('last_action', now);
    //handler request gui di

    if (httpRequest.url.includes(LOGIN_ENDPOINT.REFESH_TOKEN)) {
      return next.handle(this.addAuthRefresh(httpRequest));
    }
    this._totalRq++;
    this.spinner.show();

    return next.handle(this.addAuthToken(httpRequest)).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorDetail = error.error;
        let message = '';
        let isToast = true;
        if (
          typeof window !== 'undefined' &&
          error.error instanceof ErrorEvent
        ) {
          // handle client-side error
          message = `Error: ${error.error.message}`;
        } else {
          // handle server-side error
          message = `Error Status: ${error.status}\nMessage: ${error.message}`;
        }
        if (this.lstUrlNoRefresh.some((url) => httpRequest.url.includes(url))) {
          isToast = false;
        }
        if (error['status'] === 401) {
          let preTime = sessionStorage.getItem('previous_last_action');
          let currentTime = sessionStorage.getItem('last_action');
          let isRefresh = this.diffrentTime(preTime, currentTime);
          if (
            this.lstUrlNoRefresh.some((url) => httpRequest.url.includes(url)) ||
            !isRefresh
          ) {
            this.handleSessionLogout(isToast);
            return EMPTY;
          } else {
            // call api refresh
            return this.handle401Error(httpRequest, next).pipe(
              catchError(() => {
                // Nếu refresh fail → cũng không propagate lỗi
                return EMPTY;
              })
            );
          }
        }

        if (error['status'] === 403) {
          this.handelError403();
          return EMPTY;
        }

        if (
          error['status'] === 500 ||
          errorDetail.soaErrorCode == 'SYSTEM_ERROR' ||
          errorDetail.soaErrorCode == 'System error' ||
          errorDetail.soaErrorCode == '002'
        ) {
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          dataDialog.title = 'Lỗi hệ thống';
          dataDialog.message =
            'Hệ thống đang bị gián đoạn. Vui lòng thử lại hoặc liên hệ quản trị viên để được hỗ trợ.';
          dataDialog.buttonLabel = 'Tôi đã hiểu';
          dataDialog.icon = 'icon-error';
          dataDialog.viewCancel = false;
          dataDialog.iconColor = 'error';
          dataDialog.width = '25%';
          this.dialogCommon
            .openDialogInfo(dataDialog)
            .subscribe((result) => {});
          return EMPTY;
        }

        if (
          error['status'] === 400 &&
          errorDetail.soaErrorCode == 'LOGIN_ERROR_009'
        ) {
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          dataDialog.title = 'Merchant mất kết nối';
          dataDialog.message =
            'Merchant mất kết nối sử dụng dịch vụ, vui lòng liên hệ quản trị viên để được hỗ trợ.';
          dataDialog.buttonLabel = 'Tôi đã hiểu';
          dataDialog.icon = 'icon-lock';
          dataDialog.width = '25%';
          dataDialog.viewCancel = false;
          dataDialog.iconColor = 'icon warning';
          this.dialogCommon
            .openDialogInfo(dataDialog)
            .subscribe((result) => {});
          return EMPTY;
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this._totalRq--;
        if (this._totalRq === 0) {
          this.spinner.hide();
        }
      })
    );
  }

  addAuthToken(request: HttpRequest<any>) {
    const isAbsoluteUrl = /^http(s)?:\/\//.test(request.url);
    if (request.url === this.urlVerify) {
      sessionStorage.setItem('verify', request.urlWithParams);
    }
    let token: any = localStorage.getItem(environment.accessToken);
    let reqClone: any;

    // ducpv comment
    // reqClone = request.clone({
    //   url: environment.apiUrl + request.url,
    // });

    // ducpv start code
    if (isAbsoluteUrl) {
      reqClone = request.clone();
    } else {
      // ✅ Nếu là relative URL → ghép với apiUrl
      reqClone = request.clone({
        url: environment.apiUrl + request.url,
      });
    }
    // ducpv end code

    let currentHeaders: { [key: string]: string } = {};
    request.headers.keys().forEach((key) => {
      const value = request.headers.get(key);
      if (value) {
        currentHeaders[key] = value;
      }
    });

    if (!token) {
      return reqClone.clone({
        setHeaders: {
          ...currentHeaders,
          'Content-Type': 'application/json',
          clientMessageId: uuidv4(),
        },
      });
    }
    if (this.lstUrlNoAuth.some((url) => request.url.includes(url))) {
      return reqClone.clone({
        setHeaders: {
          ...currentHeaders,
          clientMessageId: uuidv4(),
        },
      });
    }
    return reqClone.clone({
      setHeaders: {
        ...currentHeaders,
        Authorization: `Bearer ${token}`,
        clientMessageId: uuidv4(),
      },
    });
  }

  addAuthRefresh(request: HttpRequest<any>) {
    let reqClone: any;
    reqClone = request.clone({
      url: environment.apiUrl + request.url,
    });
    return reqClone.clone({
      setHeaders: {
        clientMessageId: uuidv4(),
      },
    });
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.idleService.refreshToken().pipe(
        catchError((err) => {
          this.handleSessionLogout(true);
          return EMPTY;
        }),
        switchMap((newToken: string) => {
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addAuthToken(request)).pipe(
            catchError((err) => {
              // Ngăn propagate lỗi sau khi retry token
              this.handleSessionLogout(true);
              return EMPTY;
            })
          );
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => next.handle(this.addAuthToken(request)))
      );
    }
  }

  handleSessionLogout(isToast?: boolean) {
    // localStorage.clear();
    const currentUrl = this.router.url;
    sessionStorage.setItem('redirectUrlAfterLogin', currentUrl);
    localStorage.removeItem(environment.accessToken);
    localStorage.removeItem(environment.refeshToken);
    localStorage.removeItem(environment.userInfo);
    localStorage.removeItem(environment.settingPayment);
    localStorage.removeItem(environment.settingCashback);
    this.router.navigate(['/login']);
    if (isToast) {
      this.toast.showWarn(
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      );
    }
    this.dialogRef.closeAll();
    this.idleService.stopIdleWatching();
  }

  handelError403(){
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Quyền thao tác';
    dataDialog.message = 'Bạn không có quyền thao tác chức năng này.';
    dataDialog.buttonLabel = 'Thử lại';
    dataDialog.icon = 'icon-warning';
    dataDialog.width = '500px'
    dataDialog.iconColor = 'icon warning';
    dataDialog.viewCancel = false ;
    dataDialog.buttonLabel='Tôi đã hiểu'
    this.dialogCommon.openDialogInfo(dataDialog)
  }

  diffrentTime(preTime: string | null, curentTime: string | null): boolean {
    if (!preTime || !curentTime) {
      return false;
    }
    const lastAction = new Date(curentTime).getTime();
    const prevLastAction = new Date(preTime).getTime();
    const diffInMinutes = (lastAction - prevLastAction) / (1000 * 60);
    return diffInMinutes < 15;
  }
}
