import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { VendasLeadsPageRoutingModule } from './vendas-leads-routing.module';
import { VendasLeadsPage } from './vendas-leads.page';
import { SharedDirectivesModule } from 'src/shared/shared-directives.module';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule, SharedDirectivesModule, VendasLeadsPageRoutingModule],
  declarations: [VendasLeadsPage],
})
export class VendasLeadsPageModule {}

