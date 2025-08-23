import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClientesService } from '../services/clientes.service';
import { AuthService } from '../services/auth.service';
import { IonSelect } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SharedDirectivesModule } from 'src/shared/shared-directives.module';

@Component({
  selector: 'app-vendas-leads',
  templateUrl: './vendas-leads.page.html',
  styleUrls: ['./vendas-leads.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, SharedDirectivesModule],
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
    const tenantId = this.auth.getTenantId();
    const formValue = this.clienteForm.value;
    const cliente = {
      nome: formValue.nome ?? '',
      celular: formValue.celular ?? '',
      cidade: formValue.cidade ?? '',
      status: formValue.status ?? '',
      indicacao: formValue.indicacao ?? '',
      campanha: formValue.campanha ?? '',
      observacao: formValue.observacao ?? '',
      tenant_id: tenantId,
    };
    this.clientesService.postCliente(cliente).subscribe({
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
      error: () => {
        this.alertController
          .create({
            header: 'Erro!',
            message: 'Ocorreu um erro ao cadastrar o cliente.',
            buttons: ['OK'],
          })
          .then((a) => a.present());
      },
    });
  }

  fetchFiltros(): void {
    this.clientesService.getFiltrosClientes().subscribe({
      next: (data) => {
        this.cidades = data.cidades;
        this.statusList = data.status;
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
