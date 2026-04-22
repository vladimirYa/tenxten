import { Component, inject } from '@angular/core';
import { DATA_TOKEN } from '../../../../shared/components/dialog';

@Component({
  selector: 'app-winner',
  templateUrl: './winner.html',
  styleUrl: './winner.scss',
})
export class WinnerDialog {
  data = inject(DATA_TOKEN);
}
