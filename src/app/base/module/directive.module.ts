import { NgModule } from "@angular/core";
import { HasRolesDirective } from "../directive/has-roles.directive";

@NgModule({
    declarations: [HasRolesDirective],
    exports:[HasRolesDirective],
})
export class DirectiveModule{}