import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRepayComponent } from './dialog-repay.component';

describe('DialogRepayComponent', () => {
  let component: DialogRepayComponent;
  let fixture: ComponentFixture<DialogRepayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRepayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRepayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
