import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { EmpresaPageRoutingModule } from './empresa-routing.module';
import { EmpresaPage } from './empresa.page';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule, EmpresaPageRoutingModule],
  declarations: [EmpresaPage],
})
export class EmpresaPageModule {}

