declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERSION: string;
      TOKEN: string;
    }
  }
}

export {};
