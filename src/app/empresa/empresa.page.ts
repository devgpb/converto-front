import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { EnterpriseService, Enterprise } from '../services/enterprise.service';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.page.html',
  standalone: false,
})
export class EmpresaPage {
  private service = inject(EnterpriseService);
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);

  form = this.fb.group({ name: [''] });
  private enterprise?: Enterprise;

  ionViewWillEnter(): void {
    this.service.list().subscribe((res) => {
      this.enterprise = res[0];
      if (this.enterprise) {
        this.form.patchValue({ name: this.enterprise.name });
      }
    });
  }

  save(): void {
    if (!this.enterprise) {
      return;
    }
    this.service.update(this.enterprise.id, { name: this.form.value.name as string }).subscribe(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Sucesso',
        message: 'Empresa atualizada',
        buttons: ['OK'],
      });
      alert.present();
    });
  }
}

