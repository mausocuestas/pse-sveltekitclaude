// src/routes/acuidade/+page.server.ts
import { sql } from '$lib/server/db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { acuidadeFilterSchema } from '$lib/schemas/acuidade';

export async function load({ url }) {
  // Extrair filtros da URL
  const filtros = {
    escola_id: url.searchParams.get('escola') || '',
    data_inicio: url.searchParams.get('data_inicio') || '',
    data_fim: url.searchParams.get('data_fim') || '',
    status: url.searchParams.get('status') || 'todos',
    avaliador_id: url.searchParams.get('avaliador') || ''
  };

  // Query complexa com todos os relacionamentos
  const  whereConditions = [];
  const  queryParams = [];

  if (filtros.escola_id) {
    whereConditions.push(`e.id = $${queryParams.length + 1}`);
    queryParams.push(filtros.escola_id);
  }

  if (filtros.data_inicio) {
    whereConditions.push(`at.data_atendimento >= $${queryParams.length + 1}`);
    queryParams.push(filtros.data_inicio);
  }

  if (filtros.data_fim) {
    whereConditions.push(`at.data_atendimento <= $${queryParams.length + 1}`);
    queryParams.push(filtros.data_fim);
  }

  if (filtros.avaliador_id) {
    whereConditions.push(`av.id = $${queryParams.length + 1}`);
    queryParams.push(parseInt(filtros.avaliador_id));
  }

  const whereClause = whereConditions.length > 0 ? 
    `AND ${whereConditions.join(' AND ')}` : '';

  // Buscar dados de acuidade com filtros
  const acuidades = await sql`
    SELECT 
      ac.*,
      at.data_atendimento,
      at.observacoes_gerais,
      al.nome as aluno_nome,
      al.sexo as aluno_sexo,
      al.data_nasc as aluno_nascimento,
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc)) as aluno_idade,
      e.escola as escola_nome,
      e.id as escola_id,
      u.usf as usf_nome,
      av.nome as avaliador_nome,
      -- Classificação do problema
      CASE 
        WHEN LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6 THEN 'problema'
        WHEN ac.od IS NOT NULL OR ac.oe IS NOT NULL THEN 'normal'
        ELSE 'incompleto'
      END as status_visual
    FROM acuidade ac
    JOIN atendimento at ON ac.atendimento_id = at.id
    JOIN aluno al ON at.aluno_id = al.id
    JOIN escola e ON at.escola_id = e.id
    JOIN usf u ON e.usf_cnes = u.cnes
    JOIN avaliador av ON at.avaliador_id = av.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
    ${filtros.status !== 'todos' ? 
      sql`AND CASE 
        WHEN LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6 THEN 'problema'
        WHEN ac.od IS NOT NULL OR ac.oe IS NOT NULL THEN 'normal'
        ELSE 'incompleto'
      END = ${filtros.status}` : sql``}
    ORDER BY at.data_atendimento DESC, al.nome
  `;

  // Listas para filtros
  const [escolas, avaliadores] = await Promise.all([
    sql`
      SELECT e.id, e.escola, u.usf
      FROM escola e
      JOIN usf u ON e.usf_cnes = u.cnes
      ORDER BY e.escola
    `,
    sql`
      SELECT av.id, av.nome, u.usf
      FROM avaliador av
      JOIN usf u ON av.usf_cnes = u.cnes
      WHERE av.ativo = true
      ORDER BY av.nome
    `
  ]);

  // Estatísticas gerais
  const stats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6 THEN 1 END) as com_problema,
      COUNT(CASE WHEN ac.od_reteste IS NOT NULL OR ac.oe_reteste IS NOT NULL THEN 1 END) as retestados,
      ROUND(AVG(COALESCE(ac.od, 0)), 2) as media_od,
      ROUND(AVG(COALESCE(ac.oe, 0)), 2) as media_oe
    FROM acuidade ac
    JOIN atendimento at ON ac.atendimento_id = at.id
    JOIN escola e ON at.escola_id = e.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
  `;

  const form = await superValidate(zod(acuidadeFilterSchema));

  return {
    acuidades,
    escolas,
    avaliadores,
    filtros,
    stats: stats[0] || {
      total: 0,
      com_problema: 0,
      retestados: 0,
      media_od: 0,
      media_oe: 0
    },
    form
  };
}
