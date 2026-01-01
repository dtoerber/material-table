import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeThree } from './tree-three';

describe('TreeThree', () => {
  let component: TreeThree;
  let fixture: ComponentFixture<TreeThree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeThree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeThree);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
