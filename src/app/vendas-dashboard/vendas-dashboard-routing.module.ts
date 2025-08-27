import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendasDashboardPage } from './vendas-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: VendasDashboardPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendasDashboardPageRoutingModule {}

