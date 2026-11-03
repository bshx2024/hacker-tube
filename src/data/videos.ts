export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  channelTitle: string;
  duration: string;
  durationSeconds: number;
  publishedYear: number;
  topic: TopicCategory;
  hnMentions: number;
  hnExcerpt: string;
  hnAuthor: string;
  hnYear: number;
  hnDiscussionUrl: string;
  aiKeyTakeaways: string[];
}

export type TopicCategory =
  | "All"
  | "AI & Machine Learning"
  | "Systems & Architecture"
  | "Math & Science"
  | "Retro & History"
  | "Engineering Culture"
  | "Security & Hacking";

export const TOPIC_CATEGORIES: TopicCategory[] = [
  "All",
  "AI & Machine Learning",
  "Systems & Architecture",
  "Math & Science",
  "Retro & History",
  "Engineering Culture",
  "Security & Hacking",
];

export const CURATED_VIDEOS: VideoItem[] = [
  {
    id: "karpathy-micrograd",
    youtubeId: "M3B63EGmIbc",
    title: "The Spelled-Out Intro to Neural Networks and Backpropagation: Building micrograd",
    channelTitle: "Andrej Karpathy",
    duration: "2:25:34",
    durationSeconds: 8734,
    publishedYear: 2022,
    topic: "AI & Machine Learning",
    hnMentions: 42,
    hnExcerpt: "This is hands-down the single best tutorial on backprop and computational graphs on the entire internet. He codes up an autograd engine from scratch with zero magic.",
    hnAuthor: "patio11_admirer",
    hnYear: 2022,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=32514104",
    aiKeyTakeaways: [
      "Step-by-step construction of a DAG scalar autograd engine in ~100 lines of pure Python.",
      "Demystifies backward pass and gradients through clear calculus chain-rule applications.",
      "Trains a 2-layer multi-layer perceptron (MLP) on a binary classification dataset."
    ]
  },
  {
    id: "bret-victor-principle",
    youtubeId: "1bUy-1hGZpI",
    title: "Inventing on Principle",
    channelTitle: "Bret Victor",
    duration: "54:19",
    durationSeconds: 3259,
    publishedYear: 2012,
    topic: "Engineering Culture",
    hnMentions: 58,
    hnExcerpt: "One of the most life-altering talks any software developer can watch. Changed the way I think about tools, feedback loops, and guiding life principles forever.",
    hnAuthor: "danso",
    hnYear: 2012,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=3835694",
    aiKeyTakeaways: [
      "Creators need immediate, tactile feedback on what they are making without cognitive latency.",
      "The difference between living by a craft versus dedicating your life to an uncompromised principle.",
      "Live demonstrations of reactive interactive programming and dynamic procedural generation."
    ]
  },
  {
    id: "mother-of-all-demos",
    youtubeId: "yDYCf4bNwN4",
    title: "The Mother of All Demos, presented by Douglas Engelbart (1968)",
    channelTitle: "SRI International",
    duration: "1:40:02",
    durationSeconds: 6002,
    publishedYear: 1968,
    topic: "Retro & History",
    hnMentions: 39,
    hnExcerpt: "He unveiled the computer mouse, hypertext, windows, video conferencing, real-time collaborative text editing, and version control in a single 1968 presentation. Staggering.",
    hnAuthor: "adamnemecek",
    hnYear: 2018,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=18641193",
    aiKeyTakeaways: [
      "The debut of the graphical user interface, optical mouse, and chorded keyboard.",
      "Concept of dynamic knowledge networks and augmenting human intellect through computing.",
      "Real-time shared collaborative tele-working over early ARPANET prototypes."
    ]
  },
  {
    id: "karpathy-build-gpt",
    youtubeId: "kCc8FmEb1nY",
    title: "Let's build GPT: from scratch, in code, spelled out",
    channelTitle: "Andrej Karpathy",
    duration: "1:56:46",
    durationSeconds: 7006,
    publishedYear: 2023,
    topic: "AI & Machine Learning",
    hnMentions: 51,
    hnExcerpt: "Takes you from an n-gram character model to a full multi-head causal self-attention Transformer matching the Attention Is All You Need paper. The definitive guide.",
    hnAuthor: "jeremyphoward",
    hnYear: 2023,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=34415840",
    aiKeyTakeaways: [
      "Step-by-step implementation of causal self-attention, query/key/value projections, and residual connections.",
      "Layer normalization, position embeddings, and softmax scaling explained intuitively in PyTorch.",
      "Trains a baby Shakespeare-generating GPT live on GPU within under two hours."
    ]
  },
  {
    id: "rich-hickey-simple-made-easy",
    youtubeId: "h_L4Rixya64",
    title: "Simple Made Easy",
    channelTitle: "Rich Hickey (Strange Loop)",
    duration: "1:01:28",
    durationSeconds: 3688,
    publishedYear: 2011,
    topic: "Engineering Culture",
    hnMentions: 64,
    hnExcerpt: "The gold standard talk on software architecture. Hickey rigorously dissects the difference between 'easy' (familiar, near at hand) and 'simple' (unbraided, unentangled).",
    hnAuthor: "swannodette",
    hnYear: 2011,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=3145464",
    aiKeyTakeaways: [
      "Easy is relative to our familiarity and tooling; simple is an objective measure of unentangled concepts.",
      "Complexity arises from intertwining state, time, constructs, and data representations.",
      "Focus on composable, decoupled values rather than encapsulating tangled mutable state."
    ]
  },
  {
    id: "casey-muratori-clean-code",
    youtubeId: "tD5NrevFtbU",
    title: "'Clean' Code, Horrible Performance",
    channelTitle: "Casey Muratori",
    duration: "40:53",
    durationSeconds: 2453,
    publishedYear: 2023,
    topic: "Systems & Architecture",
    hnMentions: 33,
    hnExcerpt: "Casey demonstrates with real benchmarks how textbook OOP principles like excessive polymorphism, class hierarchies, and virtual functions cause a 15x slowdown on modern hardware.",
    hnAuthor: "cmuratori",
    hnYear: 2023,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=34964646",
    aiKeyTakeaways: [
      "Hardware-conscious data layout versus dogmatic object-oriented abstraction layers.",
      "How virtual function dispatch, pointer indirection, and switch flattening impact instruction caches.",
      "Profile-driven optimization achieving an order of magnitude throughput gain with simple switch-case."
    ]
  },
  {
    id: "3b1b-essence-of-calculus",
    youtubeId: "WUvTyaaNkzM",
    title: "The Essence of Calculus, Chapter 1",
    channelTitle: "3Blue1Brown",
    duration: "17:04",
    durationSeconds: 1024,
    publishedYear: 2017,
    topic: "Math & Science",
    hnMentions: 27,
    hnExcerpt: "Grant Sanderson accomplishes in 17 minutes what standard high school and college professors fail to do in months: build geometric intuition for what an integral and derivative actually mean.",
    hnAuthor: "minimaxir",
    hnYear: 2017,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=14227702",
    aiKeyTakeaways: [
      "Finding the area of a circle by unwrapping concentric rings into a right triangle.",
      "Deriving rate of change through infinitesimals without getting bogged down in algebraic formalism first.",
      "Visual geometry as the foundational anchor for advanced mathematical proofs."
    ]
  },
  {
    id: "patrick-winston-how-to-speak",
    youtubeId: "Unzc731iCUY",
    title: "How to Speak - Patrick Winston (MIT)",
    channelTitle: "MIT OpenCourseWare",
    duration: "1:03:32",
    durationSeconds: 3812,
    publishedYear: 2019,
    topic: "Engineering Culture",
    hnMentions: 37,
    hnExcerpt: "Winston's annual MIT lecture on communication, lecturing, and persuasion. His rules on pacing, the 'Time & Place' rule, and blackboard usage are timeless.",
    hnAuthor: "georgecmu",
    hnYear: 2019,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=21637955",
    aiKeyTakeaways: [
      "Your success in life is determined heavily by your ability to speak, write, and the quality of your ideas.",
      "The Uniform Resource rule: cycle through topics and always provide an 'Empowerment Promise' in the first 5 minutes.",
      "The perils of slide text over-density and why physical chalkboard chalk-speed matches human thought."
    ]
  },
  {
    id: "carmack-quake-graphics",
    youtubeId: "443UNeGrFoM",
    title: "Fast Inverse Square Root: A Quake III Algorithm Deep Dive",
    channelTitle: "Nemean",
    duration: "14:28",
    durationSeconds: 868,
    publishedYear: 2021,
    topic: "Systems & Architecture",
    hnMentions: 45,
    hnExcerpt: "0x5f3759df: The famous magic constant. A masterclass in IEEE 754 floating-point mechanics, bit-level hacking, and Newton-Raphson approximation.",
    hnAuthor: "kristopolous",
    hnYear: 2021,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=27814231",
    aiKeyTakeaways: [
      "Deconstruction of bitcasting float representations directly into 32-bit integers.",
      "The mathematical derivation of the magic constant 0x5f3759df minimizing log2 approximation error.",
      "Applying one single iteration of Newton-Raphson method for lightning-fast normal vector normalization."
    ]
  },
  {
    id: "karpathy-intro-llm",
    youtubeId: "zjkBMFhNj_g",
    title: "[1hr Talk] Intro to Large Language Models",
    channelTitle: "Andrej Karpathy",
    duration: "1:00:27",
    durationSeconds: 3627,
    publishedYear: 2023,
    topic: "AI & Machine Learning",
    hnMentions: 54,
    hnExcerpt: "The clearest 1-hour overview of what LLMs are, how pretraining works, RLHF, and AI safety without any marketing hype or doomer exaggeration.",
    hnAuthor: "simonw",
    hnYear: 2023,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=38382025",
    aiKeyTakeaways: [
      "LLMs as a lossy zip file of the public internet compressed into weights via next-token prediction.",
      "The multi-stage pipeline: Pretraining on trillions of tokens, Fine-Tuning (SFT), and RLHF alignment.",
      "Future paradigm of LLMs functioning like a new Operating System kernel (LLM OS orchestrating RAM, disk, and tools)."
    ]
  },
  {
    id: "bret-victor-future-programming",
    youtubeId: "8hly31xKli0",
    title: "The Future of Programming",
    channelTitle: "Bret Victor (DBX 2013)",
    duration: "32:45",
    durationSeconds: 1965,
    publishedYear: 2013,
    topic: "Retro & History",
    hnMentions: 48,
    hnExcerpt: "Bret dresses up as a 1973 computer scientist giving a talk on what programming will look like in 40 years. He brilliantly exposes how our modern tools are trapped in local optimums.",
    hnAuthor: "fogus",
    hnYear: 2013,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=5992928",
    aiKeyTakeaways: [
      "Critique of modern code editing: we still type character streams into sequential text files just like punch cards in the 60s.",
      "Alternative paradigms: spatial representation, goal-directed constraints, and massive concurrent message passing.",
      "The tragedy of adopting the easiest-to-implement solutions and standardizing them into permanent dogmas."
    ]
  },
  {
    id: "dan-boneh-crypto-intro",
    youtubeId: "a1pZ9H3v4uY",
    title: "Zero Knowledge Proofs and Modern Cryptography Foundations",
    channelTitle: "Stanford Online",
    duration: "1:18:12",
    durationSeconds: 4692,
    publishedYear: 2022,
    topic: "Security & Hacking",
    hnMentions: 29,
    hnExcerpt: "Dan Boneh's Stanford lectures are gold standard. His explanation of interactive proof systems, zk-SNARKs, and homomorphic encryption is unmatched in mathematical rigor.",
    hnAuthor: "vbuterin_reader",
    hnYear: 2022,
    hnDiscussionUrl: "https://news.ycombinator.com/item?id=30912441",
    aiKeyTakeaways: [
      "Mathematical foundation of interactive versus non-interactive Zero-Knowledge arguments (ZKPs).",
      "Proving knowledge of a pre-image without revealing confidential witness parameters.",
      "Applications to privacy-preserving blockchains, verifiable computation offloading, and cryptographic audits."
    ]
  }
];
