import { AfterViewInit, Component, HostBinding, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService, Profile } from '../services/profile.service';

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
  private profileService = inject(ProfileService);
  private router = inject(Router);
  @HostBinding('class.collapsed') collapsed = false;
  profile?: Profile;
  showProfileOverlay = false; // overlay para menu de perfil quando expandido
  public menuSections: MenuSection[] = [
    {
      title: 'Geral',
      items: [
        { icon: 'briefcase', title: 'Meus Trabalhos', href: '/jobs' },
        { icon: 'play-circle', title: 'Tutoriais', href: '/tutoriais' },
      ],
    },
    {
      title: 'Vendas',
      items: [
        { icon: 'stats-chart', title: 'Relatório de Vendas', href: '/vendas/dashboard' },
        { icon: 'people', title: 'Lista de Clientes', href: '/vendas/lista/clientes' },
        { icon: 'call', title: 'Lista de Ligações', href: '/vendas/ligacoes' },
        { icon: 'person-add-outline', title: 'Cadastrar Clientes', href: '/vendas/leads' },
        { icon: 'cloud-upload', title: 'Importar/Exportar Clientes', href: '/clientes/importar' },
        { icon: 'chatbubbles', title: 'Mensagens Padrão', href: '/vendas/mensagens-padrao' },
      ],
    },
    {
      title: 'Administração',
      items: [
        { icon: 'people-circle', title: 'Usuários', href: '/usuarios' },
        // { icon: 'business', title: 'Setores', href: '/setores' },
        { icon: 'person-add', title: 'Novo Usuário', href: '/usuarios/novo' },
        { icon: 'analytics', title: 'Relatório de Vendedor', href: '/relatorios/vendedor' },
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

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
    this.closeOverlays();
  }

  goToConfig(): void {
    this.router.navigate(['/configuracoes']);
    this.closeOverlays();
  }

  goToSuporte(): void {
    this.router.navigate(['/suporte']);
    this.closeOverlays();
  }

  toggleProfileOverlay(): void {
    // No modo colapsado o popover é controlado pelo trigger no template
    if (!this.collapsed) {
      this.showProfileOverlay = !this.showProfileOverlay;
    }
  }

  closeOverlays(): void {
    this.showProfileOverlay = false;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem('navMenuCollapsed', this.collapsed.toString());
    this.applyCollapsedClass();
    this.closeOverlays();
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
    // Carrega perfil para exibir nome do usuário
    this.profileService.getProfile().subscribe((p) => (this.profile = p));
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

