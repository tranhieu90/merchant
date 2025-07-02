import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'paginator',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent implements OnChanges {

  

  @Input() totalItems = 990;
  pageSize: number = 10;
  @Input() currentPage = 1;
  @Output() doChangePage: EventEmitter<any> = new EventEmitter();
  pageInfo: any = {
    pageSize: 10,
    pageIndex: 0,
  };

  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  changePageSize(size: any) {
    this.pageSize = size;
    this.currentPage = 1;
    this.pageInfo["pageSize"] = size;
    this.pageInfo["pageIndex"] = this.currentPage - 1;
    this.doChangePage.emit(this.pageInfo);
  }

  goToPage(page: any) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.pageInfo["pageIndex"] = page - 1;
    this.pageInfo["pageSize"] = this.pageSize;
    this.doChangePage.emit(this.pageInfo);
  }

  get pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current < 3) {
      return [1, 2, 3, '...', total];
    }
    if (current == 3) {
      return [current - 1, current, current + 1, '...', total];
    }

    if (current >= total - 2) {
      return [1, '...', total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  disableEnd() {
    return this.currentPage >= this.totalPages - 2;
  }
}
