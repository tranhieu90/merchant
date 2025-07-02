import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessPaymentComponent } from './business-payment.component';

describe('BusinessPaymentComponent', () => {
  let component: BusinessPaymentComponent;
  let fixture: ComponentFixture<BusinessPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
