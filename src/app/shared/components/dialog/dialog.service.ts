import { Injectable } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { DialogSize } from './dialog-sizes';

export interface DialogConfig {
  component: any;
  size?: DialogSize;
  data?: any;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  dialogComponentRef!: DialogComponent;

  init(dialog: DialogComponent): void {
    this.dialogComponentRef = dialog;
  }

  openDialog<CData = any>(config: DialogConfig) {
    return this.dialogComponentRef.open<CData>(config);
  }

  closeDialog(data: any = {}): void {
    this.dialogComponentRef.close(data);
  }
}
