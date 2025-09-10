// src/lib/schemas/avaliador.ts
import { z } from 'zod';

export const avaliadorSchema = z.object({
  usf_cnes: z.string().min(7).max(7),
  nome: z.string().min(2).max(255),
  cargo: z.string().max(50).optional()
});

export type AvaliadorSchema = typeof avaliadorSchema;
