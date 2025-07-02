import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appShowClearOnFocus]',
  standalone: true
})
export class ShowClearOnFocusDirective implements OnInit, OnDestroy,AfterViewInit {
  @Input('appShowClearOnFocus') targetSelector!: string; // selector của dấu X
  private formControl!: FormControl;
  private statusSub?: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private control: NgControl
  ) { }

  ngOnInit(): void {
    this.formControl = this.control?.control as FormControl;
    this.updateClearIcon(false);
  }

  @HostListener('focus')
  onFocus() {
    if (this.hasValue()) {
      this.updateClearIcon(true);
    }
  }

  @HostListener('blur')
  onBlur() {
    setTimeout(() => this.updateClearIcon(false), 150);
  }

  @HostListener('input')
  onInput() {
    if (this.el.nativeElement === document.activeElement && this.hasValue()) {
      this.updateClearIcon(true);
    } else {
      this.updateClearIcon(false);
    }
  }

  private hasValue(): boolean {
    return this.formControl?.value?.toString().trim().length > 0;
  }

  private updateClearIcon(show: boolean) {
    const parent = this.el.nativeElement.parentElement;
    if (!this.targetSelector || !parent) return;

    const target = parent.querySelector(this.targetSelector);
    if (!target) return;

    this.renderer.setStyle(target, 'display', show ? 'inline' : 'none');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {

      this.updateClearIcon(false);

    });
  }
 

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }
}
