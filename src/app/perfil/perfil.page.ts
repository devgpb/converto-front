import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { ProfileService, Profile } from '../services/profile.service';

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

  profile?: Profile;
  form = this.fb.group({
    oldPassword: [''],
    newPassword: [''],
  });

  ionViewWillEnter(): void {
    this.profileService.getProfile().subscribe((p) => (this.profile = p));
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
}

