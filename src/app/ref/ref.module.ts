import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { RefPageRoutingModule } from './ref-routing.module';
import { RefPage } from './ref.page';

@NgModule({
  imports: [CommonModule, IonicModule, RefPageRoutingModule],
  declarations: [RefPage],
})
export class RefPageModule {}

