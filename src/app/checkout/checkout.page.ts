import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BillingService } from '../services/billing.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: false,
})
export class CheckoutPage {
  form: FormGroup;
  private fb = inject(FormBuilder);
  private billing = inject(BillingService);
  private auth = inject(AuthService);

  plans = [
    { id: 'starter', label: '1 conta', priceId: 'price_starter' },
    { id: 'team', label: '2 até 3 contas', priceId: 'price_team' },
    { id: 'medium', label: '4 até 5 contas', priceId: 'price_medium' },
    { id: 'large', label: '6+ contas', priceId: 'price_large' },
  ];

  constructor() {
    this.form = this.fb.group({
      plan: [this.plans[0].id, Validators.required],
      seats: [1, [Validators.required, Validators.min(1)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.value;
    const tenant_id = this.auth.getTenantId();
    if (!tenant_id) {
      return;
    }
    const price = this.plans.find((p) => p.id === value.plan)!;
    this.billing
      .checkout({
        tenant_id,
        price_id: price.priceId,
        seatCountInicial: value.seats,
        success_url: `${window.location.origin}/confirmacao`,
        cancel_url: `${window.location.origin}/checkout`,
      })
      .subscribe((res) => {
        window.location.href = res.checkout_url;
      });
  }
}
