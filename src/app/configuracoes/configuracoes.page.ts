import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { FormBuilder } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { EnterpriseService, Enterprise } from '../services/enterprise.service';
import { ProfileService, Profile } from '../services/profile.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  standalone: false,
})
export class ConfiguracoesPage {
  theme = inject(ThemeService);
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private enterpriseService = inject(EnterpriseService);
  private profileService = inject(ProfileService);

  form = this.fb.group({ name: [''], cnpj: [''] });
  private enterprise?: Enterprise;
  isPrincipal = false;

  toggleDark(event: CustomEvent): void {
    this.theme.setDarkMode((event as any).detail.checked);
  }

  ionViewWillEnter(): void {
    this.enterpriseService.list().subscribe((res) => {
      this.enterprise = res[0];
      if (this.enterprise) {
        this.form.patchValue({ name: this.enterprise.name, cnpj: this.enterprise.cnpj || '' });
      }
    });
    this.profileService.getProfile().subscribe((p: Profile) => {
      this.isPrincipal = !!p.principal;
    });
  }

  async save(): Promise<void> {
    if (!this.enterprise) {
      return;
    }
    this.enterpriseService
      .update(this.enterprise.id, {
        name: this.form.value.name as string,
        cnpj: this.isPrincipal ? ((this.form.value.cnpj as string) || undefined) : undefined,
      })
      .subscribe(async () => {
        const alert = await this.alertCtrl.create({
          header: 'Sucesso',
          message: 'Empresa atualizada',
          buttons: ['OK'],
        });
        alert.present();
      });
  }
}
