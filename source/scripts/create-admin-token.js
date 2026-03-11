'use strict';

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function main() {
  console.log('');
  console.log('Skapa admin-token');
  console.log('─────────────────');
  console.log('');

  const rawName = await ask('Namn på admin: ');
  rl.close();

  const name = rawName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-zåäö0-9_-]/g, '');

  if (!name) {
    console.error('\nFel: namn krävs (a-ö, siffror, understreck).');
    process.exit(1);
  }

  const uuid = crypto.randomUUID();
  const token = `${name}_${uuid}`;

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`  Token: ${token}`);
  console.log('');
  console.log('  SPARA DENNA TOKEN NU — den visas inte igen.');
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('Lägg till tokenen i ADMIN_TOKENS på dessa tre ställen:');
  console.log('');
  console.log('  1. .env (lokal utveckling)');
  console.log('  2. api/.env (produktionsservern)');
  console.log('  3. GitHub → Settings → Environments → qa/production → Secrets');
  console.log('');
  console.log('Om ADMIN_TOKENS redan har värden, lägg till med komma:');
  console.log(`  ADMIN_TOKENS=befintlig-token,${token}`);
  console.log('');
  console.log(`Ge tokenen till ${rawName.trim()} — hen aktiverar den på /admin.html`);
  console.log('');
}

main();
