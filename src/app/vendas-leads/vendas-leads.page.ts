import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClientesService } from '../services/clientes.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vendas-leads',
  templateUrl: './vendas-leads.page.html',
  styleUrls: ['./vendas-leads.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
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

  get f() {
    return this.clienteForm.controls;
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    const tenantId = this.auth.getTenantId();
    const cliente = {
      ...this.clienteForm.value,
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
      error: () => {},
    });
  }

  async handleCidadeChange(ev: any) {
    if (ev.detail.value === '__add__') {
      const alert = await this.alertController.create({
        header: 'Nova Cidade',
        inputs: [{ name: 'value', type: 'text', placeholder: 'Digite a cidade' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Adicionar',
            handler: (data) => {
              if (data.value) {
                this.cidades = [data.value, ...this.cidades];
                this.clienteForm.get('cidade')?.setValue(data.value);
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  async handleStatusChange(ev: any) {
    if (ev.detail.value === '__add__') {
      const alert = await this.alertController.create({
        header: 'Novo Status',
        inputs: [{ name: 'value', type: 'text', placeholder: 'Digite o status' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Adicionar',
            handler: (data) => {
              if (data.value) {
                this.statusList = [data.value, ...this.statusList];
                this.clienteForm.get('status')?.setValue(data.value);
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  async handleCampanhaChange(ev: any) {
    if (ev.detail.value === '__add__') {
      const alert = await this.alertController.create({
        header: 'Nova Campanha',
        inputs: [{ name: 'value', type: 'text', placeholder: 'Digite a campanha' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Adicionar',
            handler: (data) => {
              if (data.value) {
                this.listaCampanhas = [data.value, ...this.listaCampanhas];
                this.clienteForm.get('campanha')?.setValue(data.value);
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
