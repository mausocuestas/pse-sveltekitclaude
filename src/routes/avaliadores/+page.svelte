<!-- src/routes/avaliadores/+page.svelte -->
<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { avaliadorSchema } from '$lib/schemas/avaliador';

  const { data } = $props();

  let showDialog = $state(false);

  const { form, enhance } = superForm(data.form, {
    validators: zodClient(avaliadorSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        showDialog = false;
      }
    }
  });
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Avaliadores</h1>
    <Button onclick={() => showDialog = true}>
      + Novo Avaliador
    </Button>
  </div>

  <!-- Tabela (como uma agenda organizada) -->
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>USF</TableHead>
        <TableHead>Cargo</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each data.avaliadores as avaliador}
        <TableRow>
          <TableCell>{avaliador.nome}</TableCell>
          <TableCell>{avaliador.usf}</TableCell>
          <TableCell>{avaliador.cargo || '-'}</TableCell>
          <TableCell>
            <Button variant="outline" size="sm">Editar</Button>
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>

  <!-- Dialog Modal (como uma janela pop-up organizada) -->
  <Dialog bind:open={showDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo Avaliador</DialogTitle>
      </DialogHeader>
      
      <form method="POST" action="?/create" use:enhance>
        <div class="grid gap-4 py-4">
          <div>
            <label for="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              bind:value={$form.nome}
              class="input"
              required
            />
          </div>
          
          <div>
            <label for="usf_cnes">USF</label>
            <select id="usf_cnes" name="usf_cnes" bind:value={$form.usf_cnes} required>
              <option value="">Selecione uma USF</option>
              {#each data.usfs as usf}
                <option value={usf.cnes}>{usf.usf}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label for="cargo">Cargo</label>
            <input
              id="cargo"
              name="cargo"
              bind:value={$form.cargo}
              class="input"
            />
          </div>
        </div>
        
        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" onclick={() => showDialog = false}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</div>
