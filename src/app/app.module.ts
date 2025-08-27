import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { LucideAngularModule, UserPlus, Phone, Users, Calendar, Receipt } from 'lucide-angular';
import { NgApexchartsModule } from 'ng-apexcharts';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { ComponentsModule } from './components/components.module';
import { PlanosPage } from './planos/planos.page';
import { CadastroPage } from './cadastro/cadastro.page';
import { CheckoutPage } from './checkout/checkout.page';
import { ConfirmacaoPage } from './confirmacao/confirmacao.page';
import { VendasDashboardPage } from './vendas-dashboard/vendas-dashboard.page';
import { VendasLeadsPage } from './vendas-leads/vendas-leads.page';
import { VendasListaClientesPage } from './vendas-lista-clientes/vendas-lista-clientes.page';
import { RefPage } from './ref/ref.page';
import { SetoresPage } from './setores/setores.page';
import { UsuariosNovoPage } from './usuarios-novo/usuarios-novo.page';
import { PerfilPage } from './perfil/perfil.page';
import { EmpresaPage } from './empresa/empresa.page';
import { AssentosPage } from './assentos/assentos.page';
import { ConfiguracoesPage } from './configuracoes/configuracoes.page';
import { FolderPage } from './folder/folder.page';

@NgModule({
  declarations: [AppComponent, NavMenuComponent, PlanosPage, CadastroPage, CheckoutPage, ConfirmacaoPage, VendasDashboardPage, VendasLeadsPage, VendasListaClientesPage, RefPage, SetoresPage, UsuariosNovoPage, PerfilPage, EmpresaPage, AssentosPage, ConfiguracoesPage, FolderPage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ComponentsModule, FormsModule, ReactiveFormsModule, NgApexchartsModule,
    LucideAngularModule.pick({ UserPlus, Phone, Users, Calendar, Receipt })
   ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
