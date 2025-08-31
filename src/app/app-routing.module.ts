import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { VendasDashboardPage } from './vendas-dashboard/vendas-dashboard.page';
import { VendasLeadsPage } from './vendas-leads/vendas-leads.page';
import { VendasListaClientesPage } from './vendas-lista-clientes/vendas-lista-clientes.page';
import { UsuariosPage } from './usuarios/usuarios.page';
import { SetoresPage } from './setores/setores.page';
import { UsuariosNovoPage } from './usuarios-novo/usuarios-novo.page';
import { PerfilPage } from './perfil/perfil.page';
import { EmpresaPage } from './empresa/empresa.page';
import { ConfiguracoesPage } from './configuracoes/configuracoes.page';

import { ClientesImportarPage } from './clientes-importar/clientes-importar.page';
import { FolderPage } from './folder/folder.page';
import { SuportePage } from './suporte/suporte.page';
import { JobsPage } from './jobs/jobs.page';
import { MensagensPadraoPage } from './mensagens-padrao/mensagens-padrao.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'jobs',
    component: JobsPage,
    canActivate: [AuthGuard],
    data: { title: 'Meus Trabalhos' }
  },
  {
    path: 'vendas/dashboard',
    component: VendasDashboardPage,
    canActivate: [AuthGuard],
    data: { title: 'Relatório de Atendimento' }
  },
  {
    path: 'empresa',
    component: EmpresaPage,
    canActivate: [AuthGuard],
    data: { title: 'Sua Empresa' }
  },
  {
    path: 'vendas/leads',
    component: VendasLeadsPage,
    canActivate: [AuthGuard],
    data: { title: 'Cadastrar Clientes' }
  },
  {
    path: 'vendas/lista/clientes',
    component: VendasListaClientesPage,
    canActivate: [AuthGuard],
    data: { title: 'Lista de Clientes' }
  },
  {
    path: 'vendas/mensagens-padrao',
    component: MensagensPadraoPage,
    canActivate: [AuthGuard],
    data: { title: 'Mensagens Padrão' }
  },
  {
    path: 'usuarios',
    component: UsuariosPage,
    canActivate: [AuthGuard],
    data: { title: 'Usuários' }
  },
  {
    path: 'setores',
    component: SetoresPage,
    canActivate: [AuthGuard],
    data: { title: 'Setores' }
  },
  {
    path: 'usuarios/novo',
    component: UsuariosNovoPage,
    canActivate: [AuthGuard],
    data: { title: 'Novo Usuário' }
  },
  {
    path: 'perfil',
    component: PerfilPage,
    canActivate: [AuthGuard],
    data: { title: 'Perfil' }
  },
  {
    path: 'clientes/importar',
    component: ClientesImportarPage,
    canActivate: [AuthGuard],
    data: { title: 'Importar Clientes' }
  },
  {
    path: 'configuracoes',
    component: ConfiguracoesPage,
    canActivate: [AuthGuard],
    data: { title: 'Configurações' }
  },
  {
    path: 'suporte',
    component: SuportePage,
    canActivate: [AuthGuard],
    data: { title: 'Suporte' }
  },
  {
    path: 'folder/:id',
    component: FolderPage,
    canActivate: [AuthGuard],
    data: { title: 'Folder' }
  },
  {
    path: '',
    loadChildren: () => import('./signup/signup.module').then((m) => m.SignupModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
