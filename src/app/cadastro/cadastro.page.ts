import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { switchMap } from 'rxjs';

import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage {
  form: FormGroup;
  private fb = inject(FormBuilder);
  private tenant = inject(TenantService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastController);

  constructor() {
    this.form = this.fb.group({
      empresa: ['', Validators.required],
      emailEmpresa: ['', [Validators.required, Validators.email]],
      adminNome: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.value;
    this.tenant
      .createTenant({ name: value.empresa, email: value.emailEmpresa })
      .pipe(
        switchMap((tenant) =>
          this.auth.register({
            tenant_id: tenant.id,
            email: value.adminEmail,
            password: value.senha,
            name: value.adminNome,
          })
        )
      )
      .subscribe({
        next: () => this.router.navigate(['/checkout']),
        error: async (error) => {
          const message = error?.error?.error || 'Erro ao cadastrar.';
          const toast = await this.toast.create({
            message,
            duration: 3000,
            color: 'danger',
          });
          toast.present();
        },
      });
  }
}
