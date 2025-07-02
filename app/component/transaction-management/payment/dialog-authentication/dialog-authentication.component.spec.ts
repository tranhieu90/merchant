import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuthenticationComponent } from './dialog-authentication.component';

describe('DialogAuthenticationComponent', () => {
  let component: DialogAuthenticationComponent;
  let fixture: ComponentFixture<DialogAuthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAuthenticationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
