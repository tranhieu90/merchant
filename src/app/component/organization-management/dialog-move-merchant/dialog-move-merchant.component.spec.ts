import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMoveMerchantComponent } from './dialog-move-merchant.component';

describe('DialogMoveMerchantComponent', () => {
  let component: DialogMoveMerchantComponent;
  let fixture: ComponentFixture<DialogMoveMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogMoveMerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogMoveMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
