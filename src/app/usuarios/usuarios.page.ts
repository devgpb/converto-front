import { Component, inject } from '@angular/core';
import { SeatsService } from '../services/seats.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  standalone: false,
})
export class UsuariosPage {
  private seats = inject(SeatsService);
  private auth = inject(AuthService);

  usage?: any;
  users: any[] = [];
  newUserId = '';

  ionViewWillEnter(): void {
    this.load();
  }

  private load(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.seats.getUsage(tenantId).subscribe((u) => (this.usage = u));
      this.seats.list(tenantId).subscribe((users) => (this.users = users));
    }
  }

  sync(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.seats.sync(tenantId).subscribe(() => this.load());
    }
  }

  add(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId && this.newUserId) {
      this.seats.add(tenantId, this.newUserId).subscribe(() => {
        this.newUserId = '';
        this.load();
      });
    }
  }

  remove(userId: string): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId && userId) {
      this.seats.remove(tenantId, userId).subscribe(() => this.load());
    }
  }
}

