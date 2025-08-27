import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendasLeadsPage } from './vendas-leads.page';

const routes: Routes = [
  {
    path: '',
    component: VendasLeadsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendasLeadsPageRoutingModule {}

