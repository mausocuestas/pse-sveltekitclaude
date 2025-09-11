// src/lib/schemas/antropometria.ts
import { z } from 'zod';

export const antropometriaFilterSchema = z.object({
  escola_id: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  categoria: z.enum(['todos', 'Abaixo', 'Saudável', 'Sobrepeso', 'Obeso', 'Obesidade grave']).optional(),
  avaliador_id: z.coerce.number().optional(),
  idade_min: z.coerce.number().optional(),
  idade_max: z.coerce.number().optional()
});

export type AntropometriaFilterSchema = typeof antropometriaFilterSchema;
