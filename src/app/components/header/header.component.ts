import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HelpModalComponent } from '../help-modal/help-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private menu = inject(MenuController);
  private modal = inject(ModalController);
  title = '';
  help = '';
  menuOpen = false;
  private sub!: Subscription;
  private cleanupMenuListeners?: () => void;

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.route),
        map((r) => {
          while (r.firstChild) {
            r = r.firstChild;
          }
          return r;
        }),
        mergeMap((r) => r.data)
      )
      .subscribe((data) => {
        this.title = data['title'] || '';
        const fromRoute = data['help'] as string | undefined;
        this.help = fromRoute || this.getHelpForUrl(this.router.url || '');
      });
  }

  async ngAfterViewInit(): Promise<void> {
    const menuEl = await this.menu.get('main-menu');
    if (!menuEl) {
      return;
    }

    const handleOpen = () => {
      this.menuOpen = true;
    };
    const handleClose = () => {
      this.menuOpen = false;
    };

    menuEl.addEventListener('ionDidOpen', handleOpen);
    menuEl.addEventListener('ionDidClose', handleClose);

    this.cleanupMenuListeners = () => {
      menuEl.removeEventListener('ionDidOpen', handleOpen);
      menuEl.removeEventListener('ionDidClose', handleClose);
    };

    this.menuOpen = await menuEl.isOpen();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.cleanupMenuListeners?.();
  }

  async openHelp(): Promise<void> {
    if (!this.help) return;
    const modal = await this.modal.create({
      component: HelpModalComponent,
      componentProps: {
        title: this.title || 'Ajuda',
        text: this.help,
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5,
    });
    await modal.present();
  }

  private getHelpForUrl(url: string): string {
    const clean = url.split('?')[0];
    if (clean.startsWith('/vendas/dashboard')) return 'Exibe indicadores e resumo do atendimento e performance das vendas.';
    if (clean.startsWith('/vendas/leads')) return 'Permite cadastrar novos clientes (leads) para início do funil.';
    if (clean.startsWith('/vendas/lista/clientes')) return 'Lista clientes para acompanhamento e ações rápidas de vendas.';
    if (clean.startsWith('/vendas/kanban')) return 'Visualiza clientes por estágio do funil em um quadro Kanban.';
    if (clean.startsWith('/vendas/mensagens-padrao')) return 'Gerencia mensagens padrão para agilizar a comunicação com clientes.';
    if (clean.startsWith('/vendas/ligacoes')) return 'Lista clientes para realizar e registrar ligações de atendimento.';
    if (clean.startsWith('/relatorios/vendedor')) return 'Gera relatório de desempenho por vendedor em um período.';
    if (clean.startsWith('/admin/campos-clientes')) return 'Configura os campos personalizados do cadastro de clientes.';
    if (clean.startsWith('/usuarios/novo')) return 'Cadastra um novo usuário com dados, perfil e permissões.';
    if (clean.startsWith('/usuarios')) return 'Gerencia usuários do sistema e seus níveis de acesso.';
    if (clean.startsWith('/setores')) return 'Administra setores para organizar equipes e permissões.';
    if (clean.startsWith('/clientes/importar')) return 'Importa e exporta clientes via planilhas para facilitar integrações.';
    if (clean.startsWith('/configuracoes')) return 'Ajusta preferências e configurações gerais do sistema.';
    if (clean.startsWith('/tutoriais')) return 'Central de tutoriais e materiais de treinamento.';
    if (clean.startsWith('/suporte')) return 'Entra em contato com o suporte e acessa canais de ajuda.';
    if (clean.startsWith('/perfil')) return 'Visualiza e edita informações do seu perfil e conta.';
    if (clean.startsWith('/jobs')) return 'Acompanha tarefas e processamentos automáticos realizados pelo sistema.';
    if (clean.startsWith('/folder')) return 'Página genérica para navegação e testes.';
    return '';
  }
}
