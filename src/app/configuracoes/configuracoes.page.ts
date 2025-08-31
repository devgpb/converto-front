import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { FormBuilder } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { EnterpriseService, Enterprise } from '../services/enterprise.service';

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

  form = this.fb.group({ name: [''] });
  private enterprise?: Enterprise;

  toggleDark(event: CustomEvent): void {
    this.theme.setDarkMode((event as any).detail.checked);
  }

  ionViewWillEnter(): void {
    this.enterpriseService.list().subscribe((res) => {
      this.enterprise = res[0];
      if (this.enterprise) {
        this.form.patchValue({ name: this.enterprise.name });
      }
    });
  }

  async save(): Promise<void> {
    if (!this.enterprise) {
      return;
    }
    this.enterpriseService
      .update(this.enterprise.id, { name: this.form.value.name as string })
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
