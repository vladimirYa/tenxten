import { Injectable, Injector, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DIALOG_DATA, DIALOG_HANDLE } from './dialog.tokens';
import { ActiveDialog, DialogConfig, DialogHandle } from './dialog.types';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialogStateSubject = new BehaviorSubject<ActiveDialog | null>(null);

  readonly dialogState$: Observable<ActiveDialog | null> =
    this.dialogStateSubject.asObservable();

  constructor(private readonly injector: Injector) {}

  get activeDialog(): ActiveDialog | null {
    return this.dialogStateSubject.value;
  }

  open<TComponent, TResult = unknown, TData = unknown>(
    component: Type<TComponent>,
    config: DialogConfig<TData> = {}
  ): DialogHandle<TResult> {
    this.close();

    let closed = false;
    let dialogHandle!: DialogHandle<TResult>;
    dialogHandle = {
      close: (result?: TResult) => {
        if (closed) {
          return;
        }

        closed = true;
        if (this.dialogStateSubject.value?.ref === (dialogHandle as DialogHandle<unknown>)) {
          this.dialogStateSubject.next(null);
        }
      }
    };

    const dialogHandleAsUnknown = dialogHandle as DialogHandle<unknown>;

    const dialogInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DIALOG_HANDLE, useValue: dialogHandle },
        { provide: DIALOG_DATA, useValue: config.data ?? null }
      ]
    });

    this.dialogStateSubject.next({
      component,
      injector: dialogInjector,
      config,
      ref: dialogHandleAsUnknown
    });

    return dialogHandle;
  }

  close<TResult = unknown>(result?: TResult): void {
    const dialog = this.dialogStateSubject.value;
    if (!dialog) {
      return;
    }

    dialog.ref.close(result);
  }
}
