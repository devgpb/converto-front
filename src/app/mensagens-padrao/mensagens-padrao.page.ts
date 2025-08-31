import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensagensPadraoService, MensagemPadrao } from '../services/mensagens-padrao.service';

@Component({
  selector: 'app-mensagens-padrao',
  templateUrl: './mensagens-padrao.page.html',
  styleUrls: ['./mensagens-padrao.page.scss'],
})
export class MensagensPadraoPage implements OnInit {
  form: FormGroup;
  mensagens: MensagemPadrao[] = [];
  editando: MensagemPadrao | null = null;

  constructor(private fb: FormBuilder, private service: MensagensPadraoService) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      mensagem: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe(res => {
      this.mensagens = res.dados || [];
    });
  }

  salvar() {
    if (this.form.invalid) return;
    const valor = this.form.value;
    if (this.editando) {
      this.service.atualizar(this.editando.idMensagem!, valor).subscribe(() => {
        this.cancelar();
        this.carregar();
      });
    } else {
      this.service.criar(valor).subscribe(() => {
        this.form.reset();
        this.carregar();
      });
    }
  }

  editar(msg: MensagemPadrao) {
    this.editando = msg;
    this.form.patchValue({ nome: msg.nome, mensagem: msg.mensagem });
  }

  remover(msg: MensagemPadrao) {
    if (confirm('Remover mensagem?')) {
      this.service.remover(msg.idMensagem!).subscribe(() => this.carregar());
    }
  }

  cancelar() {
    this.editando = null;
    this.form.reset();
  }
}

