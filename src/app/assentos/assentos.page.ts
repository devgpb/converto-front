import { Component, inject } from '@angular/core';
import { SeatsService } from '../services/seats.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-assentos',
  templateUrl: './assentos.page.html',
  standalone: false,
})
export class AssentosPage {
  private seats = inject(SeatsService);
  private auth = inject(AuthService);

  usage?: any;
  userId = '';

  ionViewWillEnter(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.seats.getUsage(tenantId).subscribe((u) => (this.usage = u));
    }
  }

  sync(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.seats.sync(tenantId).subscribe(() => this.ionViewWillEnter());
    }
  }

  add(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId && this.userId) {
      this.seats.add(tenantId, this.userId).subscribe(() => this.ionViewWillEnter());
    }
  }

  remove(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId && this.userId) {
      this.seats.remove(tenantId, this.userId).subscribe(() => this.ionViewWillEnter());
    }
  }
}

