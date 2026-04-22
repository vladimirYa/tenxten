import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  inject,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogSize } from './dialog-sizes';
import { DialogConfig, DialogService } from './dialog.service';
import { DATA_TOKEN } from './dialog.tokens';

interface Dialog<T = any> extends DialogConfig {
  onCloseSubject: Subject<T>;
  injector: Injector;
}

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly dialogService = inject(DialogService);
  private readonly cdr = inject(ChangeDetectorRef);

  dialogs: Dialog[] = [];

  get isDialogsExists(): boolean {
    return this.dialogs.length > 0;
  }

  ngOnInit(): void {
    this.dialogService.init(this);
    this.cdr.markForCheck();
  }

  open<ComponentData>(dialog: DialogConfig): Observable<ComponentData> {
    const newDialog: Dialog<ComponentData> = {
      ...dialog,
      size: dialog.size ?? DialogSize.Medium,
      injector: Injector.create({
        providers: [{ provide: DATA_TOKEN, useValue: dialog.data ?? {} }],
        parent: this.injector,
      }),
      onCloseSubject: new Subject<ComponentData>(),
    };

    this.dialogs.push(newDialog);
    this.cdr.markForCheck();

    return newDialog.onCloseSubject.asObservable();
  }

  close(data: any = {}): void {
    const dialog = this.dialogs[this.dialogs.length - 1];
    if (!dialog) {
      return;
    }

    if (Object.keys(data).length) {
      dialog.onCloseSubject.next(data);
    }
    dialog.onCloseSubject.complete();

    this.dialogs.pop();
    this.cdr.markForCheck();
  }
}
