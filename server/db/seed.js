/**
 * Seed script — drops existing tables then recreates schema and inserts demo data.
 * Run with: npm run seed   (from /server)
 */
const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./pool');

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

async function dropExistingObjects(client) {
  // Drop tables if they exist (cascade handles FKs)
  await client.query('DROP TABLE IF EXISTS field_updates CASCADE');
  await client.query('DROP TABLE IF EXISTS fields CASCADE');
  await client.query('DROP TABLE IF EXISTS users CASCADE');
  // Drop enum types
  await client.query('DROP TYPE IF EXISTS field_stage CASCADE');
  await client.query('DROP TYPE IF EXISTS user_role CASCADE');
}

async function runSchema(client) {
  const sql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  await client.query(sql);
}

async function seedUsers(client) {
  const adminHash = await bcrypt.hash('admin123', 10);
  const agentHash = await bcrypt.hash('agent123', 10);

  const { rows: [admin] } = await client.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['System Admin', 'admin@smartseason.com', adminHash, 'admin']
  );

  const { rows: [agent] } = await client.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Jane Mwangi', 'agent@smartseason.com', agentHash, 'agent']
  );

  console.log('  ✓ Users seeded — admin id:', admin.id, '| agent id:', agent.id);
  return { adminId: admin.id, agentId: agent.id };
}

async function seedFields(client, { agentId }) {
  const today = new Date();
  const daysAgo = (d) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().split('T')[0];
  };

  const fields = [
    { name: 'North Maize Block',   crop: 'Maize',    date: daysAgo(20),  stage: 'Growing',   agent: agentId },
    { name: 'South Wheat Paddock', crop: 'Wheat',    date: daysAgo(100), stage: 'Growing',   agent: agentId },
    { name: 'East Sorghum Plot',   crop: 'Sorghum',  date: daysAgo(45),  stage: 'Ready',     agent: null    },
    { name: 'West Sunflower Row',  crop: 'Sunflower', date: daysAgo(130), stage: 'Harvested', agent: agentId },
    { name: 'Central Barley Field',crop: 'Barley',   date: daysAgo(10),  stage: 'Planted',   agent: null    },
  ];

  for (const f of fields) {
    await client.query(
      `INSERT INTO fields (name, crop_type, planting_date, stage, assigned_agent_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [f.name, f.crop, f.date, f.stage, f.agent]
    );
  }

  console.log('  ✓ Fields seeded —', fields.length, 'records');
}

async function seedUpdates(client) {
  // Grab IDs inserted above
  const { rows: agentRows } = await client.query(`SELECT id FROM users WHERE role='agent' LIMIT 1`);
  const { rows: fieldRows } = await client.query(`SELECT id FROM fields LIMIT 3`);

  if (!agentRows.length || !fieldRows.length) return;

  const agentId = agentRows[0].id;
  const updates = [
    { fieldId: fieldRows[0].id, stage: 'Growing', notes: 'Germination complete, rows are visible. No pest issues observed.' },
    { fieldId: fieldRows[0].id, stage: null,       notes: 'Applied nitrogen fertilizer to boost leaf canopy growth.' },
    { fieldId: fieldRows[1].id, stage: 'Growing',  notes: 'Moderate yellowing on outer rows — possible drought stress.' },
  ];

  for (const u of updates) {
    await client.query(
      `INSERT INTO field_updates (field_id, agent_id, new_stage, notes)
       VALUES ($1, $2, $3, $4)`,
      [u.fieldId, agentId, u.stage, u.notes]
    );
  }
  console.log('  ✓ Field updates seeded —', updates.length, 'records');
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('🌱 SmartSeason — Running seed script...\n');
    await client.query('BEGIN');
    await dropExistingObjects(client);
    console.log('  ✓ Existing tables/types dropped');
    await runSchema(client);
    console.log('  ✓ Schema created');
    const { adminId, agentId } = await seedUsers(client);
    await seedFields(client, { agentId });
    await seedUpdates(client);
    await client.query('COMMIT');
    console.log('\n✅ Seed complete!\n');
    console.log('  Demo credentials:');
    console.log('    Admin → admin@smartseason.com / admin123');
    console.log('    Agent → agent@smartseason.com / agent123\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

main();
