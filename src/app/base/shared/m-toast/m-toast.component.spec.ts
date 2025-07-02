import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MToastComponent } from './m-toast.component';

describe('MToastComponent', () => {
  let component: MToastComponent;
  let fixture: ComponentFixture<MToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
