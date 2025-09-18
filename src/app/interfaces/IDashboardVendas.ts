export interface IDashboardVendas {
  clientesNovosHoje: number;
  clientesAtendidosHoje: number;
  totalClientesCadastrados: number;
  eventosMarcados: number;
  clientesFechados: number;
  statusDistribution?: { status: string | null; count: number }[];
  campanhaDistribution?: { campanha: string | null; count: number }[];
  contatosPorDia?: { date: string; count: number }[];
  ligacoesEfetuadas?: number;
  ligacoesPorDia?: { date: string; count: number }[];
  periodo?: { inicio: string; fim: string; tz: string; preset?: string };
}
