import { Component } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-m-tab',
  standalone: true,
  imports: [TabViewModule, BadgeModule],
  templateUrl: './m-tab.component.html',
  styleUrl: './m-tab.component.scss'
})
export class MTabComponent {

}
