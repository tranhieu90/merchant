import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, ElementRef, ViewChild } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatListModule,
    RouterModule,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit, OnChanges {
  assetPath = environment.assetPath;
  @Input() isCollapsed!: boolean;
  menuItems=signal<any>([])
  constructor(
    private auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    const structuredMenu = this.buildAndSortMenuTree(this.auth.getMenuInfo().sort((a: any, b: any) => a.index - b.index));
    this.menuItems.set(structuredMenu);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  private buildAndSortMenuTree(menuItems: any[]): any[] {
    const menuMap = new Map<number, any>(menuItems.map((item: any) => [item.menuId, item]));
    const rootMenu: any[] = [];

    menuItems.forEach((item: any) => {
      if (item.parentId === null) {
        rootMenu.push(item);
      } else {
        const parent = menuMap.get(item.parentId);
        if (parent) {
          if (!parent.subMenus) {
            parent.subMenus = [];
          }
          parent.subMenus.push(item);
        }
      }
    });

    function sortSubMenus(nodes: any[]): void {
      nodes.sort((a: any, b: any) => a.index - b.index);
      nodes.forEach((node: any) => {
        if (node.subMenus) {
          sortSubMenus(node.subMenus);
        }
      });
    }

    sortSubMenus(rootMenu);
    return rootMenu;
  }

  trackMenu(index: number, item: any): any {
    return item.menuId;
  }
}
