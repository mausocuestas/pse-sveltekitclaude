// src/lib/schemas/atendimento.ts
import { z } from 'zod';

export const atendimentoSchema = z.object({
  aluno_id: z.coerce.number().min(1, "Aluno é obrigatório"),
  avaliador_id: z.coerce.number().min(1, "Avaliador é obrigatório"),
  escola_id: z.string().min(1, "Escola é obrigatória"),
  data_atendimento: z.string().min(1, "Data é obrigatória"),
  observacoes_gerais: z.string().max(1000).optional(),
  
  // Avaliações opcionais (nem sempre feitas no mesmo dia)
  acuidade: z.object({
    od: z.number().min(0).max(2.0).optional(),
    oe: z.number().min(0).max(2.0).optional(),
    od_reteste: z.number().min(0).max(2.0).optional(),
    oe_reteste: z.number().min(0).max(2.0).optional(),
    observacao: z.string().max(500).optional()
  }).optional(),
  
  antropometria: z.object({
    peso: z.number().min(5).max(200, "Peso deve estar entre 5kg e 200kg"),
    altura: z.number().min(0.5).max(2.5, "Altura deve estar entre 0.5m e 2.5m"),
    observacoes: z.string().max(500).optional()
  }).optional(),
  
  odonto: z.object({
    risco: z.string().regex(/^[A-G][+-]$/, "Risco deve ser formato A+ a G-"),
    art: z.boolean().optional(),
    atf: z.boolean().optional(),
    observacoes: z.string().max(500).optional()
  }).optional()
});

export type AtendimentoSchema = typeof atendimentoSchema;
