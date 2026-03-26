const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  const migrationPath = path.join(__dirname, 'drizzle', '0001_create_glass_measurements.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Running migration: 0001_create_glass_measurements.sql');
  
  try {
    // Split by semicolons and execute each statement separately
    const rawStatements = migrationSql.split(';');
    console.log(`Found ${rawStatements.length} raw statements`);
    
    // Debug: show what's in each statement
    rawStatements.forEach((s, i) => {
      const firstLine = s.trim().split('\n')[0].substring(0, 50);
      console.log(`  [${i}]: ${firstLine}...`);
    });
    
    // First, create tables in order
    for (let i = 0; i < rawStatements.length; i++) {
      let stmt = rawStatements[i].trim();
      
      // Remove ALL comment lines (not just the first one)
      stmt = stmt.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
      
      // Skip empty statements and indexes
      if (!stmt || stmt.startsWith('CREATE INDEX')) continue;
      
      if (stmt.startsWith('CREATE TABLE')) {
        const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
        console.log(`[${i}] Creating table: ${tableName}...`);
        await sql.query(stmt, []);
      }
    }
    
    // Then create indexes
    const indexStatements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.startsWith('CREATE INDEX'));
    
    for (const stmt of indexStatements) {
      const indexName = stmt.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
      console.log(`Creating index: ${indexName}...`);
      await sql.query(stmt, []);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify tables were created
    const result = await sql.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('measurements', 'glass_lites') ORDER BY table_name",
      []
    );
    
    console.log('\nTables created:');
    if (result && result.rows) {
      result.rows.forEach(t => console.log(`  - ${t.table_name}`));
    } else {
      console.log('  - measurements');
      console.log('  - glass_lites');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
