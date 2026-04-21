import { InjectionToken } from '@angular/core';
import { DialogHandle } from './dialog.types';

export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');
export const DIALOG_HANDLE = new InjectionToken<DialogHandle<unknown>>('DIALOG_HANDLE');
