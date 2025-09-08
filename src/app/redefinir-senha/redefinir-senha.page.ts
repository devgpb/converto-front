import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-redefinir-senha',
  templateUrl: './redefinir-senha.page.html',
  styleUrls: ['./redefinir-senha.page.scss'],
  standalone: false,
})
export class RedefinirSenhaPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  token: string | null = null;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]]
  });

  ngOnInit() {
    // Usa subscription para garantir captura do token em inicialização e navegações
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token');
    });
  }

  get passwordsMatch(): boolean {
    const v = this.form.value;
    return (v.password || '') === (v.confirm || '');
  }

  async submit() {
    if (!this.token) {
      const toast = await this.toastCtrl.create({ message: 'Token ausente', duration: 2500, color: 'danger' });
      toast.present();
      return;
    }

    if (this.form.invalid || !this.passwordsMatch || this.loading) return;
    this.loading = true;
    const password = this.form.value.password as string;
    try {
      await this.auth.resetPassword(this.token, password).toPromise();
      const toast = await this.toastCtrl.create({
        message: 'Senha redefinida com sucesso. Faça login.',
        duration: 3000,
        color: 'success'
      });
      toast.present();
      this.router.navigate(['/login']);
    } catch (err: any) {
      const toast = await this.toastCtrl.create({
        message: err?.error?.error || 'Não foi possível redefinir a senha.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.loading = false;
    }
  }
}

