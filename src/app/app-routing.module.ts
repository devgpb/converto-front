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
    path: 'planos',
    loadChildren: () => import('./planos/planos.module').then(m => m.PlanosPageModule)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro/cadastro.module').then(m => m.CadastroPageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'confirmacao',
    loadChildren: () => import('./confirmacao/confirmacao.module').then(m => m.ConfirmacaoPageModule)
  },
  {
    path: 'vendas/dashboard',
    loadComponent: () => import('./vendas-dashboard/vendas-dashboard.page').then(m => m.VendasDashboardPage),
    canActivate: [AuthGuard],
    data: { title: 'Relatório de Atendimento' }
  },
  {
    path: 'vendas/leads',
    loadComponent: () => import('./vendas-leads/vendas-leads.page').then(m => m.VendasLeadsPage),
    canActivate: [AuthGuard],
    data: { title: 'Cadastrar Clientes' }
  },
  {
    path: 'vendas/lista/clientes',
    loadComponent: () => import('./vendas-lista-clientes/vendas-lista-clientes.page').then(m => m.VendasListaClientesPage),
    canActivate: [AuthGuard],
    data: { title: 'Lista de Clientes' }
  },
  {
    path: 'ref',
    loadComponent: () => import('./ref/ref.page').then(m => m.RefPage),
    canActivate: [AuthGuard],
    data: { title: 'Usuários' }
  },
  {
    path: 'setores',
    loadComponent: () => import('./setores/setores.page').then(m => m.SetoresPage),
    canActivate: [AuthGuard],
    data: { title: 'Setores' }
  },
  {
    path: 'usuarios/novo',
    loadComponent: () => import('./usuarios-novo/usuarios-novo.page').then(m => m.UsuariosNovoPage),
    canActivate: [AuthGuard],
    data: { title: 'Novo Usuário' }
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [AuthGuard],
    data: { title: 'Perfil' }
  },
  {
    path: 'empresa',
    loadComponent: () => import('./empresa/empresa.page').then(m => m.EmpresaPage),
    canActivate: [AuthGuard],
    data: { title: 'Empresa' }
  },
  {
    path: 'assentos',
    loadComponent: () => import('./assentos/assentos.page').then(m => m.AssentosPage),
    canActivate: [AuthGuard],
    data: { title: 'Assentos' }
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./configuracoes/configuracoes.page').then(m => m.ConfiguracoesPage),
    canActivate: [AuthGuard],
    data: { title: 'Configurações' }
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Folder' }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
