import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendasListaClientesPage } from './vendas-lista-clientes.page';

const routes: Routes = [
  {
    path: '',
    component: VendasListaClientesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendasListaClientesPageRoutingModule {}

