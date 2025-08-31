import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensagensPadraoService, MensagemPadrao } from '../services/mensagens-padrao.service';
import { LoadingController } from '@ionic/angular';

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

  constructor(private fb: FormBuilder, private service: MensagensPadraoService, private loadingCtrl: LoadingController) {
    this.novoForm = this.fb.group({
      nome: ['', Validators.required],
      mensagem: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.carregar();
  }

  async carregar() {
    const loading = await this.loadingCtrl.create({ message: 'Carregando mensagens...' });
    await loading.present();
    this.service.listar().subscribe({
      next: (res) => {
        this.mensagens = res.dados || [];
      },
      error: () => {
        // poderia exibir um toast aqui, mas mantendo simples
      },
      complete: () => loading.dismiss()
    });
  }

  async salvarNovo() {
    if (this.novoForm.invalid) return;
    const valor = this.novoForm.value;
    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();
    this.service.criar(valor).subscribe({
      next: () => {
        this.novoForm.reset();
      },
      error: () => {},
      complete: () => {
        loading.dismiss();
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

  async salvarEdicao(msg: MensagemPadrao) {
    if (!this.editForm || this.editForm.invalid || !msg.idMensagem) return;
    const valor = this.editForm.value as Partial<MensagemPadrao>;
    const loading = await this.loadingCtrl.create({ message: 'Atualizando...' });
    await loading.present();
    this.service.atualizar(msg.idMensagem, valor).subscribe({
      next: () => {
        this.cancelarEdicao();
      },
      error: () => {},
      complete: () => {
        loading.dismiss();
        this.carregar();
      }
    });
  }

  async remover(msg: MensagemPadrao) {
    if (!confirm('Remover mensagem?')) return;
    const loading = await this.loadingCtrl.create({ message: 'Removendo...' });
    await loading.present();
    this.service.remover(msg.idMensagem!).subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        loading.dismiss();
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

