// src/lib/schemas/acuidade.ts
import { z } from 'zod';

export const acuidadeFilterSchema = z.object({
  escola_id: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  status: z.enum(['todos', 'problema', 'normal']).optional(),
  avaliador_id: z.coerce.number().optional()
});

export type AcuidadeFilterSchema = typeof acuidadeFilterSchema;

// Função para classificar acuidade
export function classificarAcuidade(od?: number, oe?: number): {
  status: 'problema' | 'normal' | 'incompleto';
  detalhes: string;
  corClass: string;
} {
  if (!od && !oe) {
    return {
      status: 'incompleto',
      detalhes: 'Avaliação incompleta',
      corClass: 'bg-gray-100 text-gray-800'
    };
  }

  const menorValor = Math.min(od || 2, oe || 2);
  
  if (menorValor <= 0.6) {
    return {
      status: 'problema',
      detalhes: `Problema visual detectado (menor valor: ${menorValor.toFixed(2)})`,
      corClass: 'bg-red-100 text-red-800'
    };
  }

  return {
    status: 'normal',
    detalhes: `Visão normal (OD: ${od?.toFixed(2) || 'N/A'}, OE: ${oe?.toFixed(2) || 'N/A'})`,
    corClass: 'bg-green-100 text-green-800'
  };
}
