/** Séries sintéticas que num backend real viriam de snapshots históricos —
 * não dá para derivar isso dos arrays de estado atual. */

export const mrrHistorico = [
  { mes: 'Mar', valor: 3120 },
  { mes: 'Abr', valor: 3380 },
  { mes: 'Mai', valor: 3510 },
  { mes: 'Jun', valor: 3690 },
  { mes: 'Jul', valor: 3840 },
  { mes: 'Ago', valor: 3960 },
]

export const faturamentoPrevistoMes = [
  { dia: 1, valor: 480 },
  { dia: 4, valor: 1120 },
  { dia: 8, valor: 2340 },
  { dia: 12, valor: 3580 },
  { dia: 16, valor: 4820 },
  { dia: 20, valor: 6100 },
  { dia: 24, valor: 7260 },
  { dia: 28, valor: 8400 },
  { dia: 31, valor: 9200 },
]

export const metaFaturamentoMes = 12000
export const faturamentoAtualMes = 7480
