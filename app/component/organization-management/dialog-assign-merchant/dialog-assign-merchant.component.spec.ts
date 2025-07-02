import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAssignMerchantComponent } from './dialog-assign-merchant.component';

describe('DialogAssignMerchantComponent', () => {
  let component: DialogAssignMerchantComponent;
  let fixture: ComponentFixture<DialogAssignMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAssignMerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAssignMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
