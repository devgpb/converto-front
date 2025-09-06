import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensagensPadraoService, MensagemPadrao } from '../services/mensagens-padrao.service';

@Component({
  selector: 'app-mensagens-padrao',
  templateUrl: './mensagens-padrao.page.html',
  standalone: false,
  styleUrls: ['./mensagens-padrao.page.scss'],
})
export class MensagensPadraoPage implements OnInit {
  novoForm: FormGroup;
  mensagens: MensagemPadrao[] = [];
  busca: string = '';
  editandoId: number | null = null;
  editForm: FormGroup | null = null;
  // estados locais de carregamento (não bloqueiam toda a UI)
  carregandoLista = false;
  salvandoNovo = false;
  atualizandoId: number | null = null;
  removendoId: number | null = null;

  constructor(private fb: FormBuilder, private service: MensagensPadraoService) {
    this.novoForm = this.fb.group({
      nome: ['', Validators.required],
      mensagem: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregandoLista = true;
    this.service.listar().subscribe({
      next: (res) => {
        this.mensagens = res.dados || [];
      },
      error: () => {
        // poderia exibir um toast aqui
      },
      complete: () => {
        this.carregandoLista = false;
      }
    });
  }

  salvarNovo() {
    if (this.novoForm.invalid) return;
    const valor = this.novoForm.value;
    this.salvandoNovo = true;
    this.service.criar(valor).subscribe({
      next: () => {
        this.novoForm.reset();
      },
      error: () => {},
      complete: () => {
        this.salvandoNovo = false;
        this.carregar();
      }
    });
  }

  iniciarEdicao(msg: MensagemPadrao) {
    this.editandoId = msg.idMensagem ?? null;
    this.editForm = this.fb.group({
      nome: [msg.nome, Validators.required],
      mensagem: [msg.mensagem, Validators.required],
    });
  }

  salvarEdicao(msg: MensagemPadrao) {
    if (!this.editForm || this.editForm.invalid || !msg.idMensagem) return;
    const valor = this.editForm.value as Partial<MensagemPadrao>;
    this.atualizandoId = msg.idMensagem;
    this.service.atualizar(msg.idMensagem, valor).subscribe({
      next: () => {
        this.cancelarEdicao();
      },
      error: () => {},
      complete: () => {
        this.atualizandoId = null;
        this.carregar();
      }
    });
  }

  remover(msg: MensagemPadrao) {
    if (!confirm('Remover mensagem?')) return;
    this.removendoId = msg.idMensagem ?? null;
    this.service.remover(msg.idMensagem!).subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        this.removendoId = null;
        this.carregar();
      }
    });
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.editForm = null;
  }

  // Filtro em memória por nome e conteúdo
  get mensagensFiltradas(): MensagemPadrao[] {
    const t = (this.busca || '').toLowerCase().trim();
    if (!t) return this.mensagens;
    return this.mensagens.filter(m =>
      (m.nome || '').toLowerCase().includes(t) ||
      (m.mensagem || '').toLowerCase().includes(t)
    );
  }

  onBuscar(ev: any) {
    const val = ev?.detail?.value ?? ev?.target?.value ?? '';
    this.busca = val;
  }
}

