import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { BreadcumbComponent } from './base/layout/breadcumb/breadcumb/breadcumb.component';
import { HeaderComponent } from './base/layout/header/header.component';
import { NavBarComponent } from './base/layout/nav-bar/nav-bar.component';
import { LoadingComponent } from './base/layout/loading/loading.component';
import { MaterialModule } from './common/helpers/material-module';
import { PrimeNGConfig } from 'primeng/api';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavBarComponent, ToastModule, BreadcumbComponent, LoadingComponent, MaterialModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'merchantx';
  showLayout: boolean = true;

  constructor(
    private router: Router,
    private primengConfig: PrimeNGConfig
  ) {

  }

  ngOnInit(): void {

    this.primengConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
      dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
        'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
      today: 'Hôm nay',
      clear: 'Xóa',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'Tu'
    });

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
