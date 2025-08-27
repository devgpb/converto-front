import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { UsuariosNovoPageRoutingModule } from './usuarios-novo-routing.module';
import { UsuariosNovoPage } from './usuarios-novo.page';

@NgModule({
  imports: [CommonModule, IonicModule, UsuariosNovoPageRoutingModule],
  declarations: [UsuariosNovoPage],
})
export class UsuariosNovoPageModule {}

