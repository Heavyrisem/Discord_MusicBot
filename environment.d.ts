declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            TEST_TOKEN: string;
            NODE_ENV: 'prod' | 'dev';
        }
    }
}

export {};
