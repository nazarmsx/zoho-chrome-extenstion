import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from './pages/popup/popup.component';
import { PopupRoutingModule } from './popup-routing.module';
import {MaterialModule} from '../material';
@NgModule({
  declarations: [PopupComponent],
  imports: [CommonModule, PopupRoutingModule, MaterialModule]
})
export class PopupModule {}
