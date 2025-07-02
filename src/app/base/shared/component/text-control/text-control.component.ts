// import {
//   AfterViewInit,
//   Component,
//   ElementRef,
//   EventEmitter,
//   Input,
//   Output,
//   ViewChild,
//   ViewEncapsulation,
// } from '@angular/core';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatInputModule } from '@angular/material/input';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatIconModule } from '@angular/material/icon';
// import { NgIf, NgClass, NgTemplateOutlet, NgStyle } from '@angular/common';
// import { FormGroupAbstractComponent } from '../form-group.abstract.component';
// import { provideNgxMask } from '../../../../common/directives/ngx-mask/ngx-mask.provider';
// import { FormRegexDirective } from '../../../../common/directives/form-regex.directive';
// import { FormMicroDirective } from '../../../../common/directives/form-micro.directive';
// import { FormTextDirective } from '../../../../common/directives/form-text.directive';
// import { NgxMaskDirective } from '../../../../common/directives/ngx-mask/ngx-mask.directive';
// import { REGEX_PATTERN } from '../../../../common/enum/RegexPattern';
// import { TranslateModule } from '@ngx-translate/core';

// @Component({
//   selector: 'sm-text-control',
//   templateUrl: './text-control.component.html',
//   styleUrls: ['./text-control.component.scss'],
//   encapsulation: ViewEncapsulation.None,
//   standalone: true,
//   imports: [
//     NgIf,
//     NgClass,
//     NgTemplateOutlet,
//     MatIconModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatInputModule,
//     MatTooltipModule,
//     FormRegexDirective,
//     FormMicroDirective,
//     FormTextDirective,
//     NgStyle,
//     NgxMaskDirective,
//     TranslateModule
//   ],
//   providers: [provideNgxMask()],
// })
// export class TextControlComponent
//   extends FormGroupAbstractComponent
//   implements AfterViewInit
// {
//   @Input() typeForm = 'vertical';
//   @Output() focusOutEvent = new EventEmitter();
//   @Output() focusEvent = new EventEmitter();
//   @ViewChild('inputElement')
//   inputElement!: ElementRef;
//   @Input() tooltipMessage: string | undefined;

//   @Input() useFloatFormatter = false;
//   @Input() maxValue?: number;
//   @Input() allowNegativeNumbers = false;
//   @Input() showPrefix?: boolean = false;
//   @Input() iconPrefix?: string;
//   @Input() showSurfix?: boolean = false;
//   @Input() iconSurfix?: string;
//   @Output() surfixActionEvent = new EventEmitter();

//   constructor() {
//     super();
//   }

//   ngAfterViewInit() {
//     if (this.item.focus) {
//       setTimeout(() => {
//         this.inputElement.nativeElement.focus();
//       }, 100);
//     }
//   }

//   /**
//    * Event out focus
//    * @param $event
//    */
//   focusOutFunction($event: any) {
//     this.focusOutEvent.emit($event);
//   }

//   /**
//    * Event focus
//    * @param $event
//    */
//   focusFunction($event: any) {
//     this.focusEvent.emit($event);
//   }

//   /**
//    * Event click icon surfix
//    * @param $event
//    */
//   surfixFunction($event: any) {
//     this.surfixActionEvent.emit($event);
//   }

//   change($event: Event) {
//     this.emitOnChanged($event);
//   }

//   focus(): void {
//     setTimeout(() => {
//       this.inputElement?.nativeElement.focus();
//     }, 300);
//   }

//   clearValue(nameInput: string) {
//     this.form.get(nameInput)?.setValue('');
//   }

//   trimValue(controlName: string) {
//     const control = this.form.get(controlName);
//     if (control) {
//       control.setValue(control.value.trim());
//     }
//   }

//   allowPattern(event: KeyboardEvent) {
//     const target = event.target as HTMLInputElement;
//     let pattern: RegExp = /.*/;
//     let maxLength = 254;

//     switch (target?.id) {
//       case 'email':
//         pattern = REGEX_PATTERN.EMAIL_EXT;
//         maxLength = 254;
//         break;
//       case 'userName':
//         pattern = REGEX_PATTERN.USER_NAME_EXT;
//         maxLength = 50;
//         break;
//       case 'fullName':
//         pattern = REGEX_PATTERN.FULL_NAME_EXT;
//         maxLength = 50;
//         break;
//     }
//     if (
//       !pattern.test(event.key) ||
//       (event.key === ' ' && target?.id !== 'fullName') ||
//       target.value.length >= maxLength
//     ) {
//       event.preventDefault();
//     }
//   }
// }
