import { AsyncPipe, DOCUMENT, NgClass, NgComponentOutlet } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from './dialog.service';

@Component({
  selector: 'app-dialog',
  imports: [AsyncPipe, NgClass, NgComponentOutlet],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent implements OnDestroy {
  private readonly dialogService = inject(DialogService);
  private readonly document = inject(DOCUMENT);

  protected readonly dialogState$ = this.dialogService.dialogState$;

  constructor() {
    this.dialogState$
      .pipe(takeUntilDestroyed())
      .subscribe((dialog) => {
        this.document.body.style.overflow = dialog ? 'hidden' : '';
      });
  }

  protected onBackdropClick(): void {
    this.dialogService.close();
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }
}
