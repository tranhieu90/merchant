import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MLabelComponent } from './m-label.component';

describe('MLabelComponent', () => {
  let component: MLabelComponent;
  let fixture: ComponentFixture<MLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
