import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkOverlayDirective } from './directives/cdk-overlay.directive';



@NgModule({
  declarations: [CdkOverlayDirective],
  imports: [
    CommonModule
  ],
  exports: [CdkOverlayDirective]
})
export class SharedModule { }
