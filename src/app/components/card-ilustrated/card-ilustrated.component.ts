import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-ilustrated',
  templateUrl: './card-ilustrated.component.html',
  styleUrls: ['./card-ilustrated.component.scss'],
  standalone: false,
})
export class CardIlustratedComponent {
  /** Ícone Ionicons (ex: 'happy-outline') */
  @Input() icon: string = 'happy-outline';
  /** Variação do ícone: puro (só o ícone) ou badge (círculo) */
  @Input() iconVariant: 'pure' | 'badge' = 'badge';
  /** Título exibido no card */
  @Input() title: string = '';
  /** Texto/descrição do card */
  @Input() text: string = '';
  /** Ordem/posição para exibir como #n no rodapé esquerdo */
  @Input() order: number | null = null;
  /** Borda arredondada */
  @Input() rounded = true;
  /** Borda fina de 1px visível */
  @Input() thin = true;
}

