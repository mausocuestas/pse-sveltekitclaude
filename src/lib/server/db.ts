// src/lib/server/db.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

// Como um disjuntor - protege contra sobrecarga
const sql = postgres(DATABASE_URL, {
  connect_timeout: 60,        // Aguarda 60s para conectar
  idle_timeout: 30,           // Closes idle connections
  max_lifetime: 60 * 30,      // 30 minutos de vida máxima
  max: 10                     // Máximo 10 conexões simultâneas
});

export { sql };
