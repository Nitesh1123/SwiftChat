const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_3xmeoZp9IUfb@ep-broad-voice-a15pvaxn-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
  });

  try {
    await client.connect();
    console.log("Successfully connected to Neon DB via pg!");
    await client.end();
  } catch (err) {
    console.error("Failed to connect:", err);
  }
}

testConnection();
