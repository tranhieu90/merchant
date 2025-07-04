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
export class ShowClearOnFocusDirective implements OnInit, AfterViewInit {
  @Input('appShowClearOnFocus') targetSelector!: string; // selector của dấu X
  private formControl!: FormControl;
  private statusSub?: Subscription;
  private isFocused = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private control: NgControl
  ) { }

  ngOnInit(): void {
    this.formControl = this.control?.control as FormControl;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateClearIcon(false);
      this.setupFocusOutListener();
    });
  }

  @HostListener('focusin')
  onFocusIn() {
    this.isFocused = true;
    this.updateClearIcon(this.hasValue());
  }

  @HostListener('input')
  onInput() {
    if (this.isFocused) {
      this.updateClearIcon(this.hasValue());
    }
  }

  private setupFocusOutListener() {
    // Listen for focusout on the AutoComplete container
    const autoCompleteContainer = this.el.nativeElement.closest('.p-autocomplete');
    const container = autoCompleteContainer || this.el.nativeElement.parentElement;

    if (container) {
      this.renderer.listen(container, 'focusout', (event: FocusEvent) => {
        // Check if focus is moving to another element within the same container
        const relatedTarget = event.relatedTarget as HTMLElement;

        if (!relatedTarget || !container.contains(relatedTarget)) {
          // Focus is moving outside the container
          setTimeout(() => {
            this.isFocused = false;
            this.updateClearIcon(false);
          }, 100);
        }
      });
    }
  }

  private hasValue(): boolean {
    const value = this.formControl?.value;
    return value !== null && value !== undefined && value.toString().trim().length > 0;
  }

  private updateClearIcon(show: boolean) {
    if (!this.targetSelector) return;

    let target: Element | null = null;

    // Try multiple strategies to find the clear icon
    const inputGroup = this.el.nativeElement.closest('.p-inputgroup');
    const autoCompleteContainer = this.el.nativeElement.closest('.p-autocomplete');

    if (inputGroup) {
      target = inputGroup.querySelector(this.targetSelector);
    } else if (autoCompleteContainer) {
      target = autoCompleteContainer.querySelector(this.targetSelector);
    } else if (this.el.nativeElement.parentElement) {
      target = this.el.nativeElement.parentElement.querySelector(this.targetSelector);
    }

    if (!target) {
      let sibling = this.el.nativeElement.nextElementSibling;
      while (sibling && !target) {
        if (sibling.matches(this.targetSelector)) {
          target = sibling;
        } else {
          target = sibling.querySelector(this.targetSelector);
        }
        sibling = sibling.nextElementSibling;
      }
    }

    if (target) {
      this.renderer.setStyle(target, 'display', show ? 'inline' : 'none');
    }
  }
}
