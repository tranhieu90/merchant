import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRoleComponent } from './dialog-role.component';

describe('DialogRoleComponent', () => {
  let component: DialogRoleComponent;
  let fixture: ComponentFixture<DialogRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
