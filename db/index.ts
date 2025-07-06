import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from "expo-sqlite";
import * as schema from '../db/schema';
import migrations from "../drizzle/migrations";


const expoDb = openDatabaseSync("sennada.db");
export const db = drizzle(expoDb, { schema });

// Run migrations
export const migrateDb = async () => {
    try {
        await migrate(db, migrations);
        console.log('Database migrated successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

// Initialize database
export const initializeDb = async () => {
    await migrateDb();
};