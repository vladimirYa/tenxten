import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DATA_TOKEN } from '../../../../shared/components/dialog';

import { WinnerDialog } from './winner';

describe('WinnerDialog', () => {
  let component: WinnerDialog;
  let fixture: ComponentFixture<WinnerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnerDialog],
      providers: [{ provide: DATA_TOKEN, useValue: { isPlayerWinner: true } }],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnerDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
