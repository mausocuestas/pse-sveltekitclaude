// src/routes/+page.server.ts (dashboard principal)
import { sql } from '$lib/server/db';

export async function load() {
  // Estatísticas gerais consolidadas
  const estatisticasGerais = await sql`
    SELECT 
      COUNT(DISTINCT al.id) as total_alunos,
      COUNT(DISTINCT at.id) as total_atendimentos,
      COUNT(DISTINCT e.id) as total_escolas,
      COUNT(DISTINCT av.id) as total_avaliadores_ativos,
      COUNT(DISTINCT u.cnes) as total_usfs
    FROM aluno al
    LEFT JOIN atendimento at ON al.id = at.aluno_id
    LEFT JOIN escola e ON al.escola_id = e.id
    LEFT JOIN usf u ON e.usf_cnes = u.cnes
    LEFT JOIN avaliador av ON at.avaliador_id = av.id AND av.ativo = true
  `;

  // Estatísticas por tipo de avaliação
  const avaliacoesPorTipo = await sql`
    SELECT 
      COUNT(CASE WHEN ac.id IS NOT NULL THEN 1 END) as total_acuidade,
      COUNT(CASE WHEN an.id IS NOT NULL THEN 1 END) as total_antropometria,
      COUNT(CASE WHEN od.id IS NOT NULL THEN 1 END) as total_odonto,
      -- Problemas detectados
      COUNT(CASE WHEN LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6 THEN 1 END) as problemas_visuais,
      COUNT(CASE WHEN LEFT(od.risco, 1) IN ('D', 'E', 'F', 'G') THEN 1 END) as alto_risco_odonto
    FROM atendimento at
    LEFT JOIN acuidade ac ON at.id = ac.atendimento_id
    LEFT JOIN antropometria an ON at.id = an.atendimento_id
    LEFT JOIN odonto od ON at.id = od.atendimento_id
    WHERE at.data_atendimento >= CURRENT_DATE - INTERVAL '12 months'
  `;

  // Top 5 escolas com mais atendimentos
  const escolasAtivas = await sql`
    SELECT 
      e.escola,
      e.id,
      u.usf,
      COUNT(at.id) as total_atendimentos,
      COUNT(DISTINCT al.id) as alunos_atendidos
    FROM escola e
    JOIN usf u ON e.usf_cnes = u.cnes
    LEFT JOIN atendimento at ON e.id = at.escola_id
    LEFT JOIN aluno al ON at.aluno_id = al.id
    WHERE at.data_atendimento >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY e.id, e.escola, u.usf
    ORDER BY total_atendimentos DESC
    LIMIT 5
  `;

  // Evolução mensal de atendimentos (últimos 6 meses)
  const evolucaoMensal = await sql`
    SELECT 
      TO_CHAR(at.data_atendimento, 'YYYY-MM') as mes,
      COUNT(at.id) as total_atendimentos,
      COUNT(CASE WHEN ac.id IS NOT NULL THEN 1 END) as acuidade,
      COUNT(CASE WHEN an.id IS NOT NULL THEN 1 END) as antropometria,
      COUNT(CASE WHEN od.id IS NOT NULL THEN 1 END) as odonto
    FROM atendimento at
    LEFT JOIN acuidade ac ON at.id = ac.atendimento_id
    LEFT JOIN antropometria an ON at.id = an.atendimento_id
    LEFT JOIN odonto od ON at.id = od.atendimento_id
    WHERE at.data_atendimento >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY TO_CHAR(at.data_atendimento, 'YYYY-MM')
    ORDER BY mes
  `;

  // Distribuição de problemas por USF
  const problemasPorUSF = await sql`
    SELECT 
      u.usf,
      u.cnes,
      COUNT(DISTINCT at.id) as total_atendimentos,
      COUNT(CASE WHEN LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6 THEN 1 END) as problemas_visuais,
      COUNT(CASE WHEN LEFT(od.risco, 1) IN ('D', 'E', 'F', 'G') THEN 1 END) as alto_risco_odonto,
      COUNT(CASE WHEN an.id IS NOT NULL THEN 1 END) as total_antropometria
    FROM usf u
    JOIN escola e ON u.cnes = e.usf_cnes
    JOIN atendimento at ON e.id = at.escola_id
    LEFT JOIN acuidade ac ON at.id = ac.atendimento_id
    LEFT JOIN antropometria an ON at.id = an.atendimento_id
    LEFT JOIN odonto od ON at.id = od.atendimento_id
    WHERE at.data_atendimento >= CURRENT_DATE - INTERVAL '3 months'
    GROUP BY u.cnes, u.usf
    HAVING COUNT(DISTINCT at.id) > 0
    ORDER BY total_atendimentos DESC
  `;

  // Alertas e casos prioritários
  const alertasPrioritarios = await sql`
    SELECT 
      'visual' as tipo,
      al.nome as aluno_nome,
      e.escola,
      at.data_atendimento,
      'Problema visual detectado' as descricao,
      CASE WHEN ac.od <= 0.6 THEN ac.od ELSE ac.oe END as valor
    FROM atendimento at
    JOIN aluno al ON at.aluno_id = al.id
    JOIN escola e ON at.escola_id = e.id
    JOIN acuidade ac ON at.id = ac.atendimento_id
    WHERE LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6
      AND at.data_atendimento >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION ALL
    
    SELECT 
      'odonto' as tipo,
      al.nome as aluno_nome,
      e.escola,
      at.data_atendimento,
      'Risco odontológico crítico: ' || od.risco as descricao,
      NULL as valor
    FROM atendimento at
    JOIN aluno al ON at.aluno_id = al.id
    JOIN escola e ON at.escola_id = e.id
    JOIN odonto od ON at.id = od.atendimento_id
    WHERE LEFT(od.risco, 1) IN ('F', 'G')
      AND at.data_atendimento >= CURRENT_DATE - INTERVAL '30 days'
    
    ORDER BY data_atendimento DESC
    LIMIT 10
  `;

  // Metas e indicadores
  const indicadores = await sql`
    SELECT 
      -- Cobertura geral
      ROUND(
        (COUNT(DISTINCT at.aluno_id)::FLOAT / COUNT(DISTINCT al.id)) * 100, 1
      ) as cobertura_geral,
      
      -- Taxa de problemas visuais
      ROUND(
        (COUNT(CASE WHEN LEAST(COALESCE(ac.od, 2), COALESCE(ac.oe, 2)) <= 0.6 THEN 1 END)::FLOAT / 
         NULLIF(COUNT(ac.id), 0)) * 100, 1
      ) as taxa_problemas_visuais,
      
      -- Taxa de procedimentos odonto
      ROUND(
        (COUNT(CASE WHEN od.art = true OR od.atf = true THEN 1 END)::FLOAT / 
         NULLIF(COUNT(od.id), 0)) * 100, 1
      ) as taxa_procedimentos_odonto
      
    FROM aluno al
    LEFT JOIN atendimento at ON al.id = at.aluno_id
    LEFT JOIN acuidade ac ON at.id = ac.atendimento_id
    LEFT JOIN odonto od ON at.id = od.atendimento_id
  `;

  return {
    estatisticasGerais: estatisticasGerais[0] || {},
    avaliacoesPorTipo: avaliacoesPorTipo[0] || {},
    escolasAtivas,
    evolucaoMensal,
    problemasPorUSF,
    alertasPrioritarios,
    indicadores: indicadores[0] || {}
  };
}
