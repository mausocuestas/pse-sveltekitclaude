// src/routes/alunos/+page.server.ts
import { sql } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { alunoSchema } from '$lib/schemas/aluno';

export async function load({ url }) {
  // Filtro por escola (muito útil para USFs que atendem várias escolas)
  const escolaFiltro = url.searchParams.get('escola') || '';
  
  // Buscando alunos com informações da escola
  const alunos = await sql`
    SELECT 
      a.*,
      e.escola,
      e.usf_cnes,
      u.usf,
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, a.data_nasc)) as idade
    FROM aluno a
    JOIN escola e ON a.escola_id = e.id
    JOIN usf u ON e.usf_cnes = u.cnes
    ${escolaFiltro ? sql`WHERE e.id = ${escolaFiltro}` : sql``}
    ORDER BY e.escola, a.nome
  `;

  // Lista de escolas para o filtro
  const escolas = await sql`
    SELECT e.id, e.escola, u.usf
    FROM escola e
    JOIN usf u ON e.usf_cnes = u.cnes
    ORDER BY e.escola
  `;

  const form = await superValidate(zod(alunoSchema));

  return {
    alunos,
    escolas,
    escolaFiltro,
    form
  };
}

export const actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, zod(alunoSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // Verificar se registro já existe (se fornecido)
      if (form.data.registro) {
        const existeRegistro = await sql`
          SELECT id FROM aluno WHERE registro = ${form.data.registro}
        `;
        if (existeRegistro.length > 0) {
          return fail(400, { 
            form, 
            error: 'Registro já existe para outro aluno' 
          });
        }
      }

      await sql`
        INSERT INTO aluno (
          escola_id, nome, sexo, data_nasc, 
          registro, cns, observacoes
        )
        VALUES (
          ${form.data.escola_id}, 
          ${form.data.nome}, 
          ${form.data.sexo},
          ${form.data.data_nasc},
          ${form.data.registro || null},
          ${form.data.cns || null},
          ${form.data.observacoes || null}
        )
      `;
    } catch {
      return fail(500, { form, error: 'Erro ao cadastrar aluno' });
    }

    return { form };
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { error: 'ID do aluno é obrigatório' });
    }

    try {
      // Verificar se aluno tem atendimentos
      const temAtendimentos = await sql`
        SELECT id FROM atendimento WHERE aluno_id = ${id} LIMIT 1
      `;

      if (temAtendimentos.length > 0) {
        return fail(400, { 
          error: 'Não é possível excluir aluno com atendimentos registrados' 
        });
      }

      await sql`DELETE FROM aluno WHERE id = ${id}`;
    } catch {
      return fail(500, { error: 'Erro ao excluir aluno' });
    }

    return { success: true };
  }
};