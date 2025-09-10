// src/routes/avaliadores/+page.server.ts
import { sql } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { avaliadorSchema } from '$lib/schemas/avaliador';

export async function load() {
  // Buscando dados (como consultar um arquivo)
  const avaliadores = await sql`
    SELECT a.*, u.usf
    FROM avaliador a
    JOIN usf u ON a.usf_cnes = u.cnes
    WHERE a.ativo = true
    ORDER BY a.nome
  `;

  const usfs = await sql`
    SELECT cnes, usf FROM usf ORDER BY usf
  `;

  // Preparando formulário (como preparar um documento em branco)
  const form = await superValidate(zod(avaliadorSchema));

  return {
    avaliadores,
    usfs,
    form
  };
}

export const actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, zod(avaliadorSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await sql`
        INSERT INTO avaliador (usf_cnes, nome, cargo)
        VALUES (${form.data.usf_cnes}, ${form.data.nome}, ${form.data.cargo})
      `;
    } catch (error) {
      return fail(500, { form, error: 'Erro ao criar avaliador' });
    }

    return { form };
  }
};
