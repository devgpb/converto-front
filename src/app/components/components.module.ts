import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from './header/header.component';
import { GearBackgroundComponent } from './gear-background/gear-background.component';
import { TelefoneBrDirective } from '../../shared/directives/telefone-br.directive';
import { CpfBrDirective } from '../../shared/directives/cpf-br.directive';
import { CepBrDirective } from '../../shared/directives/cep-br.directive';

@NgModule({
  declarations: [HeaderComponent, GearBackgroundComponent, TelefoneBrDirective, CpfBrDirective, CepBrDirective],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent, GearBackgroundComponent, TelefoneBrDirective, CpfBrDirective, CepBrDirective],
})
export class ComponentsModule {}

