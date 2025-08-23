import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[cepBr]',
  standalone: false
})
export class CepBrDirective {
  constructor(private control: NgControl) {}

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
