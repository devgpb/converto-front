import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LucideAngularModule, UserPlus, Phone, Users, Calendar, Receipt } from 'lucide-angular';

import { SignupRoutingModule } from './signup-routing.module';
import { PlanosPage } from './planos/planos.page';
import { CadastroPage } from './cadastro/cadastro.page';
import { CheckoutPage } from './checkout/checkout.page';
import { ConfirmacaoPage } from './confirmacao/confirmacao.page';

@NgModule({
  declarations: [PlanosPage, CadastroPage, CheckoutPage, ConfirmacaoPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SignupRoutingModule,
    LucideAngularModule.pick({ UserPlus, Phone, Users, Calendar, Receipt })
  ],
})
export class SignupModule {}
