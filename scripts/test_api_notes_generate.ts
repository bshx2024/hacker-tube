import { NextRequest } from "next/server";
import { POST } from "../src/app/api/notes/generate/route";
import { db, schema } from "../src/core/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

async function runApiTests() {
  console.log("=== 🔍 COMPREHENSIVE /api/notes/generate ENDPOINT AUDIT ===");

  // Test 1: Invalid URL
  console.log("\n[Test 1] Testing invalid/empty URL payload...");
  const req1 = new NextRequest("http://localhost:3000/api/notes/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://google.com" }),
  });
  const res1 = await POST(req1);
  const data1 = await res1.json();
  console.log(`   -> Status: ${res1.status}`);
  console.log(`   -> Error response: ${JSON.stringify(data1)}`);
  if (res1.status !== 400 || data1.error !== "invalid_youtube_id") {
    throw new Error("Test 1 failed: Expected 400 invalid_youtube_id");
  }
  console.log("   -> ✅ Test 1 Passed: Invalid URL properly rejected with 400.");

  // Test 2: Unauthenticated Request for new video
  console.log("\n[Test 2] Testing unauthenticated request for uncached video...");
  const dummyYtId = `uncached_${nanoid(6)}`;
  const req2 = new NextRequest("http://localhost:3000/api/notes/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${dummyYtId}` }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  console.log(`   -> Status: ${res2.status}`);
  console.log(`   -> Response: ${JSON.stringify(data2)}`);
  if (res2.status !== 401 || data2.error !== "auth_required") {
    throw new Error("Test 2 failed: Expected 401 auth_required");
  }
  console.log("   -> ✅ Test 2 Passed: Unauthenticated request properly protected with 401.");

  // Test 3: Global Deduplication Cache Hit (Free instant retrieval without auth or credit deduction)
  console.log("\n[Test 3] Testing Global Deduplication Cache hit...");
  const cachedYtId = "AbCdEfGhIjK"; // Exactly 11 chars
  const cachedNoteId = `note_${nanoid(12)}`;
  
  // Seed a cached note into the DB
  await db.insert(schema.generatedNote).values({
    id: cachedNoteId,
    youtubeId: cachedYtId,
    youtubeUrl: `https://www.youtube.com/watch?v=${cachedYtId}`,
    title: "Understanding Transformer Attention & Softmax Scaling",
    channelTitle: "Deep Learning Institute",
    thumbnailUrl: `https://img.youtube.com/vi/${cachedYtId}/hqdefault.jpg`,
    topic: "AI & Machine Learning",
    duration: "45:00",
    executiveSummary: "A comprehensive derivation of Scaled Dot-Product Attention mechanism.",
    coreMentalModelsJson: JSON.stringify(["Query-Key Relevance Mapping", "Softmax Normalization Invariant"]),
    keyTimestampsJson: JSON.stringify([
      { time: "00:00", seconds: 0, title: "Overview", slideConcept: "Self-Attention", keyTakeaway: "Q, K, V matrices" },
      { time: "15:30", seconds: 930, title: "Softmax Scaling", slideConcept: "Sqrt(d_k)", keyTakeaway: "Prevent saturation" }
    ]),
    mathDerivationsJson: JSON.stringify([
      { title: "Attention Formulation", formula: "$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$", explanation: "Scaled dot product" }
    ]),
    hnDebatesJson: JSON.stringify([
      { topic: "Quadratic Complexity vs Linear Attention", consensus: "Standard flash attention beats approximations", counterArgument: "Long context needs sub-quadratic", topCommentQuote: "Memory bandwidth is the real bottleneck", author: "karpathy" }
    ]),
    faqsJson: JSON.stringify([
      { question: "Why divide by sqrt(d_k)?", answer: "To prevent dot products from growing large, pushing softmax into regions with vanishing gradients." }
    ]),
    obsidianMarkdown: "# Transformer Attention Notes",
    status: "published",
    wordCount: 1680,
    creatorUserId: "seed-user",
    creatorEmail: "seed@hacker-tube.net",
    viewCount: 1,
  });

  // Request the cached video
  const req3 = new NextRequest("http://localhost:3000/api/notes/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${cachedYtId}` }),
  });
  const res3 = await POST(req3);
  const data3 = await res3.json();

  console.log(`   -> Status: ${res3.status}`);
  console.log(`   -> isCached: ${data3.isCached}`);
  console.log(`   -> Title retrieved: "${data3.video?.title}"`);
  console.log(`   -> Mathematical formula: "${data3.note?.mathDerivations?.[0]?.formula}"`);

  if (!data3.isCached || data3.note?.mathDerivations?.[0]?.formula !== "$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$") {
    throw new Error("Test 3 failed: Cached note retrieval mismatch!");
  }
  console.log("   -> ✅ Test 3 Passed: Global cache serves full structured study note instantly!");

  // Clean up test seed
  await db.delete(schema.generatedNote).where(eq(schema.generatedNote.id, cachedNoteId));
  console.log("   -> Cleaned up cache test data.");

  console.log("\n========================================================");
  console.log("🎉 ALL API ROUTE CHECKS PASSED: ENDPOINT IS FULLY OPERATIONAL!");
  console.log("========================================================");
}

runApiTests().catch((err) => {
  console.error("❌ API Test Error:", err);
  process.exit(1);
});
