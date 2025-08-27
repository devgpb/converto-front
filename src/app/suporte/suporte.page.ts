import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-suporte',
  templateUrl: './suporte.page.html',
  standalone: false,
})
export class SuportePage {
  private fb = inject(FormBuilder);

  readonly email = 'suporte@converto.com';
  readonly whatsapp = '5599999999999';

  form = this.fb.group({
    type: ['Comentário'],
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
}

