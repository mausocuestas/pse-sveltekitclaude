<!-- src/routes/acuidade/+page.svelte -->
<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Eye, TriangleAlert, CircleCheckBig, Calendar, School, User, TrendingUp } from 'lucide-svelte';
  import { classificarAcuidade } from '$lib/schemas/acuidade';

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

  // Função para calcular porcentagem
  function calcularPorcentagem(parte: number, total: number) {
    return total > 0 ? ((parte / total) * 100).toFixed(1) : '0';
  }

  // Função para determinar cor do badge de idade
  function corIdade(idade: number) {
    if (idade <= 6) return 'bg-blue-100 text-blue-800';
    if (idade <= 12) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-2">
        <Eye class="w-8 h-8 text-blue-600" />
        Avaliações de Acuidade Visual
      </h1>
      <p class="text-gray-600 mt-1">
        Análise detalhada dos testes visuais realizados nos alunos
      </p>
    </div>
    <Button onclick={() => goto('/atendimentos')}>
      + Novo Atendimento
    </Button>
  </div>

  <!-- Estatísticas Principais -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Eye class="w-5 h-5 text-blue-600" />
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
          <TriangleAlert class="w-5 h-5 text-red-600" />
          <div>
            <p class="text-sm text-gray-600">Com Problemas</p>
            <p class="text-2xl font-bold text-red-600">{data.stats.com_problema}</p>
            <p class="text-xs text-gray-500">
              {calcularPorcentagem(data.stats.com_problema, data.stats.total)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <CircleCheckBig class="w-5 h-5 text-green-600" />
          <div>
            <p class="text-sm text-gray-600">Visão Normal</p>
            <p class="text-2xl font-bold text-green-600">
              {data.stats.total - data.stats.com_problema}
            </p>
            <p class="text-xs text-gray-500">
              {calcularPorcentagem(data.stats.total - data.stats.com_problema, data.stats.total)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-orange-600" />
          <div>
            <p class="text-sm text-gray-600">Retestados</p>
            <p class="text-2xl font-bold text-orange-600">{data.stats.retestados}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div>
          <p class="text-sm text-gray-600">Médias</p>
          <p class="text-sm">
            <span class="font-semibold">OD:</span> {data.stats.media_od}
          </p>
          <p class="text-sm">
            <span class="font-semibold">OE:</span> {data.stats.media_oe}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Filtros -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Calendar class="w-5 h-5" />
        Filtros de Busca
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div>
          <Label>Escola</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('escola', value || '')} type="single">
            <SelectTrigger>
              <span>Todas as escolas</span>
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
          <Label>Status</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('status', value || '')} type="single">
            <SelectTrigger>
              <span>Todos os status</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="problema">Apenas Problemas</SelectItem>
              <SelectItem value="normal">Apenas Normal</SelectItem>
              <SelectItem value="incompleto">Incompletos</SelectItem>
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

        <div>
          <Label>Avaliador</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('avaliador', value || '')} type="single">
            <SelectTrigger>
              <span>Todos</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {#each data.avaliadores as avaliador}
                <SelectItem value={avaliador.id.toString()}>{avaliador.nome}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-end">
          <Button variant="outline" onclick={() => goto('/acuidade')}>
            Limpar Filtros
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Tabela de Resultados -->
  <Card>
    <CardHeader>
      <CardTitle>Resultados das Avaliações ({data.acuidades.length} registros)</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Olho Direito</TableHead>
            <TableHead>Olho Esquerdo</TableHead>
            <TableHead>Reteste</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Avaliador</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each data.acuidades as avaliacao}
            {@const classificacao = classificarAcuidade(avaliacao.od, avaliacao.oe)}
            <TableRow>
              <TableCell>{formatarData(avaliacao.data_atendimento)}</TableCell>
              <TableCell>
                <div>
                  <p class="font-medium">{avaliacao.aluno_nome}</p>
                  <div class="flex gap-1 mt-1">
                    <Badge variant="outline" class="text-xs {corIdade(avaliacao.aluno_idade)}">
                      {avaliacao.aluno_idade} anos
                    </Badge>
                    <Badge variant="outline" class="text-xs">
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
                <span class="font-mono text-sm">
                  {avaliacao.od ? avaliacao.od.toFixed(2) : '-'}
                </span>
              </TableCell>
              <TableCell>
                <span class="font-mono text-sm">
                  {avaliacao.oe ? avaliacao.oe.toFixed(2) : '-'}
                </span>
              </TableCell>
              <TableCell>
                {#if avaliacao.od_reteste || avaliacao.oe_reteste}
                  <div class="text-xs">
                    {#if avaliacao.od_reteste}
                      <div>OD: {avaliacao.od_reteste.toFixed(2)}</div>
                    {/if}
                    {#if avaliacao.oe_reteste}
                      <div>OE: {avaliacao.oe_reteste.toFixed(2)}</div>
                    {/if}
                  </div>
                {:else}
                  <span class="text-gray-400">-</span>
                {/if}
              </TableCell>
              <TableCell>
                <Badge class={classificacao.corClass}>
                  {#if classificacao.status === 'problema'}
                    <TriangleAlert class="w-3 h-3 mr-1" />
                    Problema
                  {:else if classificacao.status === 'normal'}
                    <CircleCheckBig class="w-3 h-3 mr-1" />
                    Normal
                  {:else}
                    <Eye class="w-3 h-3 mr-1" />
                    Incompleto
                  {/if}
                </Badge>
              </TableCell>
              <TableCell>
                <p class="text-sm">{avaliacao.avaliador_nome}</p>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>

      {#if data.acuidades.length === 0}
        <div class="text-center py-8 text-gray-500">
          <Eye class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma avaliação de acuidade encontrada</p>
          <p class="text-sm">Ajuste os filtros ou registre novos atendimentos</p>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
