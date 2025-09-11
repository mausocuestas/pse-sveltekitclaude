// src/routes/odontologia/+page.server.ts
import { sql } from '$lib/server/db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { odontologiaFilterSchema } from '$lib/schemas/odontologia';

export async function load({ url }) {
  // Extrair filtros da URL
  const filtros = {
    escola_id: url.searchParams.get('escola') || '',
    data_inicio: url.searchParams.get('data_inicio') || '',
    data_fim: url.searchParams.get('data_fim') || '',
    risco_letra: url.searchParams.get('risco_letra') || 'todos',
    nivel_risco: url.searchParams.get('nivel_risco') || 'todos',
    procedimentos: url.searchParams.get('procedimentos') || 'todos',
    avaliador_id: url.searchParams.get('avaliador') || ''
  };

  // Construir condições WHERE
  const whereConditions = [];
  const queryParams = [];

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

  if (filtros.risco_letra !== 'todos') {
    whereConditions.push(`LEFT(od.risco, 1) = $${queryParams.length + 1}`);
    queryParams.push(filtros.risco_letra);
  }

  if (filtros.procedimentos === 'art') {
    whereConditions.push('od.art = true');
  } else if (filtros.procedimentos === 'atf') {
    whereConditions.push('od.atf = true');
  } else if (filtros.procedimentos === 'ambos') {
    whereConditions.push('od.art = true AND od.atf = true');
  } else if (filtros.procedimentos === 'nenhum') {
    whereConditions.push('(od.art = false OR od.art IS NULL) AND (od.atf = false OR od.atf IS NULL)');
  }

  const whereClause = whereConditions.length > 0 ? 
    `AND ${whereConditions.join(' AND ')}` : '';

  // Buscar dados odontológicos
  const odontologias = await sql`
    SELECT 
      od.*,
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
      -- Extrair letra do risco para agrupamentos
      LEFT(od.risco, 1) as risco_letra,
      -- Calcular próxima consulta baseada no risco
      CASE 
        WHEN LEFT(od.risco, 1) IN ('A', 'B') THEN at.data_atendimento + INTERVAL '1 year'
        WHEN LEFT(od.risco, 1) = 'C' THEN at.data_atendimento + INTERVAL '6 months'
        WHEN LEFT(od.risco, 1) IN ('D', 'E') THEN at.data_atendimento + INTERVAL '3 months'
        ELSE at.data_atendimento + INTERVAL '1 month'
      END as proxima_consulta
    FROM odonto od
    JOIN atendimento at ON od.atendimento_id = at.id
    JOIN aluno al ON at.aluno_id = al.id
    JOIN escola e ON at.escola_id = e.id
    JOIN usf u ON e.usf_cnes = u.cnes
    JOIN avaliador av ON at.avaliador_id = av.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
    ORDER BY 
      CASE LEFT(od.risco, 1)
        WHEN 'G' THEN 1 WHEN 'F' THEN 2 WHEN 'E' THEN 3 
        WHEN 'D' THEN 4 WHEN 'C' THEN 5 WHEN 'B' THEN 6 WHEN 'A' THEN 7
        ELSE 8
      END,
      at.data_atendimento DESC
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

  // Estatísticas por risco
  const estatisticasRisco = await sql`
    SELECT 
      LEFT(od.risco, 1) as letra,
      COUNT(*) as total,
      COUNT(CASE WHEN od.art = true THEN 1 END) as com_art,
      COUNT(CASE WHEN od.atf = true THEN 1 END) as com_atf,
      COUNT(CASE WHEN od.art = true AND od.atf = true THEN 1 END) as com_ambos
    FROM odonto od
    JOIN atendimento at ON od.atendimento_id = at.id
    JOIN escola e ON at.escola_id = e.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
    GROUP BY LEFT(od.risco, 1)
    ORDER BY LEFT(od.risco, 1)
  `;

  // Estatísticas gerais
  const stats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN od.art = true THEN 1 END) as total_art,
      COUNT(CASE WHEN od.atf = true THEN 1 END) as total_atf,
      COUNT(CASE WHEN LEFT(od.risco, 1) IN ('A', 'B') THEN 1 END) as baixo_risco,
      COUNT(CASE WHEN LEFT(od.risco, 1) = 'C' THEN 1 END) as medio_risco,
      COUNT(CASE WHEN LEFT(od.risco, 1) IN ('D', 'E') THEN 1 END) as alto_risco,
      COUNT(CASE WHEN LEFT(od.risco, 1) IN ('F', 'G') THEN 1 END) as critico_risco
    FROM odonto od
    JOIN atendimento at ON od.atendimento_id = at.id
    JOIN escola e ON at.escola_id = e.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
  `;

  const form = await superValidate(zod(odontologiaFilterSchema));

  return {
    odontologias,
    escolas,
    avaliadores,
    estatisticasRisco,
    filtros,
    stats: stats[0] || {
      total: 0,
      total_art: 0,
      total_atf: 0,
      baixo_risco: 0,
      medio_risco: 0,
      alto_risco: 0,
      critico_risco: 0
    },
    form
  };
}
