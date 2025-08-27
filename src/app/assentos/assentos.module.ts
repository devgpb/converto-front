import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AssentosPageRoutingModule } from './assentos-routing.module';
import { AssentosPage } from './assentos.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AssentosPageRoutingModule],
  declarations: [AssentosPage],
})
export class AssentosPageModule {}

