import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  templateUrl: './esqueci-senha.page.html',
  styleUrls: ['./esqueci-senha.page.scss'],
  standalone: false,
})
export class EsqueciSenhaPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  loading = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const loadingEl = await this.loadingCtrl.create({
      message: 'Enviando…',
      spinner: 'crescent',
      backdropDismiss: false,
      cssClass: 'forgot-loading'
    });
    await loadingEl.present();
    const email = this.form.value.email as string;
    try {
      await this.auth.forgotPassword(email).toPromise();
      // Mensagem mais chamativa
      const alert = await this.alertCtrl.create({
        header: 'Verifique seu e-mail',
        message: `Enviamos as instruções para recuperar sua senha para ${email}.\nConfira sua caixa de entrada e o spam.`,
        buttons: [{ text: 'OK', role: 'confirm' }],
      });
      await alert.present();
      this.form.reset();
    } catch (err: any) {
      const alert = await this.alertCtrl.create({
        header: 'Falha ao enviar',
        message: err?.error?.error || 'Não foi possível enviar. Tente novamente mais tarde.',
        buttons: [{ text: 'Fechar', role: 'cancel' }],
      });
      await alert.present();
    } finally {
      await loadingEl.dismiss();
      this.loading = false;
    }
  }
}

