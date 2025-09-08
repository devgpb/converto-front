import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
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

  // Validador de senha forte
  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value || '');
    if (!value) return { required: true };
    const hasMinLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const ok = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
    return ok ? null : { weakPassword: true };
  }

  form = this.fb.group({
    password: ['', [Validators.required, this.strongPasswordValidator.bind(this)]],
    confirm: ['', [Validators.required]]
  });

  // Indicadores para UI
  get pwd() { return String(this.form.value.password || ''); }
  get rMin() { return this.pwd.length >= 8; }
  get rUp() { return /[A-Z]/.test(this.pwd); }
  get rLow() { return /[a-z]/.test(this.pwd); }
  get rNum() { return /\d/.test(this.pwd); }
  get rSpec() { return /[^A-Za-z0-9]/.test(this.pwd); }
  get strength(): number {
    let s = 0;
    if (this.rMin) s++;
    if (this.rUp) s++;
    if (this.rLow) s++;
    if (this.rNum) s++;
    if (this.rSpec) s++;
    return s; // 0-5
  }

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

