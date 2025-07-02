import { Component } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { BreadcumbComponent } from '../../layout/breadcumb/breadcumb/breadcumb.component';

@Component({
  selector: 'app-m-tab',
  standalone: true,
  imports: [TabViewModule, BadgeModule,BreadcumbComponent],
  templateUrl: './m-tab.component.html',
  styleUrl: './m-tab.component.scss'
})
export class MTabComponent {

}
