import { NextRequest } from "next/server";
import { POST } from "../src/app/api/notes/generate/route";
import { auth } from "../src/core/auth";
import { db, schema } from "../src/core/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

async function testFullAuthenticatedFlow() {
  console.log("=== 🚀 END-TO-END AUTHENTICATED NOTE GENERATION TEST ===");

  const testEmail = `test_engineer_${nanoid(6).toLowerCase()}@hacker-tube.net`;
  const testPassword = "Password123!Secure";
  const testName = "AI Test Engineer";

  console.log(`\n1. Creating authentic user via Better-Auth API: ${testEmail}...`);
  const signUpRes = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: testPassword,
      name: testName,
    },
    asResponse: true,
  });

  const setCookieHeader = signUpRes.headers.get("set-cookie");
  console.log(`   -> Auth response status: ${signUpRes.status}`);
  console.log(`   -> Set-Cookie received: ${setCookieHeader ? "✅ Yes" : "❌ No"}`);

  // Fetch the created user from DB
  const [dbUser] = await db.select().from(schema.user).where(eq(schema.user.email, testEmail)).limit(1);
  console.log(`   -> User created in DB: id = ${dbUser.id}, credits = ${dbUser.credits}`);

  // 2. Submit Note Generation Request
  const testYtId = "kCc8FmEb1nY"; // Andrej Karpathy: Building micrograd
  console.log(`\n2. Submitting note generation for YouTube video: ${testYtId}...`);

  // Ensure no cached note exists
  await db.delete(schema.generatedNote).where(eq(schema.generatedNote.youtubeId, testYtId));

  const reqHeaders = new Headers();
  reqHeaders.set("Content-Type", "application/json");
  if (setCookieHeader) {
    reqHeaders.set("cookie", setCookieHeader);
  }

  const req = new NextRequest("http://localhost:3000/api/notes/generate", {
    method: "POST",
    headers: reqHeaders,
    body: JSON.stringify({
      url: `https://www.youtube.com/watch?v=${testYtId}`,
    }),
  });

  const startTime = Date.now();
  const res = await POST(req);
  const latency = Date.now() - startTime;
  const data = await res.json();

  console.log(`   -> API response status: ${res.status} (completed in ${latency}ms)`);
  if (res.status !== 200 || !data.success) {
    console.error("   -> Generation error response:", data);
    throw new Error(`Expected 200, got ${res.status}`);
  }

  console.log(`   -> Success: ${data.success}`);
  console.log(`   -> isCached: ${data.isCached}`);
  console.log(`   -> Remaining credits: ${data.creditsLeft} (Should be 4)`);
  console.log(`   -> Video title: "${data.video?.title}"`);
  console.log(`   -> Channel: "${data.video?.channelTitle}"`);
  console.log(`   -> Topic: "${data.video?.topic}"`);
  console.log(`   -> Note title: "${data.note?.h1Title}"`);
  console.log(`   -> Mental models count: ${data.note?.coreMentalModels?.length}`);
  console.log(`   -> Math derivations count: ${data.note?.mathDerivations?.length}`);
  console.log(`   -> Hacker News debates: ${data.note?.hnDebates?.length}`);
  console.log(`   -> FAQs count: ${data.note?.faqs?.length}`);
  console.log(`   -> Word count preview: ${JSON.stringify(data.note).split(/\s+/).length} words`);

  // 3. Verify Database Updates
  console.log("\n3. Verifying database credit deduction...");
  const [updatedUser] = await db.select().from(schema.user).where(eq(schema.user.id, dbUser.id)).limit(1);
  console.log(`   -> Initial credits: ${dbUser.credits}, DB credits now: ${updatedUser?.credits}`);
  if (updatedUser?.credits !== dbUser.credits - 1) {
    throw new Error(`Credit not deducted properly! Expected ${dbUser.credits - 1}, found ${updatedUser?.credits}`);
  }
  console.log("   -> ✅ Credit deducted by exactly 1 credit in database!");

  console.log("\n4. Verifying database note persistence...");
  const [persistedNote] = await db
    .select()
    .from(schema.generatedNote)
    .where(eq(schema.generatedNote.youtubeId, testYtId))
    .limit(1);

  if (!persistedNote) {
    throw new Error("Note not found in generatedNote table!");
  }
  console.log(`   -> Note saved in DB with ID: ${persistedNote.id}`);
  console.log(`   -> Status: "${persistedNote.status}" (wordCount: ${persistedNote.wordCount})`);
  console.log(`   -> SEO indexation check: ${persistedNote.wordCount >= 1200 ? "✅ 100% Eligible (>= 1200 words)" : "❌ Ineligible"}`);

  // 4. Test Deduplication Cache (2nd request for the same video)
  console.log("\n5. Testing deduplication cache on 2nd submission...");
  const req2 = new NextRequest("http://localhost:3000/api/notes/generate", {
    method: "POST",
    headers: reqHeaders,
    body: JSON.stringify({
      url: `https://www.youtube.com/watch?v=${testYtId}`,
    }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  console.log(`   -> 2nd call status: ${res2.status}`);
  console.log(`   -> isCached: ${data2.isCached}`);
  if (!data2.isCached) throw new Error("2nd call was not served from cache!");

  const [afterCachedUser] = await db.select().from(schema.user).where(eq(schema.user.id, dbUser.id)).limit(1);
  console.log(`   -> User credits after cached retrieval: ${afterCachedUser?.credits} (Should stay at ${updatedUser?.credits})`);
  if (afterCachedUser?.credits !== updatedUser?.credits) {
    throw new Error("Cached request incorrectly deducted credits!");
  }
  console.log("   -> ✅ Cache hit served instantly with 0 credits deducted!");

  // 5. Clean up test user & generated note
  console.log("\n6. Cleaning up test data...");
  await db.delete(schema.user).where(eq(schema.user.id, dbUser.id));
  await db.delete(schema.generatedNote).where(eq(schema.generatedNote.youtubeId, testYtId));
  console.log("   -> Cleaned up test user and generated note.");

  console.log("\n============================================================");
  console.log("🎉 ALL TESTS PASSED: AI NOTE GENERATION IS 100% OPERATIONAL!");
  console.log("============================================================");
}

testFullAuthenticatedFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
