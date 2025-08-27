import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { SetoresPageRoutingModule } from './setores-routing.module';
import { SetoresPage } from './setores.page';

@NgModule({
  imports: [CommonModule, IonicModule, SetoresPageRoutingModule],
  declarations: [SetoresPage],
})
export class SetoresPageModule {}

