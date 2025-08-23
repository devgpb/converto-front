import { Component } from '@angular/core';

interface MenuItem {
  icon: string;
  title: string;
  description?: string;
  href?: string;
  hasSubmenu?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SubItem {
  icon: string;
  title: string;
  route: string;
}

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  standalone: false,
})
export class NavMenuComponent {
  public menuSections: MenuSection[] = [
    {
      title: 'Vendas',
      items: [
        { icon: 'stats-chart', title: 'Relatório de Vendas', href: '/vendas/dashboard' },
        { icon: 'person-add', title: 'Cadastrar Clientes', href: '/vendas/leads' },
        { icon: 'people', title: 'Lista de Clientes', href: '/vendas/lista/clientes' },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { icon: 'people', title: 'Pedidos', hasSubmenu: true },
        { icon: 'construct', title: 'Automações', hasSubmenu: true },
        { icon: 'bar-chart', title: 'Relatório', href: '/relatorio' },
        { icon: 'server', title: 'Equipamentos', href: '/equipamentos' },
      ],
    },
    {
      title: 'Administração',
      items: [
        { icon: 'people', title: 'Usuários', href: '/ref' },
        { icon: 'settings', title: 'Minha Conta', href: '/conta' },
        { icon: 'business', title: 'Setores', href: '/setores' },
        { icon: 'person-add', title: 'Novo Usuário', href: '/usuarios/novo' },
      ],
    },
  ];

  private submenuClientesRecentItems: SubItem[] = [
    { icon: 'cash', title: 'Pagamentos Faltantes', route: '/pedidos/detalhes/pagamentos' },
    { icon: 'cube', title: 'Equipamentos A Comprar', route: '/pedidos/detalhes/equipamentos' },
    { icon: 'pencil', title: 'ART Faltantes', route: '/pedidos/detalhes/arts' },
    { icon: 'folder-open', title: 'Homologações Pendentes', route: '/pedidos/detalhes/homologacoes' },
    { icon: 'cog', title: 'Aguardando Instalação', route: '/pedidos/detalhes/instalar' },
  ];

  private submenuClientesTableItems: SubItem[] = [
    { icon: 'document', title: 'Fechado', route: '/pedidos/status/fechado' },
    { icon: 'cog', title: 'Instalação', route: '/pedidos/status/instalacao' },
    { icon: 'document', title: 'Nota', route: '/pedidos/status/nota' },
    { icon: 'document', title: 'Finalizado', route: '/pedidos/status/finalizado' },
  ];

  private submenuAutItems: SubItem[] = [
    { icon: 'document', title: 'Gerar Proposta', route: '/proposta/gerar' },
    { icon: 'document', title: 'Gerar Procuração', route: '/procuracao/gerar' },
  ];

  public getSubItems(title: string): SubItem[] {
    switch (title) {
      case 'Pedidos':
        return [...this.submenuClientesRecentItems, ...this.submenuClientesTableItems];
      case 'Automações':
        return this.submenuAutItems;
      default:
        return [];
    }
  }
}

