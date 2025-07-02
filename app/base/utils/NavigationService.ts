import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  constructor(
    private router: Router,
  ) {}

  // Navigate và thay thế URL hiện tại, chặn Back
  navigateAndBlockBack(path: string[], queryParams: any = {}) {
    return this.router.navigate(path, { queryParams }).then(() => {
      this.preventBackNavigation();

      window.history.replaceState(path, '', location.href);

      return true;
    }).catch(err => {
      console.error('Navigation failed:', err);
      return false;
    });
  }

  private preventBackNavigation() {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }
}
