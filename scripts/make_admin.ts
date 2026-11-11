import { db, schema } from '../src/core/db';
import { eq } from 'drizzle-orm';

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log('\n📋 Current registered users:');
    const users = await db.select().from(schema.user);
    if (users.length === 0) {
      console.log('   (No users found yet. Register on the website first!)');
    } else {
      users.forEach((u) => {
        console.log(`   - ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Plan: ${u.plan}`);
      });
    }
    console.log('\nUsage to grant admin:');
    console.log('   npx tsx scripts/make_admin.ts <user-email>\n');
    process.exit(0);
  }

  const [targetUser] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email.trim().toLowerCase()))
    .limit(1);

  if (!targetUser) {
    console.error(`❌ User with email "${email}" not found in database.`);
    console.error('Please create an account on the website first (via email, GitHub, or Google).');
    process.exit(1);
  }

  await db
    .update(schema.user)
    .set({
      role: 'admin',
      plan: 'pro',
      credits: 999999,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, targetUser.id));

  console.log(`\n🎉 Success! User "${email}" has been promoted to ADMIN and PRO!`);
  console.log(`Now sign in and visit: https://www.hacker-tube.net/admin (or http://localhost:3000/admin)\n`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
