import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcumbService } from '../../../../common/service/breadcumb/breadcumb.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'breadcumb',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './breadcumb.component.html',
  styleUrl: './breadcumb.component.scss'
})
export class BreadcumbComponent implements OnInit {
  breadcrumbs!: Observable<Array<{ label: string, url: string }>>;

  constructor(private breadcumbService: BreadcumbService) {}

  ngOnInit(): void {
    this.breadcrumbs = this.breadcumbService.breadcrumbs$;
  }

}
