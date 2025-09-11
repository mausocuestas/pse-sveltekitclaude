<!-- src/routes/odontologia/+page.svelte -->
<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Activity, TriangleAlert, Calendar, School, User, TrendingUp, Shield, Zap } from 'lucide-svelte';
  import { classificarRiscoOdonto, calcularPrioridadeAtendimento, getCorNivelRisco } from '$lib/utils/odonto-classification';

  const { data } = $props();

  // Função para aplicar filtros
  function aplicarFiltro(campo: string, valor: string) {
    const url = new URL(page.url);
    if (valor) {
      url.searchParams.set(campo, valor);
    } else {
      url.searchParams.delete(campo);
    }
    goto(url.toString());
  }

  // Função para formatar data
  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  // Calcular porcentagem
  function calcularPorcentagem(parte: number, total: number) {
    return total > 0 ? ((parte / total) * 100).toFixed(1) : '0';
  }

  // Criar distribuição por nível de risco
  function criarDistribuicaoNivel() {
    const distribuicao = {
      'Baixo': 0,
      'Moderado': 0,
      'Alto': 0,
      'Muito Alto': 0
    };

    data.odontologias.forEach(item => {
      const classificacao = classificarRiscoOdonto(item.risco);
      distribuicao[classificacao.nivel]++;
    });

    return distribuicao;
  }

  const distribuicaoNivel = criarDistribuicaoNivel();
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-2">
        <Activity class="w-8 h-8 text-orange-600" />
        Avaliações Odontológicas
      </h1>
      <p class="text-gray-600 mt-1">
        Análise de risco odontológico e procedimentos realizados
      </p>
    </div>
    <Button onclick={() => goto('/atendimentos')}>
      + Novo Atendimento
    </Button>
  </div>

  <!-- Estatísticas Principais -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Activity class="w-5 h-5 text-orange-600" />
          <div>
            <p class="text-sm text-gray-600">Total Avaliações</p>
            <p class="text-2xl font-bold">{data.stats.total}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Shield class="w-5 h-5 text-blue-600" />
          <div>
            <p class="text-sm text-gray-600">Procedimentos ART</p>
            <p class="text-2xl font-bold text-blue-600">{data.stats.total_art}</p>
            <p class="text-xs text-gray-500">
              {calcularPorcentagem(data.stats.total_art, data.stats.total)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Zap class="w-5 h-5 text-purple-600" />
          <div>
            <p class="text-sm text-gray-600">Aplicações ATF</p>
            <p class="text-2xl font-bold text-purple-600">{data.stats.total_atf}</p>
            <p class="text-xs text-gray-500">
              {calcularPorcentagem(data.stats.total_atf, data.stats.total)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TriangleAlert class="w-5 h-5 text-red-600" />
          <div>
            <p class="text-sm text-gray-600">Alto Risco</p>
            <p class="text-2xl font-bold text-red-600">
              {data.stats.alto_risco + data.stats.critico_risco}
            </p>
            <p class="text-xs text-gray-500">
              {calcularPorcentagem(data.stats.alto_risco + data.stats.critico_risco, data.stats.total)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Distribuição por Nível de Risco -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Distribuição por Nível de Risco</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each Object.entries(distribuicaoNivel) as [nivel, quantidade]}
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">{nivel}</span>
              <span class="text-sm">{quantidade}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full {getCorNivelRisco(nivel)}" 
                style="width: {calcularPorcentagem(quantidade, data.stats.total)}%"
              ></div>
            </div>
            <p class="text-xs text-gray-500">{calcularPorcentagem(quantidade, data.stats.total)}%</p>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Distribuição por Letra de Risco -->
  {#if data.estatisticasRisco.length > 0}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Distribuição por Classificação (A-G)</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-3 md:grid-cols-7 gap-4">
          {#each data.estatisticasRisco as stat}
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl font-bold border-2 {classificarRiscoOdonto(stat.letra + '+').cor}">
                {stat.letra}
              </div>
              <p class="text-lg font-semibold">{stat.total}</p>
              <p class="text-xs text-gray-500">
                {calcularPorcentagem(stat.total, data.stats.total)}%
              </p>
              {#if stat.com_art > 0 || stat.com_atf > 0}
                <div class="mt-1 space-y-1">
                  {#if stat.com_art > 0}
                    <Badge variant="outline" class="text-xs">ART: {stat.com_art}</Badge>
                  {/if}
                  {#if stat.com_atf > 0}
                    <Badge variant="outline" class="text-xs">ATF: {stat.com_atf}</Badge>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Filtros -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Calendar class="w-5 h-5" />
        Filtros de Busca
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div>
          <Label>Escola</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('escola', value || '')} type="single">
            <SelectTrigger>
              <span>Todas</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {#each data.escolas as escola}
                <SelectItem value={escola.id}>{escola.escola}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Letra Risco</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('risco_letra', value || '')} type="single">
            <SelectTrigger>
              <span>Todas</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="A">A (Baixo)</SelectItem>
              <SelectItem value="B">B (Baixo)</SelectItem>
              <SelectItem value="C">C (Moderado)</SelectItem>
              <SelectItem value="D">D (Alto)</SelectItem>
              <SelectItem value="E">E (Alto)</SelectItem>
              <SelectItem value="F">F (Crítico)</SelectItem>
              <SelectItem value="G">G (Crítico)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Nível</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('nivel_risco', value || '')} type="single">
            <SelectTrigger>
              <span>Todos</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Baixo">Baixo</SelectItem>
              <SelectItem value="Moderado">Moderado</SelectItem>
              <SelectItem value="Alto">Alto</SelectItem>
              <SelectItem value="Muito Alto">Muito Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Procedimentos</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('procedimentos', value || '')} type="single">
            <SelectTrigger>
              <span>Todos</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="art">Apenas ART</SelectItem>
              <SelectItem value="atf">Apenas ATF</SelectItem>
              <SelectItem value="ambos">ART + ATF</SelectItem>
              <SelectItem value="nenhum">Nenhum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Data Início</Label>
          <Input
            type="date"
            value={data.filtros.data_inicio}
            onchange={(e) => aplicarFiltro('data_inicio', (e.target as HTMLInputElement).value)}
          />
        </div>

        <div>
          <Label>Data Fim</Label>
          <Input
            type="date"
            value={data.filtros.data_fim}
            onchange={(e) => aplicarFiltro('data_fim', (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="flex items-end">
          <Button variant="outline" onclick={() => goto('/odontologia')}>
            Limpar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Tabela de Resultados -->
  <Card>
    <CardHeader>
      <CardTitle>Resultados das Avaliações ({data.odontologias.length} registros)</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Risco</TableHead>
            <TableHead>Classificação</TableHead>
            <TableHead>Procedimentos</TableHead>
            <TableHead>Próxima Consulta</TableHead>
            <TableHead>Avaliador</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each data.odontologias as avaliacao}
            {@const classificacao = classificarRiscoOdonto(avaliacao.risco)}
            {@const prioridade = calcularPrioridadeAtendimento(avaliacao.risco)}
            <TableRow>
              <TableCell>{formatarData(avaliacao.data_atendimento)}</TableCell>
              <TableCell>
                <div>
                  <p class="font-medium">{avaliacao.aluno_nome}</p>
                  <div class="flex gap-1 mt-1">
                    <Badge variant="outline" class="text-xs">
                      {avaliacao.aluno_idade} anos
                    </Badge>
                    <Badge variant="outline" class="text-xs {avaliacao.aluno_sexo === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}">
                      {avaliacao.aluno_sexo === 'M' ? 'M' : 'F'}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p class="text-sm font-medium">{avaliacao.escola_nome}</p>
                  <p class="text-xs text-gray-500">{avaliacao.usf_nome}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge class="text-lg font-bold {classificacao.cor}">
                  {avaliacao.risco}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <Badge class={classificacao.cor}>
                    {classificacao.nivel}
                  </Badge>
                  <p class="text-xs text-gray-600 mt-1">
                    {classificacao.descricao}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col gap-1">
                  {#if avaliacao.art}
                    <Badge variant="secondary" class="text-xs">
                      <Shield class="w-3 h-3 mr-1" />
                      ART
                    </Badge>
                  {/if}
                  {#if avaliacao.atf}
                    <Badge variant="secondary" class="text-xs">
                      <Zap class="w-3 h-3 mr-1" />
                      ATF
                    </Badge>
                  {/if}
                  {#if !avaliacao.art && !avaliacao.atf}
                    <span class="text-gray-400 text-xs">Nenhum</span>
                  {/if}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p class="text-sm font-medium">
                    {formatarData(avaliacao.proxima_consulta)}
                  </p>
                  <Badge class="text-xs {prioridade.cor}">
                    {prioridade.prioridade}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <p class="text-sm">{avaliacao.avaliador_nome}</p>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>

      {#if data.odontologias.length === 0}
        <div class="text-center py-8 text-gray-500">
          <Activity class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma avaliação odontológica encontrada</p>
          <p class="text-sm">Ajuste os filtros ou registre novos atendimentos</p>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Alertas para casos críticos -->
  {#if data.stats.critico_risco > 0}
    <Card class="mt-6 border-red-200 bg-red-50">
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TriangleAlert class="w-5 h-5 text-red-600" />
          <div>
            <h3 class="font-semibold text-red-800">Atenção: Casos Críticos Detectados</h3>
            <p class="text-sm text-red-600">
              {data.stats.critico_risco} aluno(s) apresentam risco odontológico crítico (F/G). 
              Necessário atendimento odontológico de emergência.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  {#if data.stats.alto_risco > 0}
    <Card class="mt-4 border-orange-200 bg-orange-50">
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-orange-600" />
          <div>
            <h3 class="font-semibold text-orange-800">Atenção: Casos de Alto Risco</h3>
            <p class="text-sm text-orange-600">
              {data.stats.alto_risco} aluno(s) apresentam alto risco odontológico (D/E). 
              Agendar consulta em até 3 meses.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Relatório de Procedimentos -->
  {#if data.stats.total_art > 0 || data.stats.total_atf > 0}
    <Card class="mt-4 border-blue-200 bg-blue-50">
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Shield class="w-5 h-5 text-blue-600" />
          <div>
            <h3 class="font-semibold text-blue-800">Procedimentos Realizados</h3>
            <div class="text-sm text-blue-600 mt-1">
              <p>• ART (Tratamento Restaurador Atraumático): {data.stats.total_art} casos</p>
              <p>• ATF (Aplicação Tópica de Flúor): {data.stats.total_atf} casos</p>
              <p class="mt-2 font-medium">
                Taxa de cobertura preventiva: {calcularPorcentagem(data.stats.total_art + data.stats.total_atf, data.stats.total)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
