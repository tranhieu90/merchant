import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MTooltipComponent } from './m-tooltip.component';

describe('MTooltipComponent', () => {
  let component: MTooltipComponent;
  let fixture: ComponentFixture<MTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
