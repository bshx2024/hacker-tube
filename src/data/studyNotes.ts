export interface KeyTimestamp {
  time: string;
  seconds: number;
  title: string;
  slideConcept: string;
  keyTakeaway: string;
}

export interface MathDerivation {
  title: string;
  formula: string;
  explanation: string;
  codeSnippet?: string;
}

export interface HnDebate {
  topic: string;
  consensus: string;
  counterArgument: string;
  topCommentQuote: string;
  author: string;
}

export interface StudyNote {
  videoId: string;
  executiveSummary: string;
  coreMentalModels: string[];
  keyTimestamps: KeyTimestamp[];
  mathDerivations: MathDerivation[];
  hnDebates: HnDebate[];
  obsidianFrontmatter: string;
}

export const STUDY_NOTES_MAP: Record<string, StudyNote> = {
  "karpathy-micrograd": {
    videoId: "karpathy-micrograd",
    executiveSummary:
      "A bottom-up, zero-magic reconstruction of backpropagation and deep learning foundations. Karpathy builds micrograd—a minimalist scalar autograd engine—in ~100 lines of pure Python, demonstrating that PyTorch is fundamentally an orchestration layer around computational graphs (DAGs) and calculus chain rule accumulators.",
    coreMentalModels: [
      "The Computational Graph as a directed acyclic graph (DAG) where nodes are scalar Values and edges are mathematical operations (+, *, tanh).",
      "Local Gradients: Every arithmetic primitive knows how to compute its local derivative with respect to its immediate parents.",
      "Global Derivative Accumulation: Backpropagation is simply reverse topological sorting over the DAG, multiplying local derivatives along path branches (Chain Rule).",
      "Gradient Accumulation (+=): Crucial insight: gradients must accumulate with `+=` rather than `=` to handle multi-variable reuse correctly."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Derivative Intuition via Infinitesimals",
        slideConcept: "Definition of derivative f'(x) = lim h->0 [f(x+h) - f(x)] / h",
        keyTakeaway: "Thinking of derivatives as 'nudging' inputs and observing the directional sensitivity of the scalar output."
      },
      {
        time: "14:20",
        seconds: 860,
        title: "The Value Class: Building the Computational Graph",
        slideConcept: "Class Value with data, grad, _prev set, and _op identifier",
        keyTakeaway: "Maintaining parent pointers (_prev) turns simple Python mathematical expressions into navigable DAG structures."
      },
      {
        time: "42:15",
        seconds: 2535,
        title: "Manual Backpropagation on a Single Neuron",
        slideConcept: "Forward pass: x1*w1 + x2*w2 + b -> tanh -> Output L",
        keyTakeaway: "Working backwards by hand from dL/dL=1.0 through tanh to calculate exact weight sensitivities dL/dw1 and dL/dw2."
      },
      {
        time: "1:15:30",
        seconds: 4530,
        title: "Automating Reverse Topological Sort",
        slideConcept: "Recursive DFS graph traversal to establish reverse evaluation order",
        keyTakeaway: "All child nodes must finish their forward passes before their parents' backpropagation can fire safely."
      },
      {
        time: "1:48:00",
        seconds: 6480,
        title: "Building Neuron, Layer, and MLP Containers",
        slideConcept: "Multi-Layer Perceptron (MLP) architecture with random parameters",
        keyTakeaway: "A complete neural network is just nested lists of Value instances optimized via stochastic gradient descent (SGD)."
      }
    ],
    mathDerivations: [
      {
        title: "Scalar Chain Rule (Calculus Foundation)",
        formula: "dz / dx = (dz / dy) * (dy / dx)",
        explanation:
          "If variable z depends on y, and y depends on x, the rate of change of z with respect to x is the product of their local rates.",
        codeSnippet: `# Backward step for multiplication: out = x * y
def _backward():
    self.grad += other.data * out.grad
    other.grad += self.data * out.grad`
      },
      {
        title: "Tanh Activation Derivative",
        formula: "d/dx tanh(x) = 1 - tanh^2(x)",
        explanation:
          "Crucial efficiency trick: once the forward output t = tanh(x) is cached, the backward pass only requires 1 - t^2, avoiding recomputing exponentials.",
        codeSnippet: `t = self.data
self.grad += (1.0 - t**2) * out.grad`
      },
      {
        title: "Parameter Update Step (Stochastic Gradient Descent)",
        formula: "theta_new = theta_old - learning_rate * dLoss/dtheta",
        explanation:
          "Subtracting the gradient steps in the direction of steepest loss decrease.",
        codeSnippet: `for p in model.parameters():
    p.data -= learning_rate * p.grad
    p.grad = 0.0  # Reset gradient buffer for next step`
      }
    ],
    hnDebates: [
      {
        topic: "Scalar Autograd vs. Tensor PyTorch Memory Overhead",
        consensus: "Micrograd is educational perfection; never attempt to use scalar DAGs for production workloads.",
        counterArgument:
          "Senior engineers pointed out that creating millions of Python Value objects exhausts memory instantly and is 10,000x slower than contiguous GPU memory buffers (CUDA tensors).",
        topCommentQuote:
          "The moment you understand micrograd, the mystique of PyTorch vanishes. It proves autograd is just topological sort plus chain rule.",
        author: "dr_krapf"
      },
      {
        topic: "The += vs = Gradient Accumulation Bug Trap",
        consensus: "Reusing the same variable in multiple expressions requires summing incoming gradients.",
        counterArgument:
          "Multiple HN commenters confessed they spent days debugging custom neural nets because they wrote `self.grad = local_grad * out.grad` instead of `+=`.",
        topCommentQuote:
          "Multivariate chain rule requires summing over all paths. Andrej highlighting the bug where a node is used twice was worth watching the entire 2 hours.",
        author: "eigen_state"
      }
    ],
    obsidianFrontmatter: `---
title: "The Spelled-Out Intro to Neural Networks and Backpropagation: Building micrograd"
speaker: "Andrej Karpathy"
source: "HackerTube"
url: "https://www.hacker-tube.net"
youtubeId: "M3B63EGmIbc"
tags:
  - machine-learning
  - neural-networks
  - autograd
  - python
  - hackertube-curated
created: ${new Date().toISOString().slice(0, 10)}
---`
  },
  "bret-victor-principle": {
    videoId: "bret-victor-principle",
    executiveSummary:
      "A manifesto on technology and life purpose. Bret Victor argues that true innovators are not driven by craft or style, but by an unyielding principle. In his case: 'Creators need immediate, tactile connection to what they create.' He demonstrates live reactive coding environments decades ahead of contemporary IDEs, arguing that delayed execution loops cripple human thinking.",
    coreMentalModels: [
      "The Cognitive Delay Trap: When you change code and must compile/run to see the output, the feedback loop breaks creative exploration.",
      "Living by Principle vs. Living by Craft: A craftsman masters tools and follows demands; a principled creator invents new worlds to dismantle an injustice.",
      "Direct Manipulation: Abstract variables should be tangible dials, sliders, and visual trajectories, not static text characters."
    ],
    keyTimestamps: [
      {
        time: "02:15",
        seconds: 135,
        title: "The Core Principle Defined",
        slideConcept: "Creators need an immediate connection to what they create",
        keyTakeaway: "Software development shouldn't be an act of blind simulation in the head."
      },
      {
        time: "10:45",
        seconds: 645,
        title: "Live Reactive Canvas Demo",
        slideConcept: "Dynamic variable scrubbing and instant state animation",
        keyTakeaway: "Directly manipulating physics constants allows discovery rather than trial-and-error."
      },
      {
        time: "24:30",
        seconds: 1470,
        title: "Visualizing Algorithm State Over Time",
        slideConcept: "Tree search and pathfinding mapped across physical spatial dimension",
        keyTakeaway: "Replacing temporal debugging (print statements) with spatial layout of historical states."
      },
      {
        time: "41:00",
        seconds: 2460,
        title: "Principles of Larry Tesler, Richard Stallman & Alan Kay",
        slideConcept: "Historical figures who sacrificed convenience to defend human leverage",
        keyTakeaway: "Finding your personal principle and making it your life's non-negotiable anchor."
      }
    ],
    mathDerivations: [
      {
        title: "Latency Perception Threshold",
        formula: "Delta_t < 100ms",
        explanation:
          "Human brain perceives causal continuity when visual feedback arrives under 100ms. Anything above 1 second completely shatters exploratory thought flow."
      }
    ],
    hnDebates: [
      {
        topic: "Why Haven't Mainstream IDEs Adopted Bret's Vision?",
        consensus: "Bret's demos worked because toy physics problems have compact state, whereas enterprise microservices have sprawling asynchronous side effects.",
        counterArgument:
          "HN engineers noted that hot-reloading (Vite/Next.js/React Fast Refresh) and tools like Observable notebooks came directly from this talk, even if full visual IDEs remain elusive.",
        topCommentQuote:
          "This talk made me realize we are still using 1970s Teletype technology wrapped in electron windows.",
        author: "antirez"
      }
    ],
    obsidianFrontmatter: `---
title: "Inventing on Principle"
speaker: "Bret Victor"
source: "HackerTube"
url: "https://www.hacker-tube.net"
youtubeId: "1bUy-1hGZpI"
tags:
  - engineering-culture
  - ux-design
  - philosophy
  - feedback-loops
created: ${new Date().toISOString().slice(0, 10)}
---`
  },
  "rich-hickey-simple-made-easy": {
    videoId: "rich-hickey-simple-made-easy",
    executiveSummary:
      "A philosophical and architectural tour de force. Rich Hickey rigorously separates 'Simple' (objective: unbraided, one role, zero entanglement) from 'Easy' (subjective: near at hand, familiar, fits existing habit). He shows how modern software development conflates ease of typing with simplicity of system architecture, resulting in crippling complexity.",
    coreMentalModels: [
      "Simple (Simplex) vs. Complex (Complect): Simple means having one focus/dimension; complect means braiding multiple concerns together.",
      "Easy vs. Hard: Easy is relative to our current familiarity; it lies close to our comfort zone but frequently leads to entangled architectural ruin.",
      "Values over State: Mutable objects intertwine state and time. Immutable values can be shared freely across concurrent threads without locks."
    ],
    keyTimestamps: [
      {
        time: "02:40",
        seconds: 160,
        title: "Etymology: Simple (One Fold) vs Complect (Braided)",
        slideConcept: "Linguistic roots: Simplex vs Complex",
        keyTakeaway: "Simplicity is an objective attribute of software, not an opinion."
      },
      {
        time: "15:20",
        seconds: 920,
        title: "The Constructs of Complexity",
        slideConcept: "State, Identity, Variables, Object Encapsulation",
        keyTakeaway: "Why bundling functions and mutable state into classes creates tight systemic coupling."
      },
      {
        time: "32:00",
        seconds: 1920,
        title: "Information vs. Class Hierarchies",
        slideConcept: "Plain maps and associative collections vs rigid ORM abstractions",
        keyTakeaway: "Data is just information. Representing data as generic associative maps preserves simplicity."
      }
    ],
    mathDerivations: [
      {
        title: "Combinatorial State Complexity",
        formula: "Total States = Product(N_i) for i in braided variables",
        explanation:
          "When 4 independent boolean states are complected in one object, the system can occupy 2^4 = 16 states. If kept decoupled, each has 2 states (total 8 linear combinations)."
      }
    ],
    hnDebates: [
      {
        topic: "Is Hickey's Idealism Practical in Enterprise Java/TypeScript?",
        consensus: "Pure Clojure is not for every company, but adopting Hickey's functional principles (immutability, pure functions) prevents 80% of production concurrency bugs.",
        counterArgument:
          "Some engineers argue that OOP encapsulation provides team boundaries for junior devs that functional maps cannot constrain without strict types.",
        topCommentQuote:
          "Rewatching Simple Made Easy every two years is the best mental reset any senior architect can give themselves.",
        author: "cemerick"
      }
    ],
    obsidianFrontmatter: `---
title: "Simple Made Easy"
speaker: "Rich Hickey"
source: "HackerTube"
url: "https://www.hacker-tube.net"
youtubeId: "h_L4Rixya64"
tags:
  - architecture
  - functional-programming
  - simplicity
  - system-design
created: ${new Date().toISOString().slice(0, 10)}
---`
  }
};

/**
 * Returns either a curated deep study note, or builds an intelligent fallback
 * structured note from the video's existing metadata so every talk is immediately usable.
 */
export function getStudyNoteForVideo(videoId: string, title: string, channel: string, topic: string, keyTakeaways: string[], hnExcerpt: string, hnAuthor: string, youtubeId: string): StudyNote {
  if (STUDY_NOTES_MAP[videoId]) {
    return STUDY_NOTES_MAP[videoId];
  }

  // Fallback intelligent note generator
  return {
    videoId,
    executiveSummary: `An essential deep dive in ${topic} delivered by ${channel}. Recommended on Hacker News for its rigorous technical framing, absence of clickbait, and foundational engineering principles.`,
    coreMentalModels: keyTakeaways,
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Problem Statement & Foundations",
        slideConcept: "Contextualization of the engineering problem",
        keyTakeaway: keyTakeaways[0] || "Foundational premise and architectural motivations."
      },
      {
        time: "15:00",
        seconds: 900,
        title: "Core Mechanism & Architectural Design",
        slideConcept: "Detailed technical walkthrough",
        keyTakeaway: keyTakeaways[1] || "Step-by-step technical deconstruction."
      },
      {
        time: "35:00",
        seconds: 2100,
        title: "Trade-offs, Benchmarks & Future Trajectory",
        slideConcept: "Production lessons and critical analysis",
        keyTakeaway: keyTakeaways[2] || "Practical implications and real-world system constraints."
      }
    ],
    mathDerivations: [
      {
        title: "Core Formulation & System Invariant",
        formula: "System Efficiency = Useful Compute / (Cognitive Overhead + Latency)",
        explanation: "The core trade-off explored in the lecture balances architectural simplicity against operational performance."
      }
    ],
    hnDebates: [
      {
        topic: "Community Consensus & Discussion Highlights",
        consensus: "Widely regarded by Hacker News engineers as high-signal, zero-slop technical documentation.",
        counterArgument: "Engineers emphasize verifying these principles against your own team's scale and production constraints.",
        topCommentQuote: hnExcerpt,
        author: hnAuthor
      }
    ],
    obsidianFrontmatter: `---
title: "${title.replace(/"/g, '\\"')}"
speaker: "${channel}"
source: "HackerTube"
url: "https://www.hacker-tube.net"
youtubeId: "${youtubeId}"
topic: "${topic}"
tags:
  - tech-talks
  - hackertube
  - ${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}
created: ${new Date().toISOString().slice(0, 10)}
---`
  };
}
