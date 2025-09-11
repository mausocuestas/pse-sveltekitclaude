// src/lib/schemas/odontologia.ts
import { z } from 'zod';

export const odontologiaFilterSchema = z.object({
  escola_id: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  risco_letra: z.enum(['todos', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  nivel_risco: z.enum(['todos', 'Baixo', 'Moderado', 'Alto', 'Muito Alto']).optional(),
  procedimentos: z.enum(['todos', 'art', 'atf', 'ambos', 'nenhum']).optional(),
  avaliador_id: z.coerce.number().optional()
});

export type OdontologiaFilterSchema = typeof odontologiaFilterSchema;
