import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BillingService } from '../../services/billing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirmacao',
  templateUrl: './confirmacao.page.html',
  styleUrls: ['./confirmacao.page.scss'],
  standalone: false,
})
export class ConfirmacaoPage implements OnInit {
  status: any;
  private billing = inject(BillingService);
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.billing.getStatus(tenantId).subscribe((res) => {
        this.status = res;
      });
    }
  }

  goToUsuarios() {
    this.router.navigate(['/usuarios/novo']);
  }

  goToSistema() {
    this.router.navigate(['/vendas/dashboard']);
  }
}

