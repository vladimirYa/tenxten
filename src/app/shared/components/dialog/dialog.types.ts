import { Injector, Type } from '@angular/core';

export interface DialogConfig<TData = unknown> {
  data?: TData;
  hasBackdrop?: boolean;
  backdropClass?: string | string[];
  panelClass?: string | string[];
}

export interface DialogHandle<TResult = unknown> {
  close: (result?: TResult) => void;
}

export interface ActiveDialog {
  component: Type<unknown>;
  injector: Injector;
  config: DialogConfig;
  ref: DialogHandle<unknown>;
}
