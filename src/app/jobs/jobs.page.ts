import { Component, OnInit, inject } from '@angular/core';
import { JobsService } from '../services/jobs.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.page.html',
  styleUrls: ['./jobs.page.scss'],
  standalone: false,
})
export class JobsPage implements OnInit {
  private jobsService = inject(JobsService);
  jobs: any[] = [];

  ngOnInit(): void {
    this.loadJobs();
  }

  ionViewWillEnter(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    this.jobsService.listUserJobs().subscribe({
      next: (res) => {
        const data = (res as any)?.data ?? res;
        this.jobs = data?.jobs ?? data ?? [];
      },
      error: () => {
        this.jobs = [];
      },
    });
  }

  translateQueue(queue: string): string {
    const map: Record<string, string> = {
      'import-clients': 'Importar Clientes',
      'export-clients': 'Exportar Clientes',
    };
    return map[queue] ?? queue;
  }

  translateState(job: any): string {
    const map: Record<string, string> = {
      waiting: 'Aguardando',
      active: 'Em execução',
      completed: 'Concluído',
      failed: 'Erro',
    };
    let text = map[job.state] ?? job.state;
    if (job.state === 'failed' && job.failedReason) {
      text += `: ${job.failedReason}`;
    }
    return text;
  }

  statusColor(state: string): string {
    switch (state) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'active':
        return 'warning';
      case 'waiting':
        return 'medium';
      default:
        return 'primary';
    }
  }
}
