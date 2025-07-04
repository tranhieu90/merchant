import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { ButtonModule } from 'primeng/button';
import { PaginatorComponent } from '../../layout/paginator/paginator.component';

@Component({
  selector: 'app-m-label',
  standalone: true,
  imports: [
    PaginatorComponent,
    MatStepperModule,
    ButtonModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './m-label.component.html',
  styleUrl: './m-label.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class MLabelComponent {

  currentStep: number = 0;
  isStepContentReady = false;

  doNextStep() {
    this.isStepContentReady = false;
    this.currentStep++;
  }

  doPreStep() {
    this.isStepContentReady = false;
    if (this.currentStep >= 0) {
      this.currentStep--;
    }
  }

  onAnimationDone() {
    this.isStepContentReady = true;
  }

  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
  }
}
