import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanosPage } from './planos/planos.page';
import { CadastroPage } from './cadastro/cadastro.page';
import { CheckoutPage } from './checkout/checkout.page';
import { ConfirmacaoPage } from './confirmacao/confirmacao.page';

const routes: Routes = [
  { path: 'planos', component: PlanosPage },
  { path: 'cadastro', component: CadastroPage },
  { path: 'checkout', component: CheckoutPage },
  { path: 'confirmacao', component: ConfirmacaoPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupRoutingModule {}
