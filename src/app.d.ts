// src/app.d.ts (adicione ou crie este arquivo)
declare global {
  namespace App {
    interface Locals {}
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
  
  // Declarando as variáveis de ambiente para o TypeScript
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

export {};
