import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { ProfileService, Profile } from '../services/profile.service';
import { BillingService } from '../services/billing.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage {
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private billing = inject(BillingService);

  profile?: Profile;
  billingStatus?: { status_billing?: string; subscriptions?: any[] };
  form = this.fb.group({
    oldPassword: [''],
    newPassword: [''],
  });
  profileForm = this.fb.group({
    cpf: [''],
  });

  showCancelForm = false;
  cancelling = false;
  resuming = false;
  reactivating = false;
  syncing = false;
  cancelForm = this.fb.group({
    motivo: [''],
    descricao: ['', [Validators.maxLength(500)]],
  });
  motivosPossiveis: string[] = [
    'Preço',
    'Parei de usar',
    'Falta de funcionalidades',
    'Problemas técnicos',
    'Outro',
  ];

  ionViewWillEnter(): void {
    this.profileService.getProfile().subscribe((p) => {
      this.profile = p;
      const tenantId = (p as any)?.tenant?.id;
      this.profileForm.patchValue({ cpf: p.cpf || '' });
      if (tenantId) {
        this.refreshBillingStatus(String(tenantId));
      }
    });
  }

  changePassword(): void {
    const { oldPassword, newPassword } = this.form.value;
    if (!oldPassword || !newPassword) {
      return;
    }
    this.profileService.changePassword(oldPassword, newPassword).subscribe({
      next: async (res) => {
        const alert = await this.alertCtrl.create({
          header: 'Sucesso',
          message: res.message,
          buttons: ['OK'],
        });
        await alert.present();
        this.form.reset();
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: err.error?.error || 'Não foi possível alterar a senha',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  saveProfile(): void {
    const cpf = this.profileForm.value.cpf || undefined;
    this.profileService.updateProfile({ cpf }).subscribe(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Sucesso',
        message: 'Dados do perfil atualizados',
        buttons: ['OK'],
      });
      await alert.present();
    });
  }

    get isAdminOrModerator(): boolean {
      const role = this.profile?.role;
      return role === 'admin' || role === 'moderator';
    }

    get activeSubscription(): any | null {
      const subs = this.billingStatus?.subscriptions || [];
      return subs.length ? subs[0] : null;
    }

    get canCancel(): boolean {
      const sub = this.activeSubscription;
      return !!(this.isAdminOrModerator && sub && (sub.status === 'active' || sub.status === 'trialing') && !sub.cancel_at_period_end);
    }

    /**
     * Indica se a assinatura pode ser retomada (resume).
     *
     * Retorna true quando todos os seguintes critérios são satisfeitos:
     * - o usuário tem permissão de administrador ou moderador (isAdminOrModerator);
     * - existe uma assinatura ativa (activeSubscription);
     * - o status da assinatura é 'active' ou 'trialing' (a assinatura ainda está vigente ou em período de teste);
     * - e a assinatura está marcada para cancelamento ao final do período atual (cancel_at_period_end).
     *
     * O uso de "!!" garante que o valor final seja sempre um booleano.
     *
     * Em resumo: permite a retomada apenas de assinaturas que ainda estão em vigor, mas foram agendadas para cancelamento, desde que o usuário tenha as permissões necessárias.
     *
     * @returns true se a assinatura puder ser retomada segundo os critérios acima; caso contrário, false.
     */
    get canResume(): boolean {
      const sub = this.activeSubscription;
      return !!(this.isAdminOrModerator && sub && (sub.status === 'active' || sub.status === 'trialing') && sub.cancel_at_period_end);
    }

    get canReactivateAfterCancellation(): boolean {
      return !!(this.isAdminOrModerator && this.billingStatus?.status_billing === 'canceled');
    }

    synceSubscriptionStatus(): void {
      if (!this.profile?.tenant?.id) return;
      if (!this.isAdminOrModerator) return;
      this.syncing = true;
      this.billing.sync({ tenant_id: String((this.profile as any)?.tenant?.id) }).subscribe({
        next: () => {
          this.syncing = false;
          const tenantId = (this.profile as any)?.tenant?.id;
          if (tenantId) this.refreshBillingStatus(String(tenantId));
        },
        error: async (err) => {
          this.syncing = false;
          const alert = await this.alertCtrl.create({
            header: 'Erro ao sincronizar',
            message: err?.error?.error || 'Não foi possível sincronizar o status agora.',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
    }

    async cancelSubscription(): Promise<void> {
      if (!this.profile?.tenant?.id) return;
      if (!this.isAdminOrModerator) return;

      const confirm = await this.alertCtrl.create({
        header: 'Cancelar renovação',
        message:
          'Ao confirmar, sua assinatura não será renovada. Você continuará com acesso até o fim do período já pago.',
        buttons: [
          { text: 'Voltar', role: 'cancel' },
          {
            text: 'Confirmar',
            role: 'destructive',
            handler: () => this.doCancel(),
          },
        ],
      });
      await confirm.present();
    }

    private async doCancel(): Promise<void> {
      if (!this.profile?.tenant?.id) return;
      this.cancelling = true;
      const { motivo, descricao } = this.cancelForm.value;
      this.billing
        .cancel({
          tenant_id: String((this.profile as any)?.tenant?.id),
          motivo: motivo || undefined,
          descricao: descricao || undefined,
        })
        .subscribe({
          next: async (res) => {
            this.cancelling = false;
            const end = res?.current_period_end
              ? new Date(res.current_period_end).toLocaleDateString()
              : null;
            const alert = await this.alertCtrl.create({
              header: 'Renovação cancelada',
              message:
                (end
                  ? `Você manterá acesso até ${end}. `
                  : 'Você manterá acesso até o fim do período vigente. ') +
                'Você pode reativar a renovação a qualquer momento antes do término.',
              buttons: ['OK'],
            });
            await alert.present();
            this.showCancelForm = false;
            this.cancelForm.reset();
            const tenantId = (this.profile as any)?.tenant?.id;
            if (tenantId) this.refreshBillingStatus(String(tenantId));
          },
          error: async (err) => {
            this.cancelling = false;
            const alert = await this.alertCtrl.create({
              header: 'Erro ao cancelar',
              message: err?.error?.error || 'Não foi possível cancelar a renovação agora.',
              buttons: ['OK'],
            });
            await alert.present();
          },
        });
    }

    async resumeSubscription(): Promise<void> {
      if (!this.profile?.tenant?.id) return;
      if (!this.isAdminOrModerator) return;

      const confirm = await this.alertCtrl.create({
        header: 'Reativar renovação',
        message: 'Sua assinatura voltará a renovar automaticamente no próximo ciclo.',
        buttons: [
          { text: 'Voltar', role: 'cancel' },
          {
            text: 'Reativar',
            role: 'confirm',
            handler: () => this.doResume(),
          },
        ],
      });
      await confirm.present();
    }

    private async doResume(): Promise<void> {
      if (!this.profile?.tenant?.id) return;
      this.resuming = true;
      this.billing
        .resume({ tenant_id: String((this.profile as any)?.tenant?.id) })
        .subscribe({
          next: async (res) => {
            this.resuming = false;
            const alert = await this.alertCtrl.create({
              header: 'Renovação reativada',
              message: 'A renovação automática foi reativada com sucesso.',
              buttons: ['OK'],
            });
            await alert.present();
            const tenantId = (this.profile as any)?.tenant?.id;
            if (tenantId) this.refreshBillingStatus(String(tenantId));
          },
          error: async (err) => {
            this.resuming = false;
            const alert = await this.alertCtrl.create({
              header: 'Erro ao reativar',
              message: err?.error?.error || 'Não foi possível reativar a renovação agora.',
              buttons: ['OK'],
            });
            await alert.present();
          },
        });
    }

    async reactivateSubscription(): Promise<void> {
      if (!this.profile?.tenant?.id) return;
      if (!this.isAdminOrModerator) return;

      const confirm = await this.alertCtrl.create({
        header: 'Reativar assinatura',
        message: 'Vamos direcionar você para um novo checkout para concluir o pagamento no cartão.',
        buttons: [
          { text: 'Voltar', role: 'cancel' },
          {
            text: 'Continuar',
            role: 'confirm',
            handler: () => this.doReactivate(),
          },
        ],
      });
      await confirm.present();
    }

    private doReactivate(): void {
      if (!this.profile?.tenant?.id) return;
      const tenantId = String((this.profile as any)?.tenant?.id);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (!origin) {
        this.alertCtrl.create({
          header: 'Não foi possível gerar o checkout',
          message: 'Não conseguimos identificar a origem para montar as URLs de retorno.',
          buttons: ['OK'],
        }).then((alert) => alert.present());
        return;
      }
      const cancelUrl = `${origin}/perfil`;
      const successUrl = `${origin}/perfil?reativada=1`;
      const seatCount = this.profile?.seats?.paid || this.profile?.seats?.total_users || 1;

      this.reactivating = true;

      this.billing
        .reactivate({
          tenant_id: tenantId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          seatCountInicial: seatCount ?? 1,
        })
        .subscribe({
          next: (res) => {
            this.reactivating = false;
            if (res?.checkout_url) {
              window.location.href = res.checkout_url;
            }
          },
          error: async (err) => {
            this.reactivating = false;
            const alert = await this.alertCtrl.create({
              header: 'Erro ao reativar assinatura',
              message: err?.error?.error || 'Não foi possível gerar o checkout de reativação agora.',
              buttons: ['OK'],
            });
            await alert.present();
          },
        });
    }

    private refreshBillingStatus(tenantId: string): void {
      this.billingServiceGetStatus(tenantId);
    }

    private billingServiceGetStatus(tenantId: string): void {
      this.billing.getStatus(tenantId).subscribe((res) => {
        this.billingStatus = res;
        console.log('Billing status', res);
      });
    }
}
