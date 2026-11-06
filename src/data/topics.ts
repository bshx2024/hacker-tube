import { TopicCategory } from "./videos";

export interface TopicInfo {
  slug: string;
  name: TopicCategory;
  title: string;
  description: string;
  icon: string;
  badge: string;
}

export const TOPIC_METADATA: TopicInfo[] = [
  {
    slug: "ai-machine-learning",
    name: "AI & Machine Learning",
    title: "AI & Machine Learning Tech Talks",
    description:
      "Deep learning fundamentals, transformer architectures, backpropagation calculus, and foundational LLM systems vetted by Hacker News engineers.",
    icon: "🤖",
    badge: "Foundational ML",
  },
  {
    slug: "systems-architecture",
    name: "Systems & Architecture",
    title: "Systems & Architecture Engineering Lectures",
    description:
      "Low-level system design, operating systems, cache locality, database internals, and high-performance computing principles without abstractions.",
    icon: "⚙️",
    badge: "Low-Level & DistSys",
  },
  {
    slug: "math-science",
    name: "Math & Science",
    title: "Math & Science Rigorous Explanations",
    description:
      "Linear algebra, calculus derivations, physics, information theory, and rigorous applied mathematical thinking.",
    icon: "📐",
    badge: "First Principles",
  },
  {
    slug: "retro-history",
    name: "Retro & History",
    title: "Computing History & Retro Systems",
    description:
      "Seminal computing history, early UNIX architecture, Bell Labs discoveries, and the genesis of personal computing and networking.",
    icon: "💾",
    badge: "Computing Roots",
  },
  {
    slug: "engineering-culture",
    name: "Engineering Culture",
    title: "Engineering Culture & Philosophy",
    description:
      "Craftsmanship, radical simplicity, software architecture principles, feedback loops, and timeless engineering ethos.",
    icon: "🧠",
    badge: "Timeless Craft",
  },
  {
    slug: "security-hacking",
    name: "Security & Hacking",
    title: "Security, Cryptography & Hacking Deep Dives",
    description:
      "Zero-knowledge proofs, cryptography foundations, binary exploitation, reverse engineering, and threat modeling.",
    icon: "🛡️",
    badge: "Crypto & Exploit",
  },
];

export function getTopicBySlug(slug: string): TopicInfo | undefined {
  return TOPIC_METADATA.find((t) => t.slug === slug);
}

export function getSlugByTopicName(name: string): string {
  const match = TOPIC_METADATA.find((t) => t.name === name);
  return match ? match.slug : "all";
}

