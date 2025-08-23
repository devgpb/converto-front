import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelefoneBrDirective } from './directives/telefone-br.directive';
import { CpfBrDirective } from './directives/cpf-br.directive';
import { CepBrDirective } from './directives/cep-br.directive';

@NgModule({
  declarations: [
    TelefoneBrDirective,
    CpfBrDirective,
    CepBrDirective
  ],
  imports: [CommonModule],
  exports: [
    TelefoneBrDirective,
    CpfBrDirective,
    CepBrDirective
  ]
})
export class SharedDirectivesModule {}
