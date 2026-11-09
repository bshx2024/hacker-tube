/**
 * Gefei SEO High-Signal Study Note Content Structure Template
 * 
 * Guarantees:
 * - 1,600 ~ 2,000+ words (eliminates thin content penalties)
 * - 98+ Page Coach score
 * - 100% Title / H1 keyword claiming
 * - FAQPage JSON-LD Schema integration
 */

export interface HighSignalStudyNote {
  videoId: string;
  // 1. TDK & Keyword Claiming
  targetKeyword: string;         // e.g. "simple made easy"
  seoTitle: string;              // Max 60 chars, includes targetKeyword
  h1Title: string;               // 100% matches or contains targetKeyword
  seoDescription: string;        // 140-160 chars, targetKeyword in first 80 chars
  
  // 2. Executive Synthesis
  executiveSummary: string;      // 120-180 words executive overview
  coreMentalModels: string[];    // 4-6 key technical principles

  // 3. Module 1: Timestamped Chronological Breakdown
  timestampBreakdown: Array<{
    timestamp: string;           // e.g. "04:15"
    subheading: string;          // e.g. "Constructs of Complexity vs Simplicity"
    narrative: string;           // 100-150 words detailed explanation
    keyTakeaway: string;
  }>;

  // 4. Module 2: System Architecture & Implementation Diffs
  architectureDiffs: {
    title: string;
    description: string;
    badPattern: string;          // Anti-pattern
    goodPattern: string;         // Recommended architecture
    codeSnippet?: string;        // Verified executable code / mathematical formula
  };

  // 5. Module 3: Community Consensus & HN Debates
  communityDebates: Array<{
    question: string;
    consensus: string;           // Majority agreement in tech community
    tradeoffs: string;           // Nuanced trade-offs & edge cases
    communityQuote: string;      // Real community endorsement
    quoteAuthor: string;
  }>;

  // 6. Module 4: High-Intent FAQ (Schema.org FAQPage)
  faqs: Array<{
    question: string;            // Must include target keyword variations naturally
    answer: string;              // 80-120 words authoritative answer
  }>;
}

export const EXAMPLE_STUDY_NOTE: HighSignalStudyNote = {
  videoId: "sample-lecture-slug",
  targetKeyword: "sample key concept",
  seoTitle: "Sample Key Concept: Expert Study Notes & Architecture Guide",
  h1Title: "Sample Key Concept — Master Architecture Guide",
  seoDescription: "Master Sample Key Concept: geometric derivations, system trade-offs, and community consensus. In-depth lecture notes on HackerTube.",
  
  executiveSummary: "A comprehensive deconstruction of fundamental system design principles, contrasting composable modular patterns against intertwined complexity...",
  coreMentalModels: [
    "Simplicity is an objective attribute of unentangled systems, not an ease-of-use perception.",
    "State and time must be decoupled via immutable value queues.",
    "Declarative data descriptions outperform class hierarchies for domain modeling."
  ],

  timestampBreakdown: [
    {
      timestamp: "02:10",
      subheading: "Etymology of Simple vs Easy",
      narrative: "Simple originates from simplex (single fold or unbraided), describing how many things are intertwined. Easy originates from facil (near to hand), describing familiarity...",
      keyTakeaway: "Familiarity is subjective; simplicity is an architectural property."
    }
  ],

  architectureDiffs: {
    title: "State Management: Mutable Braiding vs Immutable Values",
    description: "Comparison between mutable stateful references and persistent data snapshots.",
    badPattern: "Sharing mutable state across concurrent execution threads.",
    goodPattern: "Passing immutable data snapshots across asynchronous queue channels.",
    codeSnippet: "# Functional transformation of immutable state snapshots\ndef process_event(state, event):\n    return {**state, 'counter': state['counter'] + event['delta']}"
  },

  communityDebates: [
    {
      question: "Can pure immutability perform adequately in real-time systems?",
      consensus: "Persistent data structures utilize structural sharing (hash array mapped tries) achieving near O(1) time complexity.",
      tradeoffs: "Garbage collection overhead can increase in extreme sub-millisecond trading loops.",
      communityQuote: "Structural sharing proves you do not have to sacrifice speed for architectural sanity.",
      quoteAuthor: "systems_architect"
    }
  ],

  faqs: [
    {
      question: "How does Sample Key Concept prevent tight coupling in production systems?",
      answer: "Sample Key Concept enforces strict boundary contracts through pure data serialization, removing hidden runtime dependencies between modules."
    }
  ]
};
