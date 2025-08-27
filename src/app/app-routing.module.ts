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
    loadChildren: () => import('./vendas-dashboard/vendas-dashboard.module').then(m => m.VendasDashboardPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Relatório de Atendimento' }
  },
  {
    path: 'vendas/leads',
    loadChildren: () => import('./vendas-leads/vendas-leads.module').then(m => m.VendasLeadsPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Cadastrar Clientes' }
  },
  {
    path: 'vendas/lista/clientes',
    loadChildren: () => import('./vendas-lista-clientes/vendas-lista-clientes.module').then(m => m.VendasListaClientesPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Lista de Clientes' }
  },
  {
    path: 'ref',
    loadChildren: () => import('./ref/ref.module').then(m => m.RefPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Usuários' }
  },
  {
    path: 'setores',
    loadChildren: () => import('./setores/setores.module').then(m => m.SetoresPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Setores' }
  },
  {
    path: 'usuarios/novo',
    loadChildren: () => import('./usuarios-novo/usuarios-novo.module').then(m => m.UsuariosNovoPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Novo Usuário' }
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Perfil' }
  },
  {
    path: 'empresa',
    loadChildren: () => import('./empresa/empresa.module').then(m => m.EmpresaPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Empresa' }
  },
  {
    path: 'assentos',
    loadChildren: () => import('./assentos/assentos.module').then(m => m.AssentosPageModule),
    canActivate: [AuthGuard],
    data: { title: 'Assentos' }
  },
  {
    path: 'configuracoes',
    loadChildren: () => import('./configuracoes/configuracoes.module').then(m => m.ConfiguracoesPageModule),
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
