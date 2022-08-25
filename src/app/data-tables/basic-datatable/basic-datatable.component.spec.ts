import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicDatatableComponent } from './basic-datatable.component';

describe('BasicDatatableComponent', () => {
  let component: BasicDatatableComponent;
  let fixture: ComponentFixture<BasicDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicDatatableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
