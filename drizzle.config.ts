import type { Config } from 'drizzle-kit';

export default {
    schema: './db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'expo', // <--- very important
    dbCredentials: {
        url: './sennada.db'
    }
} satisfies Config;
