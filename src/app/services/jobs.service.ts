import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private jobsApi = `${this.base}/jobs`;
  private adminApi = `${this.base}/admin/queues`;

  listUserJobs(
    states: string = 'waiting,active,completed,failed',
    limit: number = 50
  ): Observable<any> {
    return this.http.get(`${this.jobsApi}/user`, {
      params: { states, limit, t: Date.now().toString() },
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  postImportClients(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.jobsApi}/import-clients`, formData);
  }

  postExportClients(payload: any = {}): Observable<any> {
    return this.http.post(`${this.jobsApi}/export-clients`, payload);
  }

  getJob(queue: string, id: string): Observable<any> {
    return this.http.get(`${this.jobsApi}/${queue}/${id}`);
  }

  cancelJob(queue: string, id: string): Observable<any> {
    return this.http.delete(`${this.jobsApi}/${queue}/${id}`);
  }

  getQueues(): Observable<any> {
    return this.http.get(this.adminApi);
  }
}

