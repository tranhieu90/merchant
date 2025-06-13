import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSubmerchantComponent } from './dialog-submerchant.component';

describe('DialogSubmerchantComponent', () => {
  let component: DialogSubmerchantComponent;
  let fixture: ComponentFixture<DialogSubmerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSubmerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSubmerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
