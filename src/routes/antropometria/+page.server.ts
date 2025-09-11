// src/routes/antropometria/+page.server.ts
import { sql } from '$lib/server/db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { antropometriaFilterSchema } from '$lib/schemas/antropometria';

export async function load({ url }) {
  // Extrair filtros da URL
  const filtros = {
    escola_id: url.searchParams.get('escola') || '',
    data_inicio: url.searchParams.get('data_inicio') || '',
    data_fim: url.searchParams.get('data_fim') || '',
    categoria: url.searchParams.get('categoria') || 'todos',
    avaliador_id: url.searchParams.get('avaliador') || '',
    idade_min: url.searchParams.get('idade_min') || '',
    idade_max: url.searchParams.get('idade_max') || ''
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

  if (filtros.idade_min) {
    whereConditions.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc)) >= $${queryParams.length + 1}`);
    queryParams.push(parseInt(filtros.idade_min));
  }

  if (filtros.idade_max) {
    whereConditions.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc)) <= $${queryParams.length + 1}`);
    queryParams.push(parseInt(filtros.idade_max));
  }

  const whereClause = whereConditions.length > 0 ? 
    `AND ${whereConditions.join(' AND ')}` : '';

  // Buscar dados antropométricos
  const antropometrias = await sql`
    SELECT 
      an.*,
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
      -- Calcular IMC
      ROUND((an.peso / (an.altura * an.altura))::numeric, 2) as imc
    FROM antropometria an
    JOIN atendimento at ON an.atendimento_id = at.id
    JOIN aluno al ON at.aluno_id = al.id
    JOIN escola e ON at.escola_id = e.id
    JOIN usf u ON e.usf_cnes = u.cnes
    JOIN avaliador av ON at.avaliador_id = av.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
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
      ROUND(AVG(an.peso), 1) as peso_medio,
      ROUND(AVG(an.altura), 2) as altura_media,
      ROUND(AVG(an.peso / (an.altura * an.altura)), 2) as imc_medio,
      MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc))) as idade_min,
      MAX(EXTRACT(YEAR FROM AGE(CURRENT_DATE, al.data_nasc))) as idade_max
    FROM antropometria an
    JOIN atendimento at ON an.atendimento_id = at.id
    JOIN aluno al ON at.aluno_id = al.id
    JOIN escola e ON at.escola_id = e.id
    WHERE 1=1 ${sql.unsafe(whereClause)}
  `;

  const form = await superValidate(zod(antropometriaFilterSchema));

  return {
    antropometrias,
    escolas,
    avaliadores,
    filtros,
    stats: stats[0] || {
      total: 0,
      peso_medio: 0,
      altura_media: 0,
      imc_medio: 0,
      idade_min: 0,
      idade_max: 0
    },
    form
  };
}
