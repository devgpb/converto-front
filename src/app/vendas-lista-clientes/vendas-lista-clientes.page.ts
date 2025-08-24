import { Component, ViewChild } from '@angular/core';
import { ViewDidEnter , IonicModule } from '@ionic/angular';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';

@Component({
  selector: 'app-vendas-lista-clientes',
  templateUrl: './vendas-lista-clientes.page.html',
  standalone: true,
  imports: [IonicModule, ListaClientesComponent],
})
export class VendasListaClientesPage implements ViewDidEnter  {
  @ViewChild(ListaClientesComponent) listaClientes!: ListaClientesComponent;

  ionViewDidEnter(): void {
    this.listaClientes.fetch();
  }
}
