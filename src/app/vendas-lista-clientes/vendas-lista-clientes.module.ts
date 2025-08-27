import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VendasListaClientesPageRoutingModule } from './vendas-lista-clientes-routing.module';
import { VendasListaClientesPage } from './vendas-lista-clientes.page';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';
import { ClienteModalComponent } from './lista-clientes/cliente-modal/cliente-modal.component';
import { ClienteCardComponent } from './lista-clientes/cliente-card/cliente-card.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, VendasListaClientesPageRoutingModule],
  declarations: [
    VendasListaClientesPage,
    ListaClientesComponent,
    ClienteModalComponent,
    ClienteCardComponent,
  ],
})
export class VendasListaClientesPageModule {}

