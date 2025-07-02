
import { CommonModule } from '@angular/common';
import { Component, Input, input, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { MenuItem } from '../nav-bar/nav-bar.component';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'nav-bar-item',
  standalone: true,
  imports: [MatDividerModule, MatIconModule, MatListModule, CommonModule, RouterModule,TooltipModule],
  templateUrl: './nav-bar-item.component.html',
  styleUrl: './nav-bar-item.component.scss',
  animations: [
    trigger('expandSubMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0, height: '0px' }))
      ]),
    ])
  ]
})
export class NavBarItemComponent implements OnInit{
  item = input.required<any>()
  @Input() isCollapsed!: boolean;
  menuOpen = signal(false);

  toggleNested(menuItem: MenuItem) {
    if (menuItem.children && menuItem.children.length > 0) {
      this.menuOpen.set(!this.menuOpen());
    }
    this.menuOpen.set(!this.menuOpen());
  }
  trackByIndex(index: number, item: any): number {
    return index;
} 
  ngOnInit(): void {
  }
}
