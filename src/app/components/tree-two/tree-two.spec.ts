import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeTwo } from './tree-two';

describe('TreeTwo', () => {
  let component: TreeTwo;
  let fixture: ComponentFixture<TreeTwo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeTwo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeTwo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
