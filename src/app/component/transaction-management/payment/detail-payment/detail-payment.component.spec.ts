import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailPaymentComponent } from './detail-payment.component';

describe('DetailPaymentComponent', () => {
  let component: DetailPaymentComponent;
  let fixture: ComponentFixture<DetailPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
