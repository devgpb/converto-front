import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
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

  loading = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const email = this.form.value.email as string;
    try {
      await this.auth.forgotPassword(email).toPromise();
      const toast = await this.toastCtrl.create({
        message: 'Se o email existir, enviaremos as instruções.',
        duration: 3000,
        color: 'success'
      });
      toast.present();
      this.form.reset();
    } catch (err: any) {
      const toast = await this.toastCtrl.create({
        message: err?.error?.error || 'Não foi possível enviar. Tente mais tarde.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.loading = false;
    }
  }
}

