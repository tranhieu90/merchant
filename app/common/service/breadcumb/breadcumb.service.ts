import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class BreadcumbService {

  private _breadcrumbs = new BehaviorSubject<Array<{ label: string, url: string }>>([]);
  breadcrumbs$ = this._breadcrumbs.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root, 1);

      this._breadcrumbs.next(breadcrumbs);
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, first: number, url: string = '', breadcrumbs: Array<{ label: string, url: string }> = []): Array<{ label: string, url: string }> {
    const children: ActivatedRoute[] = route.children;
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Tổng quan', url: '/dashboard' });
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      let label;
      if (!_.isEmpty(child.snapshot.queryParams) && first == 2 && _.size(child.snapshot.data) == 2) {
        label = child.snapshot.data['breadcrumb2'];
      } else {
        label = child.snapshot.data['breadcrumb'];
      }
      if (routeURL !== '') {
        url += `/${routeURL}`;
        breadcrumbs.push({ label: label, url: url });
      }

      return this.createBreadcrumbs(child, 2, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
