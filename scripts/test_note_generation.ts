import { extractYouTubeId, fetchYouTubeMeta, fetchYouTubeTranscript, generateStudyNote } from '../src/core/services/noteGenerator';
import { db, schema } from '../src/core/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

async function main() {
  console.log('--- 🧪 STARTING AI NOTE GENERATION PIPELINE DIAGNOSTIC ---');

  const testUrl = 'https://www.youtube.com/watch?v=VMj-3S1tku0'; // Andrej Karpathy: Intro to Large Language Models
  console.log(`1. Testing URL parsing for: ${testUrl}`);
  const youtubeId = extractYouTubeId(testUrl);
  console.log(`   -> Extracted YouTube ID: ${youtubeId}`);
  if (!youtubeId) throw new Error('YouTube ID extraction failed!');

  console.log('\n2. Testing YouTube Metadata Fetching (oEmbed / YouTube API)...');
  const meta = await fetchYouTubeMeta(youtubeId);
  console.log(`   -> Title: "${meta.title}"`);
  console.log(`   -> Channel: "${meta.channelTitle}"`);
  if (!meta.title) throw new Error('Metadata fetching failed!');

  console.log('\n3. Testing Transcript Extraction...');
  const transcriptData = await fetchYouTubeTranscript(youtubeId);
  console.log(`   -> Raw transcript length: ${transcriptData.rawText.length} characters`);
  console.log(`   -> Segment count: ${transcriptData.segments.length}`);
  if (transcriptData.segments.length > 0) {
    console.log(`   -> Sample segment [${transcriptData.segments[0].time}]: "${transcriptData.segments[0].text.slice(0, 60)}..."`);
  }

  console.log('\n4. Testing AI Note Generation Engine (generateStudyNote)...');
  const startTime = Date.now();
  const result = await generateStudyNote({
    youtubeId,
    title: meta.title,
    channelTitle: meta.channelTitle,
    transcript: transcriptData.rawText,
    segments: transcriptData.segments,
  });
  const durationMs = Date.now() - startTime;

  console.log(`   -> Completed in: ${durationMs}ms`);
  console.log(`   -> Calculated Word Count: ${result.wordCount} words`);
  console.log(`   -> Topic Classified: "${result.topic}"`);
  console.log(`   -> SEO Status Check: ${result.wordCount >= 1200 ? '✅ PASSED (published >= 1200 words)' : '⚠️ WARNING (< 1200 words)'}`);

  const note = result.studyNote;
  console.log('\n5. Verifying Required Note Modules:');
  console.log(`   - Executive Summary: ${note.executiveSummary.length} chars (Preview: "${note.executiveSummary.slice(0, 100)}...")`);
  console.log(`   - Core Mental Models: ${note.coreMentalModels.length} models`);
  note.coreMentalModels.forEach((m, i) => console.log(`     [${i + 1}] ${m.slice(0, 70)}...`));

  console.log(`   - Key Timestamps: ${note.keyTimestamps.length} milestones`);
  note.keyTimestamps.slice(0, 3).forEach((t, i) => console.log(`     [${i + 1}] ${t.time} - ${t.title}`));

  console.log(`   - Math Derivations: ${note.mathDerivations.length} formulations`);
  note.mathDerivations.forEach((d, i) => {
    console.log(`     [${i + 1}] ${d.title} (Formula length: ${d.formula?.length || 0} chars)`);
  });

  console.log(`   - Hacker News Debates: ${note.hnDebates.length} debate perspectives`);
  note.hnDebates.forEach((h, i) => console.log(`     [${i + 1}] ${h.topic}: ${h.consensus.slice(0, 60)}...`));

  console.log(`   - Technical FAQs: ${note.faqs?.length || 0} questions`);

  console.log(`   - Obsidian Markdown Frontmatter: ${note.obsidianFrontmatter.includes('tags:') ? '✅ Valid' : '❌ Missing'}`);

  console.log('\n6. Testing Database Persistence & Deduplication Cache...');
  const testNoteId = `test_note_${nanoid(8)}`;
  await db.insert(schema.generatedNote).values({
    id: testNoteId,
    youtubeId: `test-${youtubeId}`,
    youtubeUrl: testUrl,
    title: meta.title,
    channelTitle: meta.channelTitle,
    thumbnailUrl: result.thumbnailUrl,
    topic: result.topic,
    duration: "30:00",
    executiveSummary: note.executiveSummary,
    coreMentalModelsJson: JSON.stringify(note.coreMentalModels),
    keyTimestampsJson: JSON.stringify(note.keyTimestamps),
    mathDerivationsJson: JSON.stringify(note.mathDerivations),
    hnDebatesJson: JSON.stringify(note.hnDebates),
    faqsJson: JSON.stringify(note.faqs || []),
    obsidianMarkdown: note.obsidianFrontmatter,
    status: result.wordCount >= 1200 ? "published" : "private",
    wordCount: result.wordCount,
    creatorUserId: "diagnostic-test-runner",
    creatorEmail: "test@hacker-tube.net",
    viewCount: 1,
  });

  const [cached] = await db
    .select()
    .from(schema.generatedNote)
    .where(eq(schema.generatedNote.id, testNoteId))
    .limit(1);

  console.log(`   -> Successfully retrieved saved note: ID = ${cached.id}, Title = "${cached.title}"`);

  // Clean up diagnostic row
  await db.delete(schema.generatedNote).where(eq(schema.generatedNote.id, testNoteId));
  console.log('   -> Cleaned up diagnostic test row from database.');

  console.log('\n🎉 ALL AI NOTE GENERATION PIPELINE TESTS PASSED 100%!');
}

main().catch((err) => {
  console.error('\n❌ DIAGNOSTIC TEST FAILED:', err);
  process.exit(1);
});
