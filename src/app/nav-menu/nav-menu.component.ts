import { AfterViewInit, Component, HostBinding, OnInit, inject } from '@angular/core';
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
export class NavMenuComponent implements OnInit, AfterViewInit {
  private auth = inject(AuthService);
  @HostBinding('class.collapsed') collapsed = false;
  public menuSections: MenuSection[] = [
    {
      title: 'Geral',
      items: [
        { icon: 'briefcase', title: 'Meus Trabalhos', href: '/jobs' },
      ],
    },
    {
      title: 'Vendas',
      items: [
        { icon: 'stats-chart', title: 'Relatório de Vendas', href: '/vendas/dashboard' },
        { icon: 'person-add-outline', title: 'Cadastrar Clientes', href: '/vendas/leads' },
        { icon: 'people', title: 'Lista de Clientes', href: '/vendas/lista/clientes' },
        { icon: 'chatbubbles', title: 'Mensagens Padrão', href: '/vendas/mensagens-padrao' },
      ],
    },
    {
      title: 'Administração',
      items: [
        { icon: 'person-circle', title: 'Usuários', href: '/usuarios' },
        // { icon: 'business', title: 'Setores', href: '/setores' },
        { icon: 'business', title: 'Empresa', href: '/empresa' },
        { icon: 'cloud-upload', title: 'Importar Clientes', href: '/clientes/importar' },
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

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem('navMenuCollapsed', this.collapsed.toString());
    this.applyCollapsedClass();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isAdminSection(section: MenuSection): boolean {
    const title = (section?.title || '').toString();
    return title.startsWith('Administra');
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('navMenuCollapsed');
    this.collapsed = stored === 'true';
  }

  ngAfterViewInit(): void {
    this.applyCollapsedClass();
  }

  private applyCollapsedClass(): void {
    const menu = document.querySelector('ion-menu.menu-desktop');
    if (menu) {
      menu.classList.toggle('collapsed', this.collapsed);
    }
  }
}

