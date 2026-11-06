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
url: "https://www.hacker-tube.net/?v=karpathy-micrograd&ref=obsidian_notes"
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
url: "https://www.hacker-tube.net/?v=bret-victor-inventing-on-principle&ref=obsidian_notes"
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
url: "https://www.hacker-tube.net/?v=rich-hickey-simple-made-easy&ref=obsidian_notes"
youtubeId: "h_L4Rixya64"
tags:
  - architecture
  - functional-programming
  - simplicity
  - system-design
created: ${new Date().toISOString().slice(0, 10)}
---`
  },
  "karpathy-build-gpt": {
    videoId: "karpathy-build-gpt",
    executiveSummary:
      "A masterclass deconstruction of the GPT architecture from first principles. Karpathy constructs a complete, decoder-only Transformer in ~300 lines of pure PyTorch, progressing systematically from character tokenization and bigram baselines to causal multi-head self-attention, feed-forward projections, residual stream connections, and LayerNorm stabilization.",
    coreMentalModels: [
      "Attention as Communication: Nodes in a sequence aggregate information from previous nodes by weighted averages where weights are determined by content alignment (Query-Key dot product).",
      "Causal Masking: Future tokens must be strictly isolated by masking attention logits with -inf prior to Softmax so tokens only communicate backward in time.",
      "Residual Stream as Highway: Residual connections (x = x + sublayer(x)) allow gradients to propagate unimpeded across deep stacks during backpropagation.",
      "Pre-LN Stability: Applying LayerNorm before multi-head attention and feedforward blocks (Pre-LN) stabilizes optimization without requiring delicate warmup schedules."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Tokenization & Tiny Shakespeare Dataset",
        slideConcept: "Character-level vocabulary mapping and train/val splitting",
        keyTakeaway: "Understanding discrete token sequences as integer arrays before neural projections."
      },
      {
        time: "15:40",
        seconds: 940,
        title: "The Bigram Baseline Model",
        slideConcept: "Counting transitions and cross-entropy loss evaluation",
        keyTakeaway: "Establishing the fundamental baseline loss (-ln(1/vocab_size)) to verify training convergence."
      },
      {
        time: "41:20",
        seconds: 2480,
        title: "Self-Attention Mechanism & Q/K/V Matrices",
        slideConcept: "Mathematical derivation of Queries, Keys, and Values",
        keyTakeaway: "Queries ask what to look for, Keys advertise what is present, Values communicate the actual message."
      },
      {
        time: "1:04:10",
        seconds: 3850,
        title: "Multi-Head Attention & Causal Truncation Mask",
        slideConcept: "Multiple communication channels in parallel with lower-triangular masking",
        keyTakeaway: "Multi-head attention lets tokens query different linguistic/semantic facets simultaneously."
      },
      {
        time: "1:26:00",
        seconds: 5160,
        title: "Residual Connections, LayerNorm & FeedForward",
        slideConcept: "Computation layers as additions onto the persistent residual stream",
        keyTakeaway: "The residual stream preserves representation integrity while sublayers incrementally enrich features."
      },
      {
        time: "1:45:30",
        seconds: 6330,
        title: "Scaling Up nanoGPT & Text Generation",
        slideConcept: "Hyperparameter scaling (block_size, n_embd, n_head, n_layer)",
        keyTakeaway: "Trained mini-GPT produces syntactically plausible Shakespeare passages directly from random weights."
      }
    ],
    mathDerivations: [
      {
        title: "Scaled Dot-Product Attention",
        formula: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V",
        explanation:
          "Scaling by 1/sqrt(d_k) prevents the dot products from growing excessively large in high dimensions, which would otherwise drive softmax into saturation regions with vanishing gradients.",
        codeSnippet: `# Scaled Dot-Product with Causal Masking
B, T, C = x.shape
q = self.query(x) # (B, T, head_size)
k = self.key(x)   # (B, T, head_size)
v = self.value(x) # (B, T, head_size)

wei = q @ k.transpose(-2, -1) * (1.0 / math.sqrt(k.size(-1)))
wei = wei.masked_fill(self.tril[:T, :T] == 0, float('-inf'))
wei = F.softmax(wei, dim=-1)
out = wei @ v # (B, T, head_size)`
      },
      {
        title: "Self-Attention Computational Complexity",
        formula: "\\mathcal{O}(T^2 \\cdot d)",
        explanation:
          "Because every token queries every preceding token in the sequence of length T, computing the attention matrix requires quadratic memory and compute, motivating modern linear and FlashAttention optimizations."
      }
    ],
    hnDebates: [
      {
        topic: "Why Decoder-Only Won Over Encoder-Decoder (T5 / Original Transformer)",
        consensus:
          "Decoder-only autoregressive models unify pretraining, prompting, and in-context learning with maximum computational efficiency and simplified KV-caching.",
        counterArgument:
          "For non-generative tasks like ranking or sequence classification, bidirectional encoders (BERT) still offer superior per-parameter representations.",
        topCommentQuote:
          "This single video demystified LLMs more than reading 50 research papers. It is the pinnacle of technical pedagogy.",
        author: "jeremyphoward"
      }
    ],
    obsidianFrontmatter: `---
title: "Let's build GPT: from scratch, in code, spelled out"
speaker: "Andrej Karpathy"
source: "HackerTube"
url: "https://www.hacker-tube.net/?v=karpathy-build-gpt&ref=obsidian_notes"
youtubeId: "kCc8FmEb1nY"
tags:
  - deep-learning
  - transformer
  - gpt
  - ai-architecture
  - karpathy
created: ${new Date().toISOString().slice(0, 10)}
---`
  },
  "casey-muratori-clean-code": {
    videoId: "casey-muratori-clean-code",
    executiveSummary:
      "A brutal hardware-first deconstruction of standard Clean Code OOP doctrine. Casey demonstrates with concrete AVX benchmarks how abstract class hierarchies, virtual function tables, and excessive encapsulation cause a 15x-20x performance penalty by annihilating CPU cache locality and defeating superscalar branch prediction.",
    coreMentalModels: [
      "Mechanical Sympathy: Modern CPUs are pipelined caches that thrive on contiguous linear memory arrays (Data-Oriented Design), not conceptual class hierarchies.",
      "Vtable Thrashing: Virtual dispatch forces pointer chasing through memory, causing instruction cache misses and branch mispredictions.",
      "Data Alignment > Object Abstraction: Grouping data by access frequency (Structure of Arrays) allows SIMD vectorization and optimal memory bandwidth saturation.",
      "The Cost of Convenience: Architectural dogmas that prioritize theoretical polymorphism over memory layouts impose permanent latency taxes."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "The Clean Code Dogma & Problem Statement",
        slideConcept: "Examining Robert C. Martin's clean code rules in practice",
        keyTakeaway: "Clean code rules often claim performance is negligible; Casey benchmarks real CPU cycles."
      },
      {
        time: "08:30",
        seconds: 510,
        title: "Benchmark 1: Textbook OOP Hierarchy",
        slideConcept: "Virtual shape methods with dynamic dispatch",
        keyTakeaway: "Virtual methods introduce vtable dereference overhead and prevent inlining."
      },
      {
        time: "18:20",
        seconds: 1100,
        title: "Benchmark 2: Flattened Enum Switch Table",
        slideConcept: "Direct type tagging and flat procedural loops",
        keyTakeaway: "Flattening the data structure yields an immediate 4x speedup with simpler code."
      },
      {
        time: "27:45",
        seconds: 1665,
        title: "Benchmark 3: Data-Oriented Design & SIMD AVX",
        slideConcept: "Structure of Arrays (SoA) and auto-vectorization",
        keyTakeaway: "Aligning numbers sequentially enables hardware AVX instructions to achieve 15x-20x gains."
      },
      {
        time: "36:10",
        seconds: 2170,
        title: "Engineering Trade-offs & Conclusions",
        slideConcept: "Balancing maintainability, latency, and scale",
        keyTakeaway: "Software engineers must understand hardware behavior before adopting dogmatic abstractions."
      }
    ],
    mathDerivations: [
      {
        title: "Memory Latency Hierarchy (CPU Cycles)",
        formula: "\\text{L1 Cache (~4c)} \\ll \\text{L2 (~14c)} \\ll \\text{L3 (~40c)} \\ll \\text{Main RAM (~200c)}",
        explanation:
          "Avoiding a single main memory cache miss is worth hundreds of arithmetic ALU operations. Pointer-chasing OOP architectures keep CPU execution units permanently starved of data.",
        codeSnippet: `// Virtual Dispatch vs Flat Table:
// OOP (Slow - vtable pointer indirection + call):
virtual f32 Area() = 0;

// Data-Oriented (Fast - direct array coefficient lookup):
f32 Area = CTable[Shape.Type] * Shape.Width * Shape.Height;`
      }
    ],
    hnDebates: [
      {
        topic: "Is Clean Code Still Viable in Modern Enterprise Development?",
        consensus:
          "For IO/network-bound web CRUD apps, cognitive maintainability often wins; but in games, browsers, DB engines, and AI kernels, OOP overhead is catastrophic.",
        counterArgument:
          "Premature optimization without profiling can create unmaintainable procedural spaghetti if misapplied by junior teams.",
        topCommentQuote:
          "Writing performant software requires accepting what hardware actually does, not what design patterns wish it did.",
        author: "cmuratori"
      }
    ],
    obsidianFrontmatter: `---
title: "'Clean' Code, Horrible Performance"
speaker: "Casey Muratori"
source: "HackerTube"
url: "https://www.hacker-tube.net/?v=casey-muratori-clean-code-horrible-performance&ref=obsidian_notes"
youtubeId: "tD5NrevFtbU"
tags:
  - systems
  - performance
  - data-oriented-design
  - hardware
created: ${new Date().toISOString().slice(0, 10)}
---`
  },
  "carmack-quake-graphics": {
    videoId: "carmack-quake-graphics",
    executiveSummary:
      "The definitive reverse engineering of the legendary Fast Inverse Square Root algorithm from Quake III Arena (Q_rsqrt). Demonstrates how bit-level type punning and the magic constant 0x5f3759df compute 1/sqrt(x) up to 4x faster than 1990s hardware FPUs by exploiting the IEEE 754 floating-point logarithmic structure.",
    coreMentalModels: [
      "IEEE 754 Floating-Point as Piecewise Linear Logarithm: The bitwise layout of a float naturally behaves as an affine approximation of log2(x).",
      "Bitcasting Type Punning: Interpreting 32-bit float bits as a signed integer allows logarithmic division by 2 via integer bit shifts (>> 1).",
      "Newton-Raphson Iterative Refinement: An initial crude guess can be doubled in precision with a single quadratic convergence step.",
      "The Magic Constant: 0x5f3759df is mathematically chosen to minimize the maximum absolute error across the piecewise approximation."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Historical Context: 3D Vector Normalization in Quake III",
        slideConcept: "Computing unit vectors for lighting and physics at 60 FPS",
        keyTakeaway: "Vector normalization requires dividing by magnitude, making 1/sqrt(x) the primary graphics bottleneck."
      },
      {
        time: "03:15",
        seconds: 195,
        title: "The IEEE 754 32-bit Single-Precision Bit Layout",
        slideConcept: "Sign bit (1), Biased Exponent (8), Mantissa (23)",
        keyTakeaway: "The float bit pattern translates into an affine linear approximation of the binary logarithm."
      },
      {
        time: "06:40",
        seconds: 400,
        title: "Deriving the Magic Constant 0x5f3759df",
        slideConcept: "Solving the minimax optimization problem for the log approximation",
        keyTakeaway: "The constant represents 3/2 * 2^23 * (127 - mu) minimizing the maximum relative error."
      },
      {
        time: "10:20",
        seconds: 620,
        title: "Single-Iteration Newton-Raphson Convergence",
        slideConcept: "Quadratic refinement formula y_next = y * (1.5 - 0.5 * x * y^2)",
        keyTakeaway: "One iteration reduces maximum relative error to less than 0.175% across the entire positive float domain."
      },
      {
        time: "12:45",
        seconds: 765,
        title: "Modern Assembly & Silicon Implementations",
        slideConcept: "SSE rsqrtss and hardware vector reciprocal instructions",
        keyTakeaway: "Modern silicon has dedicated reciprocal square root units, but Carmack's hack remains an intellectual monument."
      }
    ],
    mathDerivations: [
      {
        title: "Logarithmic Equivalence for Inverse Square Root",
        formula: "y = \\frac{1}{\\sqrt{x}} = x^{-1/2} \\implies \\log_2(y) = -\\frac{1}{2} \\log_2(x)",
        explanation:
          "Because floating-point bit integers represent approximate logarithms, dividing by 2 is accomplished by shifting the integer representation right by 1 bit (`i >> 1`). Subtracting from the magic constant inverts the sign and centers the approximation.",
        codeSnippet: `float Q_rsqrt(float number) {
    long i;
    float x2, y;
    const float threehalfs = 1.5F;

    x2 = number * 0.5F;
    y  = number;
    i  = * ( long * ) &y;                       // evil floating point bit level hacking
    i  = 0x5f3759df - ( i >> 1 );               // what the fuck?
    y  = * ( float * ) &i;
    y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration Newton-Raphson
    return y;
}`
      }
    ],
    hnDebates: [
      {
        topic: "Who Actually Invented the Constant (Carmack, Terje Mathisen, or Gary Tarolli)?",
        consensus:
          "Historical consensus credits Gary Tarolli (3dfx) with the derivation, while John Carmack popularized and optimized it in Quake III.",
        counterArgument:
          "Today SSE `rsqrtss` computes this directly in silicon, but understanding the algorithm remains the gold standard for hardware intuition.",
        topCommentQuote:
          "This algorithm is pure poetry in applied computer science.",
        author: "kristopolous"
      }
    ],
    obsidianFrontmatter: `---
title: "Fast Inverse Square Root: A Quake III Algorithm Deep Dive"
speaker: "Nemean"
source: "HackerTube"
url: "https://www.hacker-tube.net/?v=carmack-quake-graphics&ref=obsidian_notes"
youtubeId: "443UNeGrFoM"
tags:
  - graphics
  - algorithms
  - c-programming
  - quake
  - assembly
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
url: "https://www.hacker-tube.net/?v=${videoId}&ref=obsidian_notes"
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
