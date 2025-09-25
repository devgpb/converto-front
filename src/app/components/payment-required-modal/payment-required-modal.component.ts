import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

export interface PaymentRequiredModalData {
  isAdmin: boolean;
  adminName?: string | null;
  hasMultipleUsers: boolean;
}

@Component({
  selector: 'app-payment-required-modal',
  templateUrl: './payment-required-modal.component.html',
  styleUrls: ['./payment-required-modal.component.scss'],
  standalone: false,
})
export class PaymentRequiredModalComponent {
  @Input() data: PaymentRequiredModalData = {
    isAdmin: false,
    hasMultipleUsers: false,
    adminName: null,
  };

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly router: Router
  ) {}

  get isAdmin(): boolean {
    return !!this.data?.isAdmin;
  }

  get adminName(): string | null {
    return this.data?.adminName || null;
  }

  get hasMultipleUsers(): boolean {
    return !!this.data?.hasMultipleUsers;
  }

  get shouldShowAdminName(): boolean {
    return !this.isAdmin && this.hasMultipleUsers && !!this.adminName;
  }

  async goToBilling(): Promise<void> {
    await this.router.navigate(['/perfil']);
    await this.modalCtrl.dismiss();
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }
}
