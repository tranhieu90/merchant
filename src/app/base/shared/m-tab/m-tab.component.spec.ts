import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MTabComponent } from './m-tab.component';

describe('MTabComponent', () => {
  let component: MTabComponent;
  let fixture: ComponentFixture<MTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
