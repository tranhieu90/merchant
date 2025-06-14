import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { AuthenticationService } from "../../common/service/auth/authentication.service";

@Directive({
  selector: '[hasRoles]'
})
export class HasRolesDirective {
  private authorities: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    public viewContainerRef: ViewContainerRef,
    protected authService: AuthenticationService
  ) {}

  @Input() set hasRoles(value: string | string[]) {
    this.authorities = typeof value === 'string' ? [value] : value;
    this.updateView();
  }

  private updateView(): void {
    const hasAnyAuthority = this.authService.apiTracker(this.authorities);
    this.viewContainerRef.clear();
    if (hasAnyAuthority) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
