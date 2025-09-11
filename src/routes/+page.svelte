<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import { goto } from '$app/navigation';
  import { 
    Eye, Scale, Activity, Users, School, UserCheck, 
    TrendingUp, TriangleAlert , Calendar, ChartColumn, 
    Target, Award, ClipboardList
  } from 'lucide-svelte';

  const { data } = $props();

  // Função para formatar data
  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  // Função para determinar cor do indicador
  function corIndicador(valor: number, meta: number) {
    if (valor >= meta) return 'text-green-600';
    if (valor >= meta * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Metas do sistema
  const metas = {
    cobertura: 80, // 80% dos alunos atendidos
    problemas_visuais: 15, // máximo 15% com problemas
    procedimentos_odonto: 60 // mínimo 60% com procedimentos
  };
</script>

<div class="container mx-auto p-6">
  <!-- Header Principal -->
  <div class="mb-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-2">
      Dashboard PSE
    </h1>
    <p class="text-lg text-gray-600">
      Programa de Saúde na Escola - Visão Executiva
    </p>
  </div>

  <!-- Cards de Estatísticas Principais -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
    <Card class="hover:shadow-lg transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Alunos</p>
            <p class="text-3xl font-bold text-blue-600">
              {data.estatisticasGerais.total_alunos || 0}
            </p>
          </div>
          <Users class="w-8 h-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>

    <Card class="hover:shadow-lg transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Atendimentos</p>
            <p class="text-3xl font-bold text-green-600">
              {data.estatisticasGerais.total_atendimentos || 0}
            </p>
          </div>
          <ClipboardList class="w-8 h-8 text-green-600" />
        </div>
      </CardContent>
    </Card>

    <Card class="hover:shadow-lg transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Escolas</p>
            <p class="text-3xl font-bold text-purple-600">
              {data.estatisticasGerais.total_escolas || 0}
            </p>
          </div>
          <School class="w-8 h-8 text-purple-600" />
        </div>
      </CardContent>
    </Card>

    <Card class="hover:shadow-lg transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">USFs Ativas</p>
            <p class="text-3xl font-bold text-orange-600">
              {data.estatisticasGerais.total_usfs || 0}
            </p>
          </div>
          <UserCheck class="w-8 h-8 text-orange-600" />
        </div>
      </CardContent>
    </Card>

    <Card class="hover:shadow-lg transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Avaliadores</p>
            <p class="text-3xl font-bold text-indigo-600">
              {data.estatisticasGerais.total_avaliadores_ativos || 0}
            </p>
          </div>
          <Award class="w-8 h-8 text-indigo-600" />
        </div>
      </CardContent>
    </Card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    <!-- Avaliações por Tipo -->
    <Card class="lg:col-span-2">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <ChartColumn class="w-5 h-5" />
          Avaliações Realizadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Eye class="w-5 h-5 text-blue-600" />
              <span class="font-medium">Acuidade Visual</span>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-600">
                {data.avaliacoesPorTipo.total_acuidade || 0}
              </p>
              {#if data.avaliacoesPorTipo.problemas_visuais > 0}
                <p class="text-sm text-red-600">
                  {data.avaliacoesPorTipo.problemas_visuais} com problemas
                </p>
              {/if}
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Scale class="w-5 h-5 text-purple-600" />
              <span class="font-medium">Antropometria</span>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-purple-600">
                {data.avaliacoesPorTipo.total_antropometria || 0}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Activity class="w-5 h-5 text-orange-600" />
              <span class="font-medium">Odontologia</span>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-orange-600">
                {data.avaliacoesPorTipo.total_odonto || 0}
              </p>
              {#if data.avaliacoesPorTipo.alto_risco_odonto > 0}
                <p class="text-sm text-red-600">
                  {data.avaliacoesPorTipo.alto_risco_odonto} alto risco
                </p>
              {/if}
            </div>
          </div>
        </div>

        <div class="mt-6 flex gap-2">
          <Button size="sm" onclick={() => goto('/acuidade')}>
            Ver Acuidade
          </Button>
          <Button size="sm" onclick={() => goto('/antropometria')}>
            Ver Antropometria
          </Button>
          <Button size="sm" onclick={() => goto('/odontologia')}>
            Ver Odontologia
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Indicadores de Performance -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Target class="w-5 h-5" />
          Indicadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Cobertura Geral</span>
              <span class="text-sm {corIndicador(data.indicadores.cobertura_geral, metas.cobertura)}">
                {data.indicadores.cobertura_geral || 0}%
              </span>
            </div>
            <Progress 
              value={data.indicadores.cobertura_geral || 0} 
              class="h-2"
            />
            <p class="text-xs text-gray-500 mt-1">Meta: {metas.cobertura}%</p>
          </div>

          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Problemas Visuais</span>
              <span class="text-sm {corIndicador(metas.problemas_visuais, data.indicadores.taxa_problemas_visuais)}">
                {data.indicadores.taxa_problemas_visuais || 0}%
              </span>
            </div>
            <Progress 
              value={data.indicadores.taxa_problemas_visuais || 0} 
              class="h-2"
            />
            <p class="text-xs text-gray-500 mt-1">Meta: ≤{metas.problemas_visuais}%</p>
          </div>

          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Procedimentos Odonto</span>
              <span class="text-sm {corIndicador(data.indicadores.taxa_procedimentos_odonto, metas.procedimentos_odonto)}">
                {data.indicadores.taxa_procedimentos_odonto || 0}%
              </span>
            </div>
            <Progress 
              value={data.indicadores.taxa_procedimentos_odonto || 0} 
              class="h-2"
            />
            <p class="text-xs text-gray-500 mt-1">Meta: ≥{metas.procedimentos_odonto}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Top Escolas -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5" />
          Escolas Mais Ativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#each data.escolasAtivas as escola, index}
            <div class="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div class="flex items-center gap-2">
                  <Badge variant="outline" class="text-xs">
                    #{index + 1}
                  </Badge>
                  <span class="font-medium text-sm">{escola.escola}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{escola.usf}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-blue-600">
                  {escola.total_atendimentos}
                </p>
                <p class="text-xs text-gray-500">
                  {escola.alunos_atendidos} alunos
                </p>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <!-- Alertas Prioritários -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <TriangleAlert class="w-5 h-5 text-red-600" />
          Casos Prioritários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          {#each data.alertasPrioritarios as alerta}
            <div class="flex items-start gap-3 p-3 rounded-lg border-l-4 {alerta.tipo === 'visual' ? 'border-l-blue-500 bg-blue-50' : 'border-l-red-500 bg-red-50'}">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  {#if alerta.tipo === 'visual'}
                    <Eye class="w-4 h-4 text-blue-600" />
                  {:else}
                    <Activity class="w-4 h-4 text-red-600" />
                  {/if}
                  <span class="font-medium text-sm">{alerta.aluno_nome}</span>
                </div>
                <p class="text-xs text-gray-600 mb-1">{alerta.escola}</p>
                <p class="text-xs {alerta.tipo === 'visual' ? 'text-blue-700' : 'text-red-700'}">
                  {alerta.descricao}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">
                  {formatarData(alerta.data_atendimento)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Evolução Temporal -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Calendar class="w-5 h-5" />
        Evolução dos Atendimentos (Últimos 6 Meses)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        {#each data.evolucaoMensal as mes}
          <div class="text-center p-4 rounded-lg border">
            <p class="text-xs text-gray-500 mb-2">
              {new Date(mes.mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
            </p>
            <p class="text-2xl font-bold text-blue-600 mb-2">
              {mes.total_atendimentos}
            </p>
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span>Visual:</span>
                <span class="font-medium">{mes.acuidade}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span>Antrop:</span>
                <span class="font-medium">{mes.antropometria}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span>Odonto:</span>
                <span class="font-medium">{mes.odonto}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Quick Actions -->
  <div class="mt-8 flex flex-wrap gap-4">
    <Button onclick={() => goto('/atendimentos')}>
      + Novo Atendimento
    </Button>
    <Button variant="outline" onclick={() => goto('/alunos')}>
      Gerenciar Alunos
    </Button>
    <Button variant="outline" onclick={() => goto('/avaliadores')}>
      Gerenciar Avaliadores
    </Button>
  </div>
</div>
