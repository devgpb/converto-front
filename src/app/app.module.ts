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
import { VendasDashboardPage } from './vendas-dashboard/vendas-dashboard.page';
import { VendasLeadsPage } from './vendas-leads/vendas-leads.page';
import { VendasListaClientesPage } from './vendas-lista-clientes/vendas-lista-clientes.page';
import { UsuariosPage } from './usuarios/usuarios.page';
import { SetoresPage } from './setores/setores.page';
import { UsuariosNovoPage } from './usuarios-novo/usuarios-novo.page';
import { PerfilPage } from './perfil/perfil.page';
import { ConfiguracoesPage } from './configuracoes/configuracoes.page';
import { ClientesImportarPage } from './clientes-importar/clientes-importar.page';
import { FolderPage } from './folder/folder.page';
import { ListaClientesComponent } from './vendas-lista-clientes/lista-clientes/lista-clientes.component';
import { ClienteModalComponent } from './vendas-lista-clientes/lista-clientes/cliente-modal/cliente-modal.component';
import { ClienteLigacoesListComponent } from './vendas-lista-clientes/lista-clientes/cliente-modal/cliente-ligacoes-list/cliente-ligacoes-list.component';
import { ClienteCardComponent } from './vendas-lista-clientes/lista-clientes/cliente-card/cliente-card.component';
import { SuportePage } from './suporte/suporte.page';
import { JobsPage } from './jobs/jobs.page';
import { MensagensPadraoPage } from './mensagens-padrao/mensagens-padrao.page';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { WelcomeComponent } from './newsletter/news/welcome/welcome.component';
import { EsqueciSenhaPage } from './esqueci-senha/esqueci-senha.page';
import { RedefinirSenhaPage } from './redefinir-senha/redefinir-senha.page';
import { TutoriaisPage } from './tutoriais/tutoriais.page';
import { VendasLigacoesPage } from './vendas-ligacoes/vendas-ligacoes.page';
import { RelatorioVendedorPage } from './relatorio-vendedor/relatorio-vendedor.page';

@NgModule({
  declarations: [AppComponent, NavMenuComponent, VendasDashboardPage, VendasLeadsPage, VendasListaClientesPage, UsuariosPage, SetoresPage, UsuariosNovoPage, PerfilPage, ConfiguracoesPage, ClientesImportarPage, FolderPage, ListaClientesComponent,ClienteModalComponent, ClienteLigacoesListComponent, ClienteCardComponent, SuportePage, JobsPage, MensagensPadraoPage, NewsletterComponent, WelcomeComponent, EsqueciSenhaPage, RedefinirSenhaPage, TutoriaisPage, VendasLigacoesPage, RelatorioVendedorPage],
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
