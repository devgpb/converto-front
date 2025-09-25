import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { UsuariosService, Usuario } from './usuarios.service';
import { AuthService } from './auth.service';
import { PaymentRequiredModalComponent, PaymentRequiredModalData } from '../components/payment-required-modal/payment-required-modal.component';

@Injectable({ providedIn: 'root' })
export class SubscriptionNotificationService {
  private readonly modalCtrl = inject(ModalController);
  private readonly usuariosService = inject(UsuariosService);
  private readonly authService = inject(AuthService);

  private modalOpen = false;

  async notifyPaymentRequired(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const data: PaymentRequiredModalData = {
      isAdmin: this.authService.isAdmin(),
      hasMultipleUsers: false,
      adminName: null,
    };

    try {
      const usuarios = await firstValueFrom(this.usuariosService.listAll());
      data.hasMultipleUsers = usuarios.length > 1;
      const adminUser = this.findAdminUser(usuarios);
      if (adminUser) {
        data.adminName = adminUser.name || adminUser.email || null;
      }
    } catch (error) {
      console.warn('Não foi possível carregar os usuários para montar o aviso de assinatura.', error);
    }

    const modal = await this.modalCtrl.create({
      component: PaymentRequiredModalComponent,
      componentProps: { data },
      backdropDismiss: false,
      cssClass: 'payment-required-modal',
    });

    modal
      .onDidDismiss()
      .finally(() => {
        this.modalOpen = false;
      })
      .catch(() => {
        this.modalOpen = false;
      });

    await modal.present();
  }

  private findAdminUser(usuarios: Usuario[]): Usuario | undefined {
    const normalized = usuarios.map((user) => ({
      ...user,
      role: (user.role || '').toLowerCase(),
    }));

    return (
      normalized.find((user) => user.role === 'admin' || user.principal) ||
      normalized.find((user) => user.role === 'moderator')
    );
  }
}
