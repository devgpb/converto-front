import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TenantService } from '../services/tenant.service';
import { BillingService } from '../services/billing.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PerfilPage {
  private tenantService = inject(TenantService);
  private billingService = inject(BillingService);
  private auth = inject(AuthService);

  tenant?: any;
  billing?: any;

  ionViewWillEnter(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.tenantService.getTenant(tenantId).subscribe((t) => (this.tenant = t));
      this.billingService.getStatus(tenantId).subscribe((b) => (this.billing = b));
    }
  }
}
