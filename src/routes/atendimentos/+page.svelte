<!-- src/routes/atendimentos/+page.svelte -->
<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { atendimentoSchema } from '$lib/schemas/atendimento';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Eye, Scale, Activity, Calendar, User, School } from 'lucide-svelte';

  const { data } = $props();

  let showDialog = $state(false);
  let atendimentoParaExcluir = $state<any>(null);
  let abaAtiva = $state('geral'); // geral, acuidade, antropometria, odonto

  const { form, enhance } = superForm(data.form, {
    validators: zodClient(atendimentoSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        showDialog = false;
        abaAtiva = 'geral';
      }
    }
  });

  // Funções de filtro
  function aplicarFiltro(tipo: string, valor: string) {
    const url = new URL(page.url);
    if (valor) {
      url.searchParams.set(tipo, valor);
    } else {
      url.searchParams.delete(tipo);
    }
    goto(url.toString());
  }

  // Calcular IMC e classificação
  function calcularIMC(peso: number, altura: number) {
    return peso / (altura * altura);
  }

  function classificarAcuidade(od: number, oe: number) {
    const menorValor = Math.min(od || 1, oe || 1);
    return menorValor <= 0.6 ? 'Problema' : 'Normal';
  }

  // Função para mostrar data formatada
  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  // Navegação entre abas
  function irParaAba(novaAba: string) {
    abaAtiva = novaAba;
  }

  function abaAnterior() {
    const abas = ['geral', 'acuidade', 'antropometria', 'odonto'];
    const indiceAtual = abas.indexOf(abaAtiva);
    if (indiceAtual > 0) abaAtiva = abas[indiceAtual - 1];
  }

  function proximaAba() {
    const abas = ['geral', 'acuidade', 'antropometria', 'odonto'];
    const indiceAtual = abas.indexOf(abaAtiva);
    if (indiceAtual < abas.length - 1) abaAtiva = abas[indiceAtual + 1];
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Atendimentos Realizados</h1>
    <Button onclick={() => showDialog = true}>
      + Novo Atendimento
    </Button>
  </div>

  <!-- Filtros -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Calendar class="w-5 h-5" />
        Filtros
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Data (a partir de)</Label>
          <Input
            type="date"
            value={data.filtros.dataFiltro}
            onchange={(e) => aplicarFiltro('data', (e.target as HTMLInputElement).value)}
          />
        </div>
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
          <Label>Avaliador</Label>
          <Select onValueChange={(value: string) => aplicarFiltro('avaliador', value || '')} type="single">
            <SelectTrigger>
              <span>Todos os avaliadores</span>
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
          <Button variant="outline" onclick={() => goto(window.location.pathname)}>
            Limpar Filtros
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Estatísticas rápidas -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <User class="w-5 h-5 text-blue-600" />
          <div>
            <p class="text-sm text-gray-600">Total Atendimentos</p>
            <p class="text-2xl font-bold">{data.atendimentos.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Eye class="w-5 h-5 text-green-600" />
          <div>
            <p class="text-sm text-gray-600">Com Acuidade</p>
            <p class="text-2xl font-bold">
              {data.atendimentos.filter(a => a.tem_acuidade).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Scale class="w-5 h-5 text-purple-600" />
          <div>
            <p class="text-sm text-gray-600">Com Antropometria</p>
            <p class="text-2xl font-bold">
              {data.atendimentos.filter(a => a.tem_antropometria).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Activity class="w-5 h-5 text-orange-600" />
          <div>
            <p class="text-sm text-gray-600">Com Odonto</p>
            <p class="text-2xl font-bold">
              {data.atendimentos.filter(a => a.tem_odonto).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Tabela de Atendimentos -->
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Aluno</TableHead>
          <TableHead>Escola</TableHead>
          <TableHead>Avaliador</TableHead>
          <TableHead>Avaliações</TableHead>
          <TableHead>Resultados</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each data.atendimentos as atendimento}
          <TableRow>
            <TableCell>{formatarData(atendimento.data_atendimento)}</TableCell>
            <TableCell>
              <div>
                <p class="font-medium">{atendimento.aluno_nome}</p>
                <p class="text-sm text-gray-500">
                  {atendimento.aluno_idade} anos, {atendimento.aluno_sexo === 'M' ? 'Masculino' : 'Feminino'}
                </p>
              </div>
            </TableCell>
            <TableCell>{atendimento.escola_nome}</TableCell>
            <TableCell>{atendimento.avaliador_nome}</TableCell>
            <TableCell>
              <div class="flex gap-1">
                {#if atendimento.tem_acuidade}
                  <Badge variant="secondary" class="text-xs">
                    <Eye class="w-3 h-3 mr-1" />
                    Visual
                  </Badge>
                {/if}
                {#if atendimento.tem_antropometria}
                  <Badge variant="secondary" class="text-xs">
                    <Scale class="w-3 h-3 mr-1" />
                    Antrop.
                  </Badge>
                {/if}
                {#if atendimento.tem_odonto}
                  <Badge variant="secondary" class="text-xs">
                    <Activity class="w-3 h-3 mr-1" />
                    Odonto
                  </Badge>
                {/if}
              </div>
            </TableCell>
            <TableCell>
              <div class="text-xs space-y-1">
                {#if atendimento.tem_acuidade}
                  <div class="flex items-center gap-1">
                    <Eye class="w-3 h-3" />
                    <span class="px-1 rounded text-xs {classificarAcuidade(atendimento.od, atendimento.oe) === 'Problema' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                      {classificarAcuidade(atendimento.od, atendimento.oe)}
                    </span>
                  </div>
                {/if}
                {#if atendimento.tem_antropometria}
                  <div class="flex items-center gap-1">
                    <Scale class="w-3 h-3" />
                    <span>IMC: {calcularIMC(atendimento.peso, atendimento.altura).toFixed(1)}</span>
                  </div>
                {/if}
                {#if atendimento.tem_odonto}
                  <div class="flex items-center gap-1">
                    <Activity class="w-3 h-3" />
                    <Badge variant="outline" class="text-xs">
                      {atendimento.risco}
                    </Badge>
                  </div>
                {/if}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex gap-2">
                <Button variant="outline" size="sm">Editar</Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onclick={() => atendimentoParaExcluir = atendimento}
                >
                  Excluir
                </Button>
              </div>
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </Card>

  <!-- Dialog para Novo Atendimento -->
  <Dialog bind:open={showDialog}>
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Registrar Novo Atendimento</DialogTitle>
      </DialogHeader>
      
      <form method="POST" action="?/create" use:enhance class="space-y-6">
        <!-- Navegação por abas -->
        <div class="flex border-b">
          <button
            type="button"
            class="px-4 py-2 {abaAtiva === 'geral' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}"
            onclick={() => irParaAba('geral')}
          >
            <User class="w-4 h-4 inline mr-2" />
            Dados Gerais
          </button>
          <button
            type="button"
            class="px-4 py-2 {abaAtiva === 'acuidade' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}"
            onclick={() => irParaAba('acuidade')}
          >
            <Eye class="w-4 h-4 inline mr-2" />
            Acuidade Visual
          </button>
          <button
            type="button"
            class="px-4 py-2 {abaAtiva === 'antropometria' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}"
            onclick={() => irParaAba('antropometria')}
          >
            <Scale class="w-4 h-4 inline mr-2" />
            Antropometria
          </button>
          <button
            type="button"
            class="px-4 py-2 {abaAtiva === 'odonto' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}"
            onclick={() => irParaAba('odonto')}
          >
            <Activity class="w-4 h-4 inline mr-2" />
            Odontologia
          </button>
        </div>

        <!-- Aba Dados Gerais -->
        {#if abaAtiva === 'geral'}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="aluno_id">Aluno *</Label>
              <Select bind:value={$form.aluno_id} name="aluno_id" required type="single">
                <SelectTrigger>
                  <span>Selecione o aluno</span>
                </SelectTrigger>
                <SelectContent>
                  {#each data.alunos as aluno}
                    <SelectItem value={aluno.id}>
                      {aluno.nome} - {aluno.escola} ({aluno.idade} anos)
                    </SelectItem>
                  {/each}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label for="avaliador_id">Avaliador *</Label>
              <Select bind:value={$form.avaliador_id} name="avaliador_id" required type="single">
                <SelectTrigger>
                  <span>Selecione o avaliador</span>
                </SelectTrigger>
                <SelectContent>
                  {#each data.avaliadores as avaliador}
                    <SelectItem value={avaliador.id}>
                      {avaliador.nome} - {avaliador.usf}
                    </SelectItem>
                  {/each}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label for="escola_id">Escola *</Label>
              <Select bind:value={$form.escola_id} name="escola_id" required type="single">
                <SelectTrigger>
                  <span>Selecione a escola</span>
                </SelectTrigger>
                <SelectContent>
                  {#each data.escolas as escola}
                    <SelectItem value={escola.id}>
                      {escola.escola} - {escola.usf}
                    </SelectItem>
                  {/each}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label for="data_atendimento">Data do Atendimento *</Label>
              <Input
                id="data_atendimento"
                name="data_atendimento"
                type="date"
                bind:value={$form.data_atendimento}
                required
              />
            </div>
          </div>
          
          <div>
            <Label for="observacoes_gerais">Observações Gerais</Label>
            <Textarea
              id="observacoes_gerais"
              name="observacoes_gerais"
              bind:value={$form.observacoes_gerais}
              placeholder="Observações sobre o atendimento em geral"
              maxlength={1000}
            />
          </div>
        {/if}

        <!-- Aba Acuidade Visual -->
        {#if abaAtiva === 'acuidade'}
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-800 mb-2">Avaliação de Acuidade Visual</h4>
              <p class="text-sm text-blue-600">
                Valores ≤ 0.60 em qualquer olho indicam problema visual
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="acuidade_od">Olho Direito (OD)</Label>
                <Input
                  id="acuidade_od"
                  name="acuidade.od"
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  bind:value={$form.acuidade.od}
                  placeholder="Ex: 1.00"
                />
              </div>
              
              <div>
                <Label for="acuidade_oe">Olho Esquerdo (OE)</Label>
                <Input
                  id="acuidade_oe"
                  name="acuidade.oe"
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  bind:value={$form.acuidade?.oe}
                  placeholder="Ex: 1.00"
                />
              </div>
              
              <div>
                <Label for="acuidade_od_reteste">OD Reteste (se necessário)</Label>
                <Input
                  id="acuidade_od_reteste"
                  name="acuidade.od_reteste"
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  bind:value={$form.acuidade?.od_reteste}
                />
              </div>
              
              <div>
                <Label for="acuidade_oe_reteste">OE Reteste (se necessário)</Label>
                <Input
                  id="acuidade_oe_reteste"
                  name="acuidade.oe_reteste"
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  bind:value={$form.acuidade?.oe_reteste}
                />
              </div>
            </div>
            
            <div>
              <Label for="acuidade_observacao">Observações</Label>
              <Textarea
                id="acuidade_observacao"
                name="acuidade.observacao"
                bind:value={$form.acuidade?.observacao}
                placeholder="Observações sobre a avaliação visual"
                maxlength={500}
              />
            </div>
          </div>
        {/if}

        <!-- Aba Antropometria -->
        {#if abaAtiva === 'antropometria'}
          <div class="space-y-4">
            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-semibold text-purple-800 mb-2">Avaliação Antropométrica</h4>
              <p class="text-sm text-purple-600">
                Será calculado o IMC e classificação segundo critérios CDC para crianças
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  name="antropometria.peso"
                  type="number"
                  step="0.1"
                  min="5"
                  max="200"
                  bind:value={$form.antropometria?.peso}
                  placeholder="Ex: 45.5"
                />
              </div>
              
              <div>
                <Label for="altura">Altura (m) *</Label>
                <Input
                  id="altura"
                  name="antropometria.altura"
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.5"
                  bind:value={$form.antropometria?.altura}
                  placeholder="Ex: 1.45"
                />
              </div>
            </div>
            
            <!-- Mostrar IMC em tempo real -->
            {#if $form.antropometria?.peso && $form.antropometria?.altura}
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm">
                  <strong>IMC Calculado:</strong> 
                  {calcularIMC($form.antropometria.peso, $form.antropometria.altura).toFixed(2)}
                </p>
              </div>
            {/if}
            
            <div>
              <Label for="antropometria_observacoes">Observações</Label>
              <Textarea
                id="antropometria_observacoes"
                name="antropometria.observacoes"
                bind:value={$form.antropometria?.observacoes}
                placeholder="Observações sobre medidas antropométricas"
                maxlength={500}
              />
            </div>
          </div>
        {/if}

        <!-- Aba Odontologia -->
        {#if abaAtiva === 'odonto'}
          <div class="space-y-4">
            <div class="bg-orange-50 p-4 rounded-lg">
              <h4 class="font-semibold text-orange-800 mb-2">Avaliação Odontológica</h4>
              <p class="text-sm text-orange-600">
                Classificação de risco: A+ (menor risco) até G- (maior risco)
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="risco">Classificação de Risco *</Label>
                <Select bind:value={$form.odonto?.risco} name="odonto.risco" type="single">
                  <SelectTrigger>
                    <span>Selecione o risco</span>
                  </SelectTrigger>
                  <SelectContent>
                    {#each ['A+', 'A-', 'B+', 'B-', 'C+', 'C-', 'D+', 'D-', 'E+', 'E-', 'F+', 'F-', 'G+', 'G-'] as risco}
                      <SelectItem value={risco}>{risco}</SelectItem>
                    {/each}
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="art" 
                    name="odonto.art"
                    bind:checked={$form.odonto?.art}
                  />
                  <Label for="art">ART (Tratamento Restaurador Atraumático)</Label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="atf" 
                    name="odonto.atf"
                    bind:checked={$form.odonto?.atf}
                  />
                  <Label for="atf">ATF (Aplicação Tópica de Flúor)</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label for="odonto_observacoes">Observações</Label>
              <Textarea
                id="odonto_observacoes"
                name="odonto.observacoes"
                bind:value={$form.odonto?.observacoes}
                placeholder="Observações sobre a avaliação odontológica"
                maxlength={500}
              />
            </div>
          </div>
        {/if}
        
        <!-- Botões de ação -->
        <div class="flex justify-between pt-4 border-t">
          <div class="flex gap-2">
            {#if abaAtiva !== 'geral'}
              <Button 
                type="button" 
                variant="outline"
                onclick={abaAnterior}
              >
                ← Anterior
              </Button>
            {/if}
            
            {#if abaAtiva !== 'odonto'}
              <Button 
                type="button" 
                variant="outline"
                onclick={proximaAba}
              >
                Próximo →
              </Button>
            {/if}
          </div>
          
          <div class="flex gap-2">
            <Button type="button" variant="outline" onclick={() => showDialog = false}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Atendimento
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Dialog de confirmação para exclusão -->
  {#if atendimentoParaExcluir}
    <Dialog open={true} onOpenChange={() => atendimentoParaExcluir = null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
        </DialogHeader>
        
        <div class="py-4">
          <p>Tem certeza que deseja excluir o atendimento de:</p>
          <p class="font-semibold mt-2">
            {atendimentoParaExcluir.aluno_nome} - {formatarData(atendimentoParaExcluir.data_atendimento)}
          </p>
          <p class="text-sm text-red-600 mt-2">
            ⚠️ Esta ação não pode ser desfeita e removerá todas as avaliações relacionadas.
          </p>
        </div>
        
        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" onclick={() => atendimentoParaExcluir = null}>
            Cancelar
          </Button>
          <form method="POST" action="?/delete" use:enhance>
            <input type="hidden" name="id" value={atendimentoParaExcluir.id} />
            <Button type="submit" variant="destructive">
              Confirmar Exclusão
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  {/if}
</div>
