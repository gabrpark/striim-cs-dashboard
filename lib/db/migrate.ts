import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
	const sql = neon(process.env.POSTGRES_URL!);

	try {
		// Read and execute the migration file
		const migrationPath = path.join(__dirname, 'migrations', '001_create_users_table.sql');
		const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

		await sql(migrationSQL);
		console.log('Migration completed successfully');
	} catch (error) {
		console.error('Error running migration:', error);
		process.exit(1);
	}
}

runMigrations(); 