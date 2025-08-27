import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Plan {
  title: string;
  description: string;
  price: string;
}

@Component({
  selector: 'app-planos',
  templateUrl: './planos.page.html',
  styleUrls: ['./planos.page.scss'],
})
export class PlanosPage {
  plans: Plan[] = [
    { title: '1 conta', description: 'Plano starter para teste e gerencia de uma pessoa só', price: 'R$29,90' },
    { title: '2 até 3 contas', description: 'Para equipes de vendas', price: 'R$23,00 por conta' },
    { title: '4 até 5 contas', description: 'Para empresas médias', price: 'R$26,00 por conta' },
    { title: '6+ contas', description: 'Para empresas grandes', price: 'R$30,00 por conta' },
  ];

  constructor(private router: Router) {}

  começar(): void {
    this.router.navigate(['/cadastro']);
  }
}
