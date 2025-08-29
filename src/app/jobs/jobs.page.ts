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
    this.jobsService.listUserJobs().subscribe({
      next: (res) => {
        this.jobs = (res as any)?.data ?? res ?? [];
      },
      error: () => {
        this.jobs = [];
      },
    });
  }
}
