import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

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
    path: 'vendas/dashboard',
    loadComponent: () => import('./vendas-dashboard/vendas-dashboard.page').then(m => m.VendasDashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'vendas/leads',
    loadComponent: () => import('./vendas-leads/vendas-leads.page').then(m => m.VendasLeadsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'vendas/lista/clientes',
    loadComponent: () => import('./vendas-lista-clientes/vendas-lista-clientes.page').then(m => m.VendasListaClientesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'ref',
    loadComponent: () => import('./ref/ref.page').then(m => m.RefPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'setores',
    loadComponent: () => import('./setores/setores.page').then(m => m.SetoresPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios/novo',
    loadComponent: () => import('./usuarios-novo/usuarios-novo.page').then(m => m.UsuariosNovoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'empresa',
    loadComponent: () => import('./empresa/empresa.page').then(m => m.EmpresaPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'assentos',
    loadComponent: () => import('./assentos/assentos.page').then(m => m.AssentosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./configuracoes/configuracoes.page').then(m => m.ConfiguracoesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
