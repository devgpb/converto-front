import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  private router = inject(Router);
  public userId: any

  usage?: any;
  users: any[] = [];
  newUserId = '';

  ionViewWillEnter(): void {
    this.load();
  }

  private load(): void {
    const tenantId = this.auth.getTenantId();
    this.userId = this.auth.getUserId();
    if (tenantId) {
      this.seats.getUsage(tenantId).subscribe((u) => {
        this.usage = u
        this.users = u.users
      });
    }
  }

  sync(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.seats.sync(tenantId).subscribe(() => this.load());
    }
  }

  add(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  remove(userId: string): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId && userId) {
      this.seats.remove(tenantId, userId).subscribe(() => this.load());
    }
  }
}

