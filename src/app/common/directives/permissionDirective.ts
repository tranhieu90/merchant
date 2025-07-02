import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective {

  // Danh sách quyền được phép
  private allowedActions : any = localStorage.getItem('scope')?.split(',').map(api => api.trim());

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set appPermission(action: string) {
    const isAllowed = this.allowedActions.includes(action);
    if (isAllowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAllowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
