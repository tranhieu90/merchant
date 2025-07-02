import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMerchantComponent } from './table-merchant.component';

describe('TableMerchantComponent', () => {
  let component: TableMerchantComponent;
  let fixture: ComponentFixture<TableMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableMerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
