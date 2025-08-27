import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NgApexchartsModule } from 'ng-apexcharts';

import { VendasDashboardPageRoutingModule } from './vendas-dashboard-routing.module';
import { VendasDashboardPage } from './vendas-dashboard.page';

@NgModule({
  imports: [CommonModule, IonicModule, NgApexchartsModule, VendasDashboardPageRoutingModule],
  declarations: [VendasDashboardPage],
})
export class VendasDashboardPageModule {}

