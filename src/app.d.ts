// src/app.d.ts (adicione ou crie este arquivo)
declare global {
  namespace App {
    interface Locals {}
    interface PageData {}
    interface Error {}
    interface Platform {
      env: {
        DATABASE_URL: string;
      };
    }
  }
  
  // Declarando as variáveis de ambiente para o TypeScript
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

declare module '$env/static/private' {
  export const DATABASE_URL: string;
}

export {};
