import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface TutorialVideo {
  title: string;
  description: string;
  icon: string; // ionicon name
  youtubeUrl: string;
}

@Component({
  selector: 'app-tutoriais',
  templateUrl: './tutoriais.page.html',
  styleUrls: ['./tutoriais.page.scss'],
  standalone: false,
})
export class TutoriaisPage {
  constructor(private sanitizer: DomSanitizer) {}

  videos: TutorialVideo[] = [
    {
      title: 'Visão Geral do Sistema',
      description: 'Aprenda a navegar pelo dashboard e atalhos.',
      icon: 'speedometer-outline',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      title: 'Cadastro de Leads',
      description: 'Como cadastrar e qualificar novos leads.',
      icon: 'person-add-outline',
      youtubeUrl: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
    },
    {
      title: 'Lista de Clientes',
      description: 'Filtros, busca e ações rápidas na lista.',
      icon: 'people-outline',
      youtubeUrl: 'https://www.youtube.com/watch?v=J---aiyznGQ',
    },
    {
      title: 'Mensagens Padrão',
      description: 'Criação e uso de templates de mensagem.',
      icon: 'chatbubbles-outline',
      youtubeUrl: 'https://www.youtube.com/watch?v=a1Y73sPHKxw',
    },
    {
      title: 'Relatórios de Vendas',
      description: 'Gerando e interpretando gráficos e métricas.',
      icon: 'stats-chart-outline',
      youtubeUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    },
  ];

  selected?: TutorialVideo;

  select(video: TutorialVideo): void {
    this.selected = video;
  }

  closeSelected(): void {
    this.selected = undefined;
  }

  getThumbnail(url: string): string {
    const id = this.extractYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    const id = this.extractYoutubeId(url);
    const embed = id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
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

