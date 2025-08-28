import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { SugestoesService, TipoSugestao } from '../services/sugestoes.service';

@Component({
  selector: 'app-suporte',
  templateUrl: './suporte.page.html',
  styleUrls: ['./suporte.page.scss'],
  standalone: false,
})
export class SuportePage {
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private sugestoesService = inject(SugestoesService);

  readonly email = 'suporte@converto.com';
  readonly whatsapp = '5599999999999';

  form = this.fb.group({
    type: ['comentario'],
    message: ['', Validators.maxLength(800)],
  });

  copyEmail(): void {
    navigator.clipboard.writeText(this.email);
  }

  openWhatsApp(): void {
    window.open(`https://wa.me/${this.whatsapp}`, '_blank');
  }

  submit(): void {
    // no action for now
  }
  async enviarSugestao(): Promise<void> {
    const type = (this.form.get('type')?.value as string) || '';
    const message = (this.form.get('message')?.value as string) || '';
    if (!type || !message) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Preencha o tipo e a mensagem (até 800 caracteres).',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
    const tipo = type.includes('bug') ? 'Bug' : type.includes('sugestao') ? 'Sugestão' : 'Comentário';
    const mensagem = message;
    console.log(tipo)
    this.sugestoesService
      .enviarSugestao({ tipo: tipo as TipoSugestao, mensagem })
      .subscribe({
        next: async (res) => {
          const alert = await this.alertCtrl.create({
            header: 'Obrigado!',
            message: res?.message || 'Sugestão enviada com sucesso. Nossa equipe vai analisar',
            buttons: ['OK'],
          });
          await alert.present();
          this.form.reset();
        },
        error: async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Erro',
            message: err?.error?.error || 'Não foi possível enviar sua sugestão.',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
  }
}

