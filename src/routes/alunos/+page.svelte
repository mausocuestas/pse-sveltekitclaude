<!-- src/routes/alunos/+page.svelte -->
<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { alunoSchema } from '$lib/schemas/aluno';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  const { data } = $props();

  let showDialog = $state(false);
  let alunoParaExcluir = $state<any>(null);

  const { form, enhance } = superForm(data.form, {
    validators: zodClient(alunoSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        showDialog = false;
      }
    }
  });

  // Função para filtrar por escola
  function filtrarPorEscola(escolaId: string) {
    const url = new URL(page.url);
    if (escolaId) {
      url.searchParams.set('escola', escolaId);
    } else {
      url.searchParams.delete('escola');
    }
    goto(url.toString());
  }

  // Calcular idade em anos
  function calcularIdade(dataNasc: string) {
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    return hoje.getFullYear() - nascimento.getFullYear();
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Alunos Cadastrados</h1>
    <Button onclick={() => showDialog = true}>
      + Novo Aluno
    </Button>
  </div>

  <!-- Filtros -->
  <div class="mb-4 flex gap-4">
    <Select onValueChange={(value: string) => filtrarPorEscola(value || '')} type="single">
      <SelectTrigger class="w-80">
        <span>Filtrar por escola...</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Todas as escolas</SelectItem>
        {#each data.escolas as escola}
          <SelectItem value={escola.id}>
            {escola.escola} - {escola.usf}
          </SelectItem>
        {/each}
      </SelectContent>
    </Select>
  </div>

  <!-- Estatísticas rápidas -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="bg-blue-50 p-4 rounded-lg">
      <h3 class="font-semibold text-blue-800">Total de Alunos</h3>
      <p class="text-2xl font-bold text-blue-600">{data.alunos.length}</p>
    </div>
    <div class="bg-green-50 p-4 rounded-lg">
      <h3 class="font-semibold text-green-800">Meninos</h3>
      <p class="text-2xl font-bold text-green-600">
        {data.alunos.filter(a => a.sexo === 'M').length}
      </p>
    </div>
    <div class="bg-pink-50 p-4 rounded-lg">
      <h3 class="font-semibold text-pink-800">Meninas</h3>
      <p class="text-2xl font-bold text-pink-600">
        {data.alunos.filter(a => a.sexo === 'F').length}
      </p>
    </div>
  </div>

  <!-- Tabela de Alunos -->
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Escola</TableHead>
        <TableHead>Idade</TableHead>
        <TableHead>Sexo</TableHead>
        <TableHead>Registro</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each data.alunos as aluno}
        <TableRow>
          <TableCell class="font-medium">{aluno.nome}</TableCell>
          <TableCell>{aluno.escola}</TableCell>
          <TableCell>{aluno.idade} anos</TableCell>
          <TableCell>
            <span class="px-2 py-1 rounded text-xs {aluno.sexo === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}">
              {aluno.sexo === 'M' ? 'Masculino' : 'Feminino'}
            </span>
          </TableCell>
          <TableCell>{aluno.registro || '-'}</TableCell>
          <TableCell>
            <div class="flex gap-2">
              <Button variant="outline" size="sm">Editar</Button>
              <Button 
                variant="destructive" 
                size="sm"
                onclick={() => alunoParaExcluir = aluno}
              >
                Excluir
              </Button>
            </div>
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>

  <!-- Dialog para Cadastro -->
  <Dialog bind:open={showDialog}>
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
      </DialogHeader>
      
      <form method="POST" action="?/create" use:enhance class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="nome">Nome Completo *</Label>
            <Input
              id="nome"
              name="nome"
              bind:value={$form.nome}
              placeholder="Nome do aluno"
              required
            />
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
                    {escola.escola}
                  </SelectItem>
                {/each}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <Label for="sexo">Sexo *</Label>
            <Select bind:value={$form.sexo} name="sexo" required type="single">
              <SelectTrigger placeholder="Sexo" />
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label for="data_nasc">Data de Nascimento *</Label>
            <Input
              id="data_nasc"
              name="data_nasc"
              type="date"
              bind:value={$form.data_nasc}
              required
            />
          </div>
          
          <div>
            <Label for="registro">Registro Escolar</Label>
            <Input
              id="registro"
              name="registro"
              bind:value={$form.registro}
              placeholder="Matrícula"
              maxlength={12}
            />
          </div>
        </div>

        <div>
          <Label for="cns">CNS (Cartão SUS)</Label>
          <Input
            id="cns"
            name="cns"
            bind:value={$form.cns}
            placeholder="15 dígitos"
            maxlength={15}
          />
        </div>

        <div>
          <Label for="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            bind:value={$form.observacoes}
            placeholder="Informações adicionais sobre o aluno"
            maxlength={500}
          />
        </div>
        
        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onclick={() => showDialog = false}>
            Cancelar
          </Button>
          <Button type="submit">Cadastrar Aluno</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</div>
