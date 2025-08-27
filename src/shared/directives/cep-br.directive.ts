import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[cepBr]',
  standalone: false
})
export class CepBrDirective {
  private control = inject(NgControl);

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);

    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }

    this.control.control?.setValue(value, { emitEvent: false });
  }
}
