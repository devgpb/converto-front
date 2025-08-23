import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

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
  private auth = inject(AuthService);
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
      title: 'Administração',
      items: [
        { icon: 'people', title: 'Usuários', href: '/ref' },
        { icon: 'settings', title: 'Minha Conta', href: '/conta' },
        { icon: 'business', title: 'Setores', href: '/setores' },
        { icon: 'person-add', title: 'Novo Usuário', href: '/usuarios/novo' },
      ],
    },
  ];



  // private submenuAutItems: SubItem[] = [
  //   { icon: 'document', title: 'Gerar Proposta', route: '/proposta/gerar' },
  //   { icon: 'document', title: 'Gerar Procuração', route: '/procuracao/gerar' },
  // ];

  public getSubItems(title: string): SubItem[] {
    switch (title) {
      // case 'Automações':
      //   return this.submenuAutItems;
      default:
        return [];
    }
  }

  logout(): void {
    this.auth.logout();
  }
}

