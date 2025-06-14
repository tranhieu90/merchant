import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { BreadcumbComponent } from './base/layout/breadcumb/breadcumb/breadcumb.component';
import { HeaderComponent } from './base/layout/header/header.component';
import { NavBarComponent } from './base/layout/nav-bar/nav-bar.component';
import { LoadingComponent } from './base/layout/loading/loading.component';
import { MaterialModule } from './common/helpers/material-module';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavBarComponent, ToastModule, BreadcumbComponent,LoadingComponent,MaterialModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'merchantx';
  showLayout: boolean = true;

  constructor(
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentPath = this.router.url.split('?')[0]; // Lấy đường dẫn chính, bỏ query params
      this.showLayout = !['/login', '/change-password'].includes(currentPath);
    });
  }

  navCollapsed: boolean = false;

  NavCollapse(data: boolean) {
    this.navCollapsed = data;
  }
}
