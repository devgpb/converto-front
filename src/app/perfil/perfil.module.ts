import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { PerfilPageRoutingModule } from './perfil-routing.module';
import { PerfilPage } from './perfil.page';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule, PerfilPageRoutingModule],
  declarations: [PerfilPage],
})
export class PerfilPageModule {}

