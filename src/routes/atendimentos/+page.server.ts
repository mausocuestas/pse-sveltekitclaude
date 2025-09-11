// src/routes/atendimentos/+page.server.ts
import { sql } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { atendimentoSchema } from '$lib/schemas/atendimento';

export async function load({ url }) {
  // Filtros úteis para USFs
  const escolaFiltro = url.searchParams.get('escola') || '';
  const dataFiltro = url.searchParams.get('data') || '';
  const avaliadorFiltro = url.searchParams.get('avaliador') || '';
  
  // Buscar atendimentos com todos os relacionamentos
  const atendimentos = await sql`
    SELECT 
      at.*,
      al.nome as aluno_nome,
      al.sexo as aluno_sexo,
      al.data_nasc as aluno_nascimento,
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc)) as aluno_idade,
      av.nome as avaliador_nome,
      e.escola as escola_nome,
      u.usf as usf_nome,
      -- Flags para mostrar quais avaliações foram feitas
      CASE WHEN ac.id IS NOT NULL THEN true ELSE false END as tem_acuidade,
      CASE WHEN an.id IS NOT NULL THEN true ELSE false END as tem_antropometria,
      CASE WHEN od.id IS NOT NULL THEN true ELSE false END as tem_odonto,
      -- Dados das avaliações
      ac.od, ac.oe, ac.observacao as acuidade_obs,
      an.peso, an.altura, an.observacoes as antropometria_obs,
      od.risco, od.art, od.atf, od.observacoes as odonto_obs
    FROM atendimento at
    JOIN aluno al ON at.aluno_id = al.id
    JOIN avaliador av ON at.avaliador_id = av.id
    JOIN escola e ON at.escola_id = e.id
    JOIN usf u ON e.usf_cnes = u.cnes
    LEFT JOIN acuidade ac ON at.id = ac.atendimento_id
    LEFT JOIN antropometria an ON at.id = an.atendimento_id
    LEFT JOIN odonto od ON at.id = od.atendimento_id
    WHERE 1=1
    ${escolaFiltro ? sql`AND e.id = ${escolaFiltro}` : sql``}
    ${dataFiltro ? sql`AND at.data_atendimento >= ${dataFiltro}` : sql``}
    ${avaliadorFiltro ? sql`AND av.id = ${parseInt(avaliadorFiltro)}` : sql``}
    ORDER BY at.data_atendimento DESC, al.nome
  `;

  // Listas para os selects do formulário
  const [alunos, avaliadores, escolas] = await Promise.all([
    sql`
      SELECT al.id, al.nome, e.escola, al.sexo,
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc)) as idade
      FROM aluno al
      JOIN escola e ON al.escola_id = e.id
      ORDER BY al.nome
    `,
    sql`
      SELECT av.id, av.nome, u.usf
      FROM avaliador av
      JOIN usf u ON av.usf_cnes = u.cnes
      WHERE av.ativo = true
      ORDER BY av.nome
    `,
    sql`
      SELECT e.id, e.escola, u.usf
      FROM escola e
      JOIN usf u ON e.usf_cnes = u.cnes
      ORDER BY e.escola
    `
  ]);

  const form = await superValidate(zod(atendimentoSchema));

  return {
    atendimentos,
    alunos,
    avaliadores,
    escolas,
    filtros: { escolaFiltro, dataFiltro, avaliadorFiltro },
    form
  };
}

export const actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, zod(atendimentoSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // Iniciar transação - tudo ou nada!
      await sql.begin(async sql => {
        // 1. Criar o atendimento principal
        const [atendimento] = await sql`
          INSERT INTO atendimento (
            aluno_id, avaliador_id, escola_id, 
            data_atendimento, observacoes_gerais
          )
          VALUES (
            ${form.data.aluno_id},
            ${form.data.avaliador_id},
            ${form.data.escola_id},
            ${form.data.data_atendimento},
            ${form.data.observacoes_gerais || null}
          )
          RETURNING id
        `;

        const atendimentoId = atendimento.id;

        // 2. Adicionar acuidade se fornecida
        if (form.data.acuidade && (form.data.acuidade.od || form.data.acuidade.oe)) {
          await sql`
            INSERT INTO acuidade (
              atendimento_id, od, oe, od_reteste, oe_reteste, observacao
            )
            VALUES (
              ${atendimentoId},
              ${form.data.acuidade.od || null},
              ${form.data.acuidade.oe || null},
              ${form.data.acuidade.od_reteste || null},
              ${form.data.acuidade.oe_reteste || null},
              ${form.data.acuidade.observacao || null}
            )
          `;
        }

        // 3. Adicionar antropometria se fornecida
        if (form.data.antropometria && form.data.antropometria.peso && form.data.antropometria.altura) {
          await sql`
            INSERT INTO antropometria (
              atendimento_id, peso, altura, observacoes
            )
            VALUES (
              ${atendimentoId},
              ${form.data.antropometria.peso},
              ${form.data.antropometria.altura},
              ${form.data.antropometria.observacoes || null}
            )
          `;
        }

        // 4. Adicionar odonto se fornecida
        if (form.data.odonto && form.data.odonto.risco) {
          await sql`
            INSERT INTO odonto (
              atendimento_id, risco, art, atf, observacoes
            )
            VALUES (
              ${atendimentoId},
              ${form.data.odonto.risco},
              ${form.data.odonto.art || false},
              ${form.data.odonto.atf || false},
              ${form.data.odonto.observacoes || null}
            )
          `;
        }
      });

    } catch {
      return fail(500, { form, error: 'Erro ao registrar atendimento' });
    }

    return { form };
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { error: 'ID do atendimento é obrigatório' });
    }

    try {
      // O CASCADE vai deletar automaticamente as avaliações relacionadas
      await sql`DELETE FROM atendimento WHERE id = ${id}`;
    } catch {
      return fail(500, { error: 'Erro ao excluir atendimento' });
    }

    return { success: true };
  }
};
