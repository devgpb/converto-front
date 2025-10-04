import { AfterViewInit, Component, HostBinding, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService, Profile } from '../services/profile.service';
import { MenuController } from '@ionic/angular';

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
  private menuController = inject(MenuController);
  @HostBinding('class.collapsed') collapsed = false;
  private readonly sectionStateStorageKey = 'navMenuSectionStates';
  private readonly collapseStorageKey = 'navMenuCollapsed';
  private menuElement?: HTMLElementTagNameMap['ion-menu'] | null;
  sectionStates: Record<string, boolean> = {};
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
        { icon: 'filter', title: 'Funil De Vendas', href: '/vendas/kanban' }, // alterado para 'filter'
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
        { icon: 'settings', title: 'Campos de clientes', href: '/admin/campos-clientes' },
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
    this.showProfileOverlay = !this.showProfileOverlay;
  }

  closeOverlays(): void {
    this.showProfileOverlay = false;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.persistCollapseState();
    this.applyCollapsedClass();
    this.closeOverlays();
  }

  toggleSection(title: string): void {
    this.sectionStates[title] = !this.sectionStates[title];
    this.persistSectionStates();
  }

  isSectionCollapsed(title: string): boolean {
    return !!this.sectionStates[title];
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isAdminSection(section: MenuSection): boolean {
    const title = (section?.title || '').toString();
    return title.startsWith('Administra');
  }

  ngOnInit(): void {
    const storedCollapse = localStorage.getItem(this.collapseStorageKey);
    this.collapsed = storedCollapse === 'true';
    this.sectionStates = this.loadSectionStates();
    // Carrega perfil para exibir nome do usuário
    this.profileService.getProfile().subscribe((p) => (this.profile = p));
  }

  async ngAfterViewInit(): Promise<void> {
    this.menuElement = await this.menuController.get('main-menu');
    this.applyCollapsedClass();
  }

  private loadSectionStates(): Record<string, boolean> {
    try {
      const stored = localStorage.getItem(this.sectionStateStorageKey);
      const parsed = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
      const normalized = this.ensureSectionStates(parsed);
      return normalized;
    } catch (error) {
      console.warn('Falha ao carregar estado das seções do menu', error);
      return this.ensureSectionStates({});
    }
  }

  private ensureSectionStates(states: Record<string, boolean>): Record<string, boolean> {
    const normalized: Record<string, boolean> = {};
    let changed = false;
    const knownTitles = new Set(this.menuSections.map((section) => section.title));

    this.menuSections.forEach((section) => {
      const storedValue = states[section.title];
      if (storedValue === undefined) {
        changed = true;
      }
      normalized[section.title] = storedValue ?? false;
    });

    Object.keys(states).forEach((title) => {
      if (!knownTitles.has(title)) {
        changed = true;
      }
    });

    if (changed) {
      this.persistSectionStates(normalized);
    }

    return normalized;
  }

  private persistSectionStates(states: Record<string, boolean> = this.sectionStates): void {
    try {
      localStorage.setItem(this.sectionStateStorageKey, JSON.stringify(states));
    } catch (error) {
      console.warn('Falha ao salvar estado das seções do menu', error);
    }
  }

  private persistCollapseState(): void {
    try {
      localStorage.setItem(this.collapseStorageKey, this.collapsed.toString());
    } catch (error) {
      console.warn('Falha ao salvar estado de colapso do menu', error);
    }
  }

  private applyCollapsedClass(): void {
    const menuEl = this.menuElement;
    if (!menuEl) {
      return;
    }

    menuEl.classList.toggle('menu-collapsed', this.collapsed);
    menuEl.classList.toggle('collapsed', this.collapsed);

    const collapsedWidth = '88px';
    const expandedWidth = '300px';
    const expandedMinWidth = '280px';

    const targetWidth = this.collapsed ? collapsedWidth : expandedWidth;
    const targetMinWidth = this.collapsed ? collapsedWidth : expandedMinWidth;

    menuEl.style.setProperty('--width', targetWidth);
    menuEl.style.setProperty('--min-width', targetMinWidth);
    menuEl.style.setProperty('--max-width', targetWidth);
    menuEl.style.setProperty('--side-width', targetWidth);

    const splitPane = menuEl.closest('ion-split-pane');
    if (splitPane) {
      splitPane.classList.toggle('menu-collapsed', this.collapsed);
      splitPane.style.setProperty('--side-width', targetWidth);
    }
  }
}
