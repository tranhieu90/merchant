import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../../environments/environment';
import { UserVerifyStatus } from '../../constants/CUser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  isFlag: boolean = false;
  constructor(private router: Router) {}

  private userInfoSubject = new BehaviorSubject<any>(this.getUserInfo());
  userInfo$ = this.userInfoSubject.asObservable();
  authenticate(oauth2: any) {
    localStorage.removeItem(environment.accessToken);
    localStorage.removeItem(environment.refeshToken);
    localStorage.setItem(environment.accessToken, oauth2.access_token);
    localStorage.setItem(environment.refeshToken, oauth2.refresh_token);
    const decoded: any = jwtDecode(oauth2.access_token);
    localStorage.setItem(environment.userInfo, decoded.sub);
    localStorage.setItem('menus', JSON.stringify(oauth2.menus));
    localStorage.setItem('avatar', oauth2.avatar);
    localStorage.setItem('scope', oauth2.scope);
    let userInfoParse = this.getUserInfo();
    this.userInfoSubject.next(userInfoParse);
    let userInfor = JSON.parse(decoded.sub);
    if (userInfor['firstChangePassword'] === 0)
      this.router.navigate(['/change-password']);
    else this.router.navigate(['/dashboard']);
  }

  getToken() {
    return localStorage.getItem(environment.accessToken);
  }

  isTokenExpired(): boolean {
    let token = localStorage.getItem(environment.accessToken);
    const date = this.getTokenExpirationDate(token);
    if (date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  getTokenExpirationDate(token: any): any {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) {
      return null;
    }
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  getUserInfo() {
    const userInfo = localStorage.getItem(environment.userInfo);
    const avatar = localStorage.getItem('avatar');
    if (userInfo) {
      let userInfoParse = JSON.parse(userInfo);
      userInfoParse.avatar = avatar && avatar !== 'null' ? avatar : null;
      return userInfoParse;
    }
    return null;
  }

  getMenuInfo(): any {
    return JSON.parse(localStorage.getItem('menus') || '[]');
  }

  isLoggedIn(): boolean {
    let token: string | null = null;
    token = localStorage.getItem(environment.accessToken);
    if (token) {
      return true;
    }
    return false;
  }

  checkVerifyUserInfo() {
    const userInfo = this.getUserInfo();
    if (userInfo?.isVerify == 1) {
      return UserVerifyStatus.VERIFIED;
    } else if (
      userInfo?.emailChange != null ||
      userInfo?.emailChange != undefined
    ) {
      return UserVerifyStatus.UN_VERIFIED_WITH_EMAIL;
    }
    return UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL;
  }

  isShowExpChange() {
    return this.isFlag;
  }

  setFlagCheck(flag: boolean) {
    this.isFlag = flag;
  }

  updateUserInfo(newInfo: any) {
    localStorage.setItem(environment.userInfo, JSON.stringify(newInfo));
    this.userInfoSubject.next(newInfo);
  }

  apiTracker(path: string | string[]) {
    let apiList: any = localStorage
      .getItem('scope')
      ?.split(',')
      .map((api) => api.trim());
    if (!Array.isArray(path)) {
      return apiList.includes(path);
    } else {
      for (const authority of path) {
        if (apiList.includes(authority)) {
          return true;
        }
      }
    }
    return false;
  }
}
