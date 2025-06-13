import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MTreeComponent } from './m-tree.component';

describe('MTreeComponent', () => {
  let component: MTreeComponent;
  let fixture: ComponentFixture<MTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
