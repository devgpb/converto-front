import { Component, OnInit, inject } from '@angular/core';
import { AlertController, IonSelect } from '@ionic/angular';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClientesService } from '../services/clientes.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vendas-leads',
  templateUrl: './vendas-leads.page.html',
  styleUrls: ['./vendas-leads.page.scss'],
  standalone: false,
})
export class VendasLeadsPage implements OnInit {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private auth = inject(AuthService);
  private alertController = inject(AlertController);

  clienteForm = this.fb.group({
    nome: ['', Validators.required],
    celular: ['', [Validators.required, this.celularBRValidator]],
    cidade: [''],
    status: [''],
    indicacao: [''],
    campanha: [''],
    observacao: [''],
  });

  cidades: string[] = [];
  statusList: string[] = [];
  listaCampanhas: string[] = [];

  ngOnInit(): void {
    this.listaCampanhas = this.clientesService.listaDeCampanhas;
    this.fetchFiltros();
  }

  private waitOverlayClosed() {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  }

  get f() {
    return this.clienteForm.controls;
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    const formValue = this.clienteForm.value;
    // Alinha payload com API: enviar apenas campos com valor
    const trim = (v: any) => typeof v === 'string' ? v.trim() : v;
    const maybe = (v: any) => {
      const t = trim(v);
      return t === undefined || t === null || t === '' ? undefined : t;
    };

    // A API aceita status/campanha por nome ou id; aqui enviamos o que vier do form
    const payload: any = {};
    payload.nome = trim(formValue.nome) || '';
    payload.celular = trim(formValue.celular) || '';
    const cidade = maybe(formValue.cidade);
    if (cidade !== undefined) payload.cidade = cidade;
    let status = maybe(formValue.status) as any;
    if (typeof status === 'string' && status.trim().toLowerCase() === 'fechado') {
      // Backend exige usar campo "fechado" para encerrar
      payload.fechado = new Date().toISOString();
      status = undefined;
    }
    if (status !== undefined) payload.status = status;
    const indicacao = maybe(formValue.indicacao);
    if (indicacao !== undefined) payload.indicacao = indicacao;
    const campanha = maybe(formValue.campanha);
    if (campanha !== undefined) payload.campanha = campanha;
    const observacao = maybe(formValue.observacao);
    if (observacao !== undefined) payload.observacao = observacao;

    // Importante: enterprise/tenant vem do token; nao enviar tenant_id
    this.clientesService.postCliente(payload).subscribe({
      next: () => {
        this.alertController
          .create({
            header: 'Sucesso!',
            message: 'Cliente cadastrado com sucesso.',
            buttons: ['OK'],
          })
          .then((a) => a.present());
        this.clienteForm.reset();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Ocorreu um erro ao cadastrar o cliente.';
        this.alertController
          .create({
            header: 'Erro!',
            message: msg,
            buttons: ['OK'],
          })
          .then((a) => a.present());
      },
    });
  }

  fetchFiltros(): void {
    this.clientesService.getFiltrosClientes().subscribe({
      next: (data) => {
        const norm = (arr: any[]): string[] =>
          (arr || [])
            .map((x: any) => typeof x === 'string' ? x : (x && x.nome) ? String(x.nome) : '')
            .filter((s: string) => !!s);
        this.cidades = norm((data as any).cidades);
        this.statusList = norm((data as any).status);
      },
      error: () => { },
    });
  }

  async handleCidadeChange(ev: any, selectRef: IonSelect) {
    const value = ev.detail?.value;
    if (value === '__add__') {
      // evita que "__add__" fique no form
      this.clienteForm.get('cidade')?.setValue('');
      await this.waitOverlayClosed();

      const alert = await this.alertController.create({
        header: 'Nova Cidade',
        inputs: [{ name: 'value', type: 'text', placeholder: 'Digite a cidade' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Adicionar',
            handler: (data) => {
              const novo = (data?.value || '').trim();
              if (novo) {
                // evita duplicado
                if (!this.cidades.includes(novo)) this.cidades = [novo, ...this.cidades];
                this.clienteForm.get('cidade')?.setValue(novo);
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  async handleStatusChange(ev: any, selectRef: IonSelect) {
    const value = ev.detail?.value;
    if (value === '__add__') {
      this.clienteForm.get('status')?.setValue('');
      await this.waitOverlayClosed();

      const alert = await this.alertController.create({
        header: 'Novo Status',
        inputs: [{ name: 'value', type: 'text', placeholder: 'Digite o status' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Adicionar',
            handler: (data) => {
              const novo = (data?.value || '').trim();
              if (novo) {
                if (!this.statusList.includes(novo)) this.statusList = [novo, ...this.statusList];
                this.clienteForm.get('status')?.setValue(novo);
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  async handleCampanhaChange(ev: any, selectRef: IonSelect) {
    const value = ev.detail?.value;
    if (value === '__add__') {
      this.clienteForm.get('campanha')?.setValue('');
      await this.waitOverlayClosed();

      const alert = await this.alertController.create({
        header: 'Nova Campanha',
        inputs: [{ name: 'value', type: 'text', placeholder: 'Digite a campanha' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Adicionar',
            handler: (data) => {
              const novo = (data?.value || '').trim();
              if (novo) {
                if (!this.listaCampanhas.includes(novo)) this.listaCampanhas = [novo, ...this.listaCampanhas];
                this.clienteForm.get('campanha')?.setValue(novo);
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  celularBRValidator(control: AbstractControl): ValidationErrors | null {
    const digits = (control.value ?? '').toString().replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length < 11) return { celularIncompleto: true };
    return null;
  }
}
