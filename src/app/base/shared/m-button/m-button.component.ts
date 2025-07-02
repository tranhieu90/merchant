import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'm-button',
  standalone: true,
  imports: [FormsModule,MaterialModule, ButtonModule,ButtonModule, SkeletonModule, TooltipModule],
  templateUrl: './m-button.component.html',
  styleUrl: './m-button.component.scss'
})
export class MButtonComponent {

}
