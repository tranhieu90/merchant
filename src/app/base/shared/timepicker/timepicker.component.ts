import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs/esm';
import { NgxDaterangepickerMd,LocaleService, LOCALE_CONFIG, LocaleConfig, DaterangepickerDirective } from 'ngx-daterangepicker-material';

export interface StartDate {
  startDate: Dayjs;
}

export interface EndDate {
  endDate: Dayjs;
}

@Component({
  selector: 'timepicker',
  standalone:true,
  templateUrl: './timepicker.component.html',
  styleUrl: './timepicker.component.scss',
  imports: [FormsModule, NgxDaterangepickerMd],
  providers: [
    LocaleService,
    { provide: LOCALE_CONFIG, useValue: {} }
  ],
})
export class TimepickerComponent {
  @Input() options: any = {};
  @Input() locale: any = {};
  @Input() opens: 'left' | 'right' | 'center' = 'right';
  @Input() drops: 'up' | 'down' = 'down';
  @Input() timePicker: boolean = true;
  @Input() dateLimit: number=30;

  @Input() firstMonthDayClass?: string;
  @Input() lastMonthDayClass?: string;
  @Input() emptyWeekRowClass?: string;
  @Input() emptyWeekColumnClass?: string;
  @Input() lastDayOfPreviousMonthClass?: string;
  @Input() firstDayOfNextMonthClass?: string;
  @ViewChild(DaterangepickerDirective, { static: true })
  daterangepicker!: DaterangepickerDirective;
  @Input() selected: { start: Date; end: Date } = { start: new Date(), end: new Date() };
  @Output() rangeChange = new EventEmitter<any>();
  constructor() {
    this.selected = {
      start: dayjs().subtract(3, 'days').toDate(),
      end: dayjs().add(3, 'days').toDate()
    };
    this.options = {
      autoApply: false,
      alwaysShowCalendars: false,
      showCancel: false,
      showClearButton: false,
      linkedCalendars: true,
      singleDatePicker: false,
      showWeekNumbers: false,
      showISOWeekNumbers: false,
      customRangeDirection: false,
      lockStartDate: false,
      closeOnAutoApply: true
    };
    this.locale = {
      format: 'DD/MM/YYYY HH:mm',
      displayFormat: 'DD/MM/YYYY HH:mm',
      direction: 'ltr',
      weekLabel: 'Tuần',
      separator: ' - ',
      applyLabel: 'Chọn',
      cancelLabel: 'Hủy',
      customRangeLabel: 'Tùy chọn',
      daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      monthNames: [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ],
      firstDay: 1
    };
  }
  maxDateDayjs: Dayjs= dayjs();
  @Input() set maxDate(days: number) {
    this.maxDateDayjs =  dayjs().add(7, 'day');
  }
   minDateDayjs: Dayjs= dayjs().subtract(7, 'day');
  @Input() set minDate(days: number) {
    this.minDateDayjs =  dayjs().add(days, 'day');
  }
  ngOnit(){
  }
  click(): void {}

  clear(): void {
    this.daterangepicker.clear();
  }

  ngOnInit(): void {}

  eventClicked(e: StartDate | EndDate): void {
    console.log({ ['eventClicked()']: e });
  }

  eventCleared(): void {
    console.log('datepicker cleared');
  }
}