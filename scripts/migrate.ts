import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../app/utils/db.server';

// マイグレーションを実行
console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle/migrations' });
console.log('Migrations completed');
