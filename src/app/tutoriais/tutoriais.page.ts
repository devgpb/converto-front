import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface TutorialVideo {
  title: string;
  description: string;
  icon: string; // ionicon name
  youtubeUrl: string;
}

interface TutorialCategory {
  title: string;
  videos: TutorialVideo[];
}

@Component({
  selector: 'app-tutoriais',
  templateUrl: './tutoriais.page.html',
  styleUrls: ['./tutoriais.page.scss'],
  standalone: false,
})
export class TutoriaisPage {
  constructor(private sanitizer: DomSanitizer) {
    this.expandedCategories = new Set(this.tutorialCategories.map((c) => c.title));
  }

  private embedCache = new Map<string, SafeResourceUrl>(); // evita recriar iframes ao entrar em tela cheia
  expandedCategories: Set<string>;

  tutorialCategories: TutorialCategory[] = [
  {
    title: 'Extensao do Converto',
    videos: [
      {
        title: 'Extensao do Converto no WhatsApp Web',
        description: 'Como instalar e usar a extensao oficial para conectar CRM e WhatsApp.',
        icon: 'logo-chrome',
        youtubeUrl: 'https://www.youtube.com/embed/rE3-ZgGG-_I?si=N-_z7AjOhXLCwlbE',
      },
    ],
  },
  {
    title: 'Tutoriais do sistema',
    videos: [
      {
        title: '#1 Converto Tutorial - Tela de Trabalhos',
        description: 'Entenda como os trabalhos se relacionam com as operações do dia a dia.',
        icon: 'briefcase-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=3UAA2IfMmoE',
      },
      {
        title: '#2 Converto Tutorial - Tela de Relatório de Vendas',
        description: 'Aprofunde-se nas métricas e monitore resultados em tempo real.',
        icon: 'stats-chart-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=700vuXlahK8',
      },
      {
        title: '#3 Converto Tutorial - Tela de Lista de Clientes',
        description: 'Use filtros e ações rápidas para gerenciar clientes ativos.',
        icon: 'people-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=LZgSyii-3zQ',
      },
      {
        title: '#4 Converto Tutorial - Tela de Funil de vendas',
        description: 'Mantenha o funil atualizado e acompanhe a evolução das oportunidades.',
        icon: 'git-compare-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=6WvBevmMH5E',
      },
      {
        title: '#5 Converto Tutorial - Tela de Lista de Ligação',
        description: 'Organize ligações e defina prioridades para sua equipe.',
        icon: 'call-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=r3D-s7rHZnU',
      },
      {
        title: '#6 Converto Tutorial - Tela de Importação e Exportação',
        description: 'Veja como importar e exportar bases de contatos com segurança.',
        icon: 'cloud-upload-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=gxD3i5nG63w',
      },
      {
        title: '#7 Converto Tutorial - Tela de Mensagens Padrão',
        description: 'Dicas para automatizar rotinas frequentes com respostas prontas.',
        icon: 'chatbubbles-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=BuE23dWECmc',
      },
      {
        title: '#8 Converto Tutorial - Tela de Mensagens Padrão',
        description: 'Aprenda a duplicar, editar e organizar seus templates.',
        icon: 'chatbubble-ellipses-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=axOD8idY-34',
      },
      {
        title: '#9 Converto Tutorial - Tela de Mensagens Padrão',
        description: 'Personalize mensagens padrão para agilizar o contato com leads.',
        icon: 'chatbox-ellipses-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=8nn0jJJurjA',
      },
      {
        title: '#10 Converto Tutorial - Tela de Campos de Clientes',
        description: 'Configure campos personalizados e organize os dados dos clientes.',
        icon: 'document-text-outline',
        youtubeUrl: 'https://www.youtube.com/watch?v=YrGKc5y-pIw',
      },
    ],
  },
];


  selected?: TutorialVideo;

  select(video: TutorialVideo): void {
    this.selected = video;
  }

  closeSelected(): void {
    this.selected = undefined;
  }

  toggleCategory(title: string): void {
    if (this.expandedCategories.has(title)) {
      this.expandedCategories.delete(title);
    } else {
      this.expandedCategories.add(title);
    }
    // trigger change detection by replacing the set reference
    this.expandedCategories = new Set(this.expandedCategories);
  }

  isExpanded(title: string): boolean {
    return this.expandedCategories.has(title);
  }

  getThumbnail(url: string): string {
    const id = this.extractYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    if (this.embedCache.has(url)) {
      return this.embedCache.get(url)!;
    }
    const id = this.extractYoutubeId(url);
    const embed = id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    this.embedCache.set(url, safe);
    return safe;
  }

  private extractYoutubeId(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '') || null;
      }
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return v;
        const parts = u.pathname.split('/');
        const idx = parts.indexOf('embed');
        if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
      }
      return null;
    } catch {
      return null;
    }
  }
}
