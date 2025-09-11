<!-- src/routes/antropometria/+page.svelte -->
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
  import { Scale, TrendingUp, TrendingDown, Calendar, School, User } from 'lucide-svelte';
  import { calcularIMC, classificarIMC } from '$lib/utils/cdc-classification';

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

  // Calcular distribuição por categoria
  function calcularDistribuicao() {
    const categorias = {
      'Abaixo': 0,
      'Saudável': 0,
      'Sobrepeso': 0,
      'Obeso': 0,
      'Obesidade grave': 0
    };

    data.antropometrias.forEach(item => {
      const classificacao = classificarIMC(item.imc, item.aluno_idade, item.aluno_sexo);
      categorias[classificacao.categoria]++;
    });

    return categorias;
  }

  // Calcular porcentagem
  function calcularPorcentagem(parte: number, total: number) {
    return total > 0 ? ((parte / total) * 100).toFixed(1) : '0';
  }

  const distribuicao = calcularDistribuicao();
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-2">
        <Scale class="w-8 h-8 text-purple-600" />
        Avaliações Antropométricas
      </h1>
      <p class="text-gray-600 mt-1">
        Análise de peso, altura e classificação CDC por idade e sexo
      </p>
    </div>
    <Button onclick={() => goto('/atendimentos')}>
      + Novo Atendimento
    </Button>
  </div>

  <!-- Estatísticas Principais -->
  <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Scale class="w-5 h-5 text-purple-600" />
          <div>
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold">{data.stats.total}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div>
          <p class="text-sm text-gray-600">Peso Médio</p>
          <p class="text-xl font-bold">{data.stats.peso_medio}kg</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div>
          <p class="text-sm text-gray-600">Altura Média</p>
          <p class="text-xl font-bold">{data.stats.altura_media}m</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div>
          <p class="text-sm text-gray-600">IMC Médio</p>
          <p class="text-xl font-bold">{data.stats.imc_medio}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div>
          <p class="text-sm text-gray-600">Faixa Etária</p>
          <p class="text-lg font-bold">{data.stats.idade_min}-{data.stats.idade_max} anos</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-red-600" />
          <div>
            <p class="text-sm text-gray-600">Sobrepeso+</p>
            <p class="text-xl font-bold text-red-600">
              {distribuicao.Sobrepeso + distribuicao.Obeso + distribuicao['Obesidade grave']}
            </p>
            <p class="text-xs text-gray-500">
              {calcularPorcentagem(
                distribuicao.Sobrepeso + distribuicao.Obeso + distribuicao['Obesidade grave'], 
                data.stats.total
              )}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Distribuição por Categoria -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Distribuição por Classificação CDC</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-blue-800">Abaixo do Peso</span>
            <span class="text-sm">{distribuicao.Abaixo}</span>
          </div>
          <Progress value={Number(calcularPorcentagem(distribuicao.Abaixo, data.stats.total))} class="h-2" />
          <p class="text-xs text-gray-500">{calcularPorcentagem(distribuicao.Abaixo, data.stats.total)}%</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-green-800">Saudável</span>
            <span class="text-sm">{distribuicao.Saudável}</span>
          </div>
          <Progress value={Number(calcularPorcentagem(distribuicao.Saudável, data.stats.total))} class="h-2" />
          <p class="text-xs text-gray-500">{calcularPorcentagem(distribuicao.Saudável, data.stats.total)}%</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-yellow-800">Sobrepeso</span>
            <span class="text-sm">{distribuicao.Sobrepeso}</span>
          </div>
          <Progress value={Number(calcularPorcentagem(distribuicao.Sobrepeso, data.stats.total))} class="h-2" />
          <p class="text-xs text-gray-500">{calcularPorcentagem(distribuicao.Sobrepeso, data.stats.total)}%</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-red-800">Obeso</span>
            <span class="text-sm">{distribuicao.Obeso}</span>
          </div>
          <Progress value={Number(calcularPorcentagem(distribuicao.Obeso, data.stats.total))} class="h-2" />
          <p class="text-xs text-gray-500">{calcularPorcentagem(distribuicao.Obeso, data.stats.total)}%</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-red-900">Obesidade Grave</span>
            <span class="text-sm">{distribuicao['Obesidade grave']}</span>
          </div>
          <Progress value={Number(calcularPorcentagem(distribuicao['Obesidade grave'], data.stats.total))} class="h-2" />
          <p class="text-xs text-gray-500">{calcularPorcentagem(distribuicao['Obesidade grave'], data.stats.total)}%</p>
        </div>
      </div>
    </CardContent>
  </Card>

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
          <Label>Categoria</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('categoria', value || '')} type="single">
            <SelectTrigger>
              <span>Todas</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="Abaixo">Abaixo do Peso</SelectItem>
              <SelectItem value="Saudável">Saudável</SelectItem>
              <SelectItem value="Sobrepeso">Sobrepeso</SelectItem>
              <SelectItem value="Obeso">Obeso</SelectItem>
              <SelectItem value="Obesidade grave">Obesidade Grave</SelectItem>
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
          <Label>Idade Mín</Label>
          <Input
            type="number"
            min="3"
            max="18"
            value={data.filtros.idade_min}
            onchange={(e) => aplicarFiltro('idade_min', (e.target as HTMLInputElement).value)}
          />
        </div>

        <div>
          <Label>Idade Máx</Label>
          <Input
            type="number"
            min="3"
            max="18"
            value={data.filtros.idade_max}
            onchange={(e) => aplicarFiltro('idade_max', (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="flex items-end">
          <Button variant="outline" onclick={() => goto('/antropometria')}>
            Limpar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Tabela de Resultados -->
  <Card>
    <CardHeader>
      <CardTitle>Resultados das Avaliações ({data.antropometrias.length} registros)</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Peso/Altura</TableHead>
            <TableHead>IMC</TableHead>
            <TableHead>Classificação CDC</TableHead>
            <TableHead>Percentil</TableHead>
            <TableHead>Avaliador</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each data.antropometrias as avaliacao}
            {@const classificacao = classificarIMC(avaliacao.imc, avaliacao.aluno_idade, avaliacao.aluno_sexo)}
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
                      {avaliacao.aluno_sexo === 'M' ? 'Masculino' : 'Feminino'}
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
                <div class="text-sm">
                  <div>{avaliacao.peso}kg</div>
                  <div>{avaliacao.altura}m</div>
                </div>
              </TableCell>
              <TableCell>
                <span class="font-mono text-lg font-semibold">
                  {avaliacao.imc}
                </span>
              </TableCell>
              <TableCell>
                <Badge class={classificacao.corClass}>
                  {classificacao.categoria}
                </Badge>
                <p class="text-xs text-gray-500 mt-1">
                  {classificacao.descricao}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="font-mono">
                  {classificacao.percentil}
                </Badge>
              </TableCell>
              <TableCell>
                <p class="text-sm">{avaliacao.avaliador_nome}</p>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>

      {#if data.antropometrias.length === 0}
        <div class="text-center py-8 text-gray-500">
          <Scale class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma avaliação antropométrica encontrada</p>
          <p class="text-sm">Ajuste os filtros ou registre novos atendimentos</p>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Alertas para casos críticos -->
  {#if distribuicao.Obeso + distribuicao['Obesidade grave'] > 0}
    <Card class="mt-6 border-red-200 bg-red-50">
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-red-600" />
          <div>
            <h3 class="font-semibold text-red-800">Atenção: Casos de Obesidade Detectados</h3>
            <p class="text-sm text-red-600">
              {distribuicao.Obeso + distribuicao['Obesidade grave']} aluno(s) apresentam obesidade. 
              Considere encaminhamento para acompanhamento nutricional especializado.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  {#if distribuicao.Abaixo > 0}
    <Card class="mt-4 border-blue-200 bg-blue-50">
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <TrendingDown class="w-5 h-5 text-blue-600" />
          <div>
            <h3 class="font-semibold text-blue-800">Atenção: Casos Abaixo do Peso</h3>
            <p class="text-sm text-blue-600">
              {distribuicao.Abaixo} aluno(s) estão abaixo do peso esperado. 
              Avalie possível necessidade de suplementação nutricional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
