// src/lib/schemas/aluno.ts
import { z } from 'zod';

export const alunoSchema = z.object({
  escola_id: z.string().min(1, "Escola é obrigatória"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  sexo: z.enum(['M', 'F'], { message: "Sexo deve ser M ou F" }),
  data_nasc: z.string().refine((date) => {
    const nascimento = new Date(date);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    return idade >= 3 && idade <= 18; // Faixa escolar típica
  }, "Idade deve estar entre 3 e 18 anos"),
  registro: z.string().max(12).optional(),
  cns: z.string().length(15, "CNS deve ter exatamente 15 dígitos").optional(),
  observacoes: z.string().max(500).optional()
});

export type AlunoSchema = typeof alunoSchema;
