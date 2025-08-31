import { Component, HostBinding, inject } from '@angular/core';
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
  @HostBinding('class.collapsed') collapsed = false;
  public menuSections: MenuSection[] = [
    {
      title: 'Vendas',
      items: [
        { icon: 'stats-chart', title: 'RelatÃ³rio de Vendas', href: '/vendas/dashboard' },
        { icon: 'person-add-outline', title: 'Cadastrar Clientes', href: '/vendas/leads' },
        { icon: 'people', title: 'Lista de Clientes', href: '/vendas/lista/clientes' },
        { icon: 'chatbubbles', title: 'Mensagens PadrÃ£o', href: '/vendas/mensagens-padrao' },
      ],
    },
    {
      title: 'AdministraÃ§Ã£o',
      items: [
        { icon: 'person-circle', title: 'UsuÃ¡rios', href: '/usuarios' },
        // { icon: 'business', title: 'Setores', href: '/setores' },
        { icon: 'business', title: 'Empresa', href: '/empresa' },
        { icon: 'person-add', title: 'Novo UsuÃ¡rio', href: '/usuarios/novo' },
      ],
    },
  ];



  // private submenuAutItems: SubItem[] = [
  //   { icon: 'document', title: 'Gerar Proposta', route: '/proposta/gerar' },
  //   { icon: 'document', title: 'Gerar ProcuraÃ§Ã£o', route: '/procuracao/gerar' },
  // ];

  public getSubItems(title: string): SubItem[] {
    switch (title) {
      // case 'AutomaÃ§Ãµes':
      //   return this.submenuAutItems;
      default:
        return [];
    }
  }

  logout(): void {
    this.auth.logout();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    const menu = document.querySelector('ion-menu.menu-desktop');
    if (menu) {
      if (this.collapsed) {
        menu.classList.add('collapsed');
      } else {
        menu.classList.remove('collapsed');
      }
    }
  }
}

