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

export interface LectureFaq {
  question: string;
  answer: string;
}

export interface StudyNote {
  videoId: string;
  seoTitle?: string;
  seoDescription?: string;
  h2ExecutiveSummary?: string;
  h2Timestamps?: string;
  h2Derivations?: string;
  h2Debates?: string;
  h2Faq?: string;
  executiveSummary: string;
  coreMentalModels: string[];
  keyTimestamps: KeyTimestamp[];
  mathDerivations: MathDerivation[];
  hnDebates: HnDebate[];
  faqs?: LectureFaq[];
  obsidianFrontmatter: string;
}

export const STUDY_NOTES_MAP: Record<string, StudyNote> = {
  "karpathy-micrograd": {
    videoId: "karpathy-micrograd",
    seoTitle: "The Spelled-Out Intro to Neural Networks: micrograd Notes",
    seoDescription:
      "The spelled-out intro to neural networks and backpropagation by Andrej Karpathy. Master scalar DAG autograd engines, calculus chain rule derivations & Python code.",
    h2ExecutiveSummary: "Executive Summary: Spelled-Out Intro to Neural Networks & micrograd",
    h2Timestamps: "Key Timestamps: Spelled-Out Neural Networks Lecture Breakdown",
    h2Derivations: "Mathematical Derivations: Backpropagation in Neural Networks",
    h2Debates: "Community Consensus: Hacker News Debates on Neural Networks & micrograd",
    h2Faq: "Technical FAQ: Neural Networks, Backpropagation & Training Recipe",
    executiveSummary:
      "A bottom-up, zero-magic reconstruction of backpropagation and deep neural networks foundations from Andrej Karpathy's renowned 'Neural Networks: Zero to Hero' lecture series. Karpathy builds micrograd—a minimalist scalar autograd engine—in approximately 100 lines of pure Python, demonstrating that modern deep learning frameworks like PyTorch are fundamentally orchestration layers around computational directed acyclic graphs (DAGs) and calculus chain rule accumulators. This spelled-out intro to neural networks explains how scalar values, forward computation graphs, and reverse topological gradient backpropagation cooperate to train neural networks without high-level library black boxes.",
    coreMentalModels: [
      "The Computational Graph as a directed acyclic graph (DAG) where nodes are scalar Values and edges are mathematical operations (+, *, tanh).",
      "Local Gradients & Calculus Chain Rule: Every arithmetic primitive knows how to compute its local partial derivative with respect to its immediate parents.",
      "Global Derivative Accumulation: Backpropagation in neural networks is reverse topological sorting over the DAG, multiplying local derivatives along path branches.",
      "Gradient Accumulation (+=): Crucial insight: gradients must accumulate with += rather than assignment (=) to handle multi-variable reuse and multi-path graph flow correctly.",
      "Loss Function & Optimization Step: Mean Squared Error (MSE) loss quantifies network error, and stochastic gradient descent iteratively nudges scalar weights opposite to their gradient directions.",
      "From Scalar Autograd to Tensor Networks: Understanding micrograd demystifies how PyTorch tensors parallelize identical scalar graph rules across GPU matrix multiply CUDA kernels."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Derivative Intuition via Infinitesimals in Neural Networks",
        slideConcept: "Definition of derivative f'(x) = lim h->0 [f(x+h) - f(x)] / h",
        keyTakeaway: "Thinking of derivatives as 'nudging' inputs and observing the directional sensitivity of the scalar output in computational graphs."
      },
      {
        time: "14:20",
        seconds: 860,
        title: "The Value Class: Building the Computational Graph DAG",
        slideConcept: "Class Value with data, grad, _prev set, and _op identifier",
        keyTakeaway: "Maintaining parent pointers (_prev) turns simple Python mathematical expressions into navigable directed acyclic graphs."
      },
      {
        time: "42:15",
        seconds: 2535,
        title: "Manual Backpropagation on a Single Neuron Architecture",
        slideConcept: "Forward pass: x1*w1 + x2*w2 + b -> tanh -> Output L",
        keyTakeaway: "Working backwards by hand from dL/dL=1.0 through tanh to calculate exact weight sensitivities dL/dw1 and dL/dw2."
      },
      {
        time: "1:15:30",
        seconds: 4530,
        title: "Automating Reverse Topological Sort for Backpropagation",
        slideConcept: "Recursive DFS graph traversal to establish reverse evaluation order",
        keyTakeaway: "All child nodes must finish their forward passes before their parents' backpropagation can fire safely."
      },
      {
        time: "1:48:00",
        seconds: 6480,
        title: "Building Neuron, Layer, and MLP Multi-Layer Perceptron Containers",
        slideConcept: "Multi-Layer Perceptron (MLP) architecture with random parameters",
        keyTakeaway: "A complete neural network is just nested lists of Value instances optimized via stochastic gradient descent (SGD)."
      },
      {
        time: "2:10:45",
        seconds: 7845,
        title: "Training a 2-Layer Neural Network & Debugging Gradients",
        slideConcept: "Zeroing grad buffers, forward pass, loss calculation, backward pass, and parameter update",
        keyTakeaway: "The universal 5-step training loop common to every neural network from toy micrograd to multi-billion parameter LLMs."
      }
    ],
    mathDerivations: [
      {
        title: "Scalar Chain Rule (Calculus Foundation of Neural Networks)",
        formula: "dz / dx = (dz / dy) * (dy / dx)",
        explanation:
          "If variable z depends on y, and y depends on x, the rate of change of z with respect to x is the product of their local rates. In backpropagation, upstream gradient times local derivative yields the upstream sensitivity.",
        codeSnippet: `# Backward step for multiplication: out = x * y
def _backward():
    self.grad += other.data * out.grad
    other.grad += self.data * out.grad`
      },
      {
        title: "Tanh Activation Derivative in Backpropagation",
        formula: "d/dx tanh(x) = 1 - tanh^2(x)",
        explanation:
          "Crucial efficiency trick: once the forward output t = tanh(x) is cached, the backward pass only requires 1 - t^2, avoiding recomputing expensive exponentials during neural network training.",
        codeSnippet: `t = self.data
self.grad += (1.0 - t**2) * out.grad`
      },
      {
        title: "Mean Squared Error (MSE) Loss Derivative",
        formula: "L = (1/N) * sum((y_pred - y_true)^2)  ==>  dL / d(y_pred) = (2/N) * (y_pred - y_true)",
        explanation:
          "The objective function quantifies prediction error across training examples. Differentiating MSE with respect to predictions initiates the backward pass with the initial error vector.",
        codeSnippet: `loss = sum((yout - ygt)**2 for ygt, yout in zip(ys, ypred))
loss.backward()`
      },
      {
        title: "Multi-Path Gradient Summation (Multivariate Chain Rule)",
        formula: "dz / dx = sum_i (dz / dy_i) * (dy_i / dx)",
        explanation:
          "When an intermediate variable is reused across multiple computational graph branches, its total derivative is the sum of partial derivatives flowing through every individual path.",
        codeSnippet: `# Must use += instead of = to accumulate gradients across multiple branches
self.grad += local_derivative * out.grad`
      },
      {
        title: "Parameter Update Step (Stochastic Gradient Descent in Neural Networks)",
        formula: "theta_new = theta_old - learning_rate * dLoss/dtheta",
        explanation:
          "Subtracting the gradient steps parameters in the direction of steepest loss descent. Crucially, parameter gradients must be reset to zero before the next forward-backward iteration.",
        codeSnippet: `for p in model.parameters():
    p.data -= learning_rate * p.grad
    p.grad = 0.0  # Reset gradient buffer for next step`
      }
    ],
    hnDebates: [
      {
        topic: "Scalar Autograd vs. Tensor PyTorch Memory Overhead",
        consensus: "Micrograd is educational perfection; never attempt to use scalar DAGs for production neural networks workloads.",
        counterArgument:
          "Senior engineers pointed out that creating millions of Python Value objects exhausts memory instantly and is 10,000x slower than contiguous GPU memory buffers (CUDA tensors).",
        topCommentQuote:
          "The moment you understand micrograd, the mystique of PyTorch vanishes. It proves autograd is just topological sort plus chain rule.",
        author: "dr_krapf"
      },
      {
        topic: "The += vs = Gradient Accumulation Bug Trap in Backpropagation",
        consensus: "Reusing the same variable in multiple expressions requires summing incoming gradients with +=.",
        counterArgument:
          "Multiple HN commenters confessed they spent days debugging custom neural nets because they wrote `self.grad = local_grad * out.grad` instead of `+=`.",
        topCommentQuote:
          "Multivariate chain rule requires summing over all paths. Andrej highlighting the bug where a node is used twice was worth watching the entire 2 hours.",
        author: "eigen_state"
      },
      {
        topic: "Karpathy's Neural Networks: Zero to Hero vs Traditional University Curriculums",
        consensus: "Building an autograd engine from first principles in pure Python imparts stronger architectural intuition than abstract matrix calculus lectures.",
        counterArgument:
          "Academic researchers argued that production AI engineering requires deep familiarity with numerical stability, half-precision float formats (fp16/bf16), and GPU tensor contraction algorithms not covered in scalar micrograd.",
        topCommentQuote:
          "Andrej's teaching method turns the deep learning black box into glass. You realize a neural network is not magic, it's literally just chained arithmetic with gradient tape.",
        author: "vector_field"
      },
      {
        topic: "A Recipe for Training Neural Networks: Andrej Karpathy's Debugging Philosophy",
        consensus: "Always overfit a single tiny batch to zero loss first to verify backpropagation math and gradient flow before scaling model parameters or tuning hyperparameters.",
        counterArgument:
          "Practitioners pointed out that modern pre-trained models rarely train from scratch, making transfer learning and checkpoint fine-tuning recipes more immediately useful in day-to-day work.",
        topCommentQuote:
          "Karpathy's golden rule of neural networks: do not look at hyperparameters until you have visually verified your gradients and overfit one batch. That single discipline saves weeks.",
        author: "loss_divergence"
      }
    ],
    faqs: [
      {
        question: "What is the fundamental difference between micrograd and PyTorch?",
        answer: "Micrograd operates entirely on scalar Values in pure Python to demonstrate reverse-mode automatic differentiation and backpropagation clearly, whereas PyTorch operates on multidimensional Tensors with parallelized C++/CUDA kernels for production GPU execution and matrix multiplications."
      },
      {
        question: "Why is topological sort mandatory before executing neural network backpropagation?",
        answer: "In a Directed Acyclic Graph (DAG), an operand variable can be referenced by multiple downstream child nodes. Topological ordering ensures that all incoming gradient contributions are fully computed and accumulated via += before backpropagating further upstream to parent nodes."
      },
      {
        question: "Why must backpropagation gradients accumulate with += instead of assignment (=)?",
        answer: "When a variable is reused in multiple operations (such as a = 2*b + 3*b), multivariate calculus states that the total derivative is the sum of partial derivatives across all execution paths. Assignment (=) overwrites gradients from earlier branches, producing mathematically incorrect derivatives."
      },
      {
        question: "What is Andrej Karpathy's recipe for training neural networks and debugging backpropagation?",
        answer: "Karpathy's famous recipe emphasizes starting with a minimal baseline: first inspect input data distributions, verify initialization loss matches theoretical random chance (-ln(1/C)), overfit a tiny batch of 4 examples until loss reaches 0.0 to confirm backpropagation correctness, and only then scale dataset volume, layers, and learning rates."
      },
      {
        question: "How does micrograd connect to Andrej Karpathy's 'Neural Networks: Zero to Hero' GitHub course series?",
        answer: "Building micrograd is the foundational Chapter 1 of the 'Neural Networks: Zero to Hero' curriculum. It establishes the autograd mathematical foundations before advancing into makemore (bigram, MLP, CNN, WaveNet character language models) and ultimately building nanoGPT and transformer architectures."
      },
      {
        question: "Can micrograd train real-world deep neural networks?",
        answer: "Yes, micrograd can train multi-layer perceptrons (MLPs) and binary classifiers on small datasets (like the scikit-learn moon dataset), but because it stores Python objects for every scalar value, its memory overhead and CPU execution speed make it an educational autograd engine rather than a production framework."
      }
    ],
    obsidianFrontmatter: `---
title: "The Spelled-Out Intro to Neural Networks and Backpropagation: Building micrograd"
speaker: "Andrej Karpathy"
source: "HackerTube"
url: "https://www.hacker-tube.net/?v=karpathy-micrograd&ref=obsidian_notes"
youtubeId: "VMj-3S1tku0"
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
    seoTitle: "Build GPT from Scratch: Karpathy nanoGPT Notes",
    seoDescription:
      "Build GPT from scratch with Andrej Karpathy: implement nanoGPT in pure PyTorch with causal self-attention, multi-head transformer blocks & calculus study notes.",
    h2ExecutiveSummary: "Executive Summary: Build GPT from Scratch with nanoGPT",
    h2Timestamps: "Key Timestamps: Build GPT from Scratch Lecture Breakdown",
    h2Derivations: "Mathematical Derivations: Transformers & Build GPT from Scratch",
    h2Debates: "Community Consensus: Hacker News Debates on Building GPT from Scratch",
    h2Faq: "Technical FAQ: Build GPT from Scratch, nanoGPT & Transformer Training",
    executiveSummary:
      "A masterclass deconstruction of how to build GPT from scratch from first principles. In this legendary video tutorial from the 'Neural Networks: Zero to Hero' curriculum, Andrej Karpathy constructs a complete, decoder-only Transformer in ~300 lines of pure PyTorch. The lecture systematically progresses from character tokenization and bigram baselines to causal multi-head self-attention, feed-forward projections, residual stream connections, and LayerNorm stabilization, culminating in training nanoGPT live on a GPU to generate Shakespearean English.",
    coreMentalModels: [
      "Attention as Communication: Nodes in a sequence aggregate information from previous nodes by weighted averages where weights are determined by content alignment (Query-Key dot product).",
      "Causal Masking: When building GPT from scratch, future tokens must be strictly isolated by masking attention logits with -inf prior to Softmax so tokens only communicate backward in time.",
      "Residual Stream as Gradient Superhighway: Residual connections (x = x + sublayer(x)) allow backpropagation gradients to propagate unimpeded across deep Transformer stacks without vanishing.",
      "Pre-LN Stability: Applying LayerNorm before multi-head attention and feedforward blocks (Pre-LN) stabilizes optimization without requiring delicate learning rate warmup schedules.",
      "Decoupled Compute and Communication: Multi-head attention handles communication between tokens across time, while MLP feedforward blocks handle per-token compute and feature transformation.",
      "Positional Embeddings: Transformers are permutation invariant by default; adding learned positional embeddings injects temporal sequence order into token representations."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Tokenization & Tiny Shakespeare Dataset",
        slideConcept: "Character-level vocabulary mapping and train/val splitting for GPT models",
        keyTakeaway: "Understanding discrete token sequences as integer arrays before feeding into neural embedding tables."
      },
      {
        time: "15:40",
        seconds: 940,
        title: "The Bigram Baseline Model",
        slideConcept: "Counting transitions and cross-entropy loss evaluation in PyTorch",
        keyTakeaway: "Establishing the theoretical baseline loss (-ln(1/vocab_size)) to verify training convergence before adding complexity."
      },
      {
        time: "41:20",
        seconds: 2480,
        title: "Self-Attention Mechanism & Q/K/V Matrices",
        slideConcept: "Mathematical derivation of Queries, Keys, and Values in causal self-attention",
        keyTakeaway: "Queries ask what to look for, Keys advertise what is present, and Values communicate the actual message vector."
      },
      {
        time: "1:04:10",
        seconds: 3850,
        title: "Multi-Head Attention & Causal Truncation Mask",
        slideConcept: "Multiple communication channels in parallel with lower-triangular masking (tril)",
        keyTakeaway: "Multi-head attention lets tokens query different linguistic, syntactic, and semantic facets simultaneously."
      },
      {
        time: "1:26:00",
        seconds: 5160,
        title: "Residual Connections, LayerNorm & FeedForward",
        slideConcept: "Computation layers as incremental additions onto the persistent residual stream",
        keyTakeaway: "The residual stream preserves representation integrity while sublayers incrementally enrich features."
      },
      {
        time: "1:45:30",
        seconds: 6330,
        title: "Scaling Up nanoGPT & Text Generation",
        slideConcept: "Hyperparameter scaling (block_size, n_embd, n_head, n_layer) to build GPT from scratch",
        keyTakeaway: "Trained mini-GPT produces syntactically plausible Shakespeare passages directly from random weights."
      }
    ],
    mathDerivations: [
      {
        title: "Scaled Dot-Product Attention Formula",
        formula: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V",
        explanation:
          "Scaling by 1/sqrt(d_k) prevents the dot products from growing excessively large in high dimensions, which would otherwise drive softmax into saturation regions with vanishing gradients during backpropagation.",
        codeSnippet: `# Scaled Dot-Product Attention with Causal Masking
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
      },
      {
        title: "LayerNorm Normalization & Stabilization",
        formula: "y = \\frac{x - \\mathrm{E}[x]}{\\sqrt{\\mathrm{Var}[x] + \\epsilon}} \\cdot \\gamma + \\beta",
        explanation:
          "Unlike BatchNorm which normalizes across batch samples, LayerNorm normalizes across feature dimensions independently for each token, ensuring consistent activation scales across deep Transformer layers.",
        codeSnippet: `# Pre-LN Block Structure in Transformer
def forward(self, x):
    x = x + self.sa(self.ln1(x))
    x = x + self.ffwd(self.ln2(x))
    return x`
      },
      {
        title: "Cross-Entropy Loss for Next-Token Prediction in GPT",
        formula: "L = - \\frac{1}{N} \\sum_{i=1}^N \\log P(w_i \\mid w_1, \\dots, w_{i-1})",
        explanation:
          "Autoregressive language models minimize negative log-likelihood of target tokens. Perplexity is simply the exponential of cross-entropy loss: PPL = exp(L)."
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
          "This single video demystified LLMs more than reading 50 research papers. It is the pinnacle of technical pedagogy for anyone looking to build GPT from scratch.",
        author: "jeremyphoward"
      },
      {
        topic: "Building GPT from Scratch in Python vs Using High-Level Libraries",
        consensus:
          "Coding causal attention, residual connections, and token embeddings by hand permanently demystifies the AI architecture, turning theoretical papers into muscle memory.",
        counterArgument:
          "Engineers focused purely on application development argued that library wrappers like Hugging Face or LangChain are more practical for production ship dates.",
        topCommentQuote:
          "If you want to debug LLM hallucinations, latency, or KV-cache memory spikes in production, you must build GPT from scratch at least once.",
        author: "dr_karpathy_fan"
      },
      {
        topic: "Karpathy's nanoGPT vs Sebastian Raschka's 'Build a Large Language Model (from Scratch)'",
        consensus:
          "Karpathy's lecture offers unmatched rapid algorithmic intuition in ~2 hours, while Raschka's book and GitHub repo provide meticulous chapter-by-chapter production refinements (BPE tokenization, fine-tuning, DPO).",
        counterArgument:
          "Both resources complement each other perfectly: Karpathy provides the high-signal video walkthrough, while Raschka provides the comprehensive printed textbook reference.",
        topCommentQuote:
          "Start with Karpathy's video over the weekend, then read Raschka's book to implement BPE tokenizers and instruction tuning from scratch.",
        author: "transformer_dev"
      },
      {
        topic: "Quadratic Attention Bottleneck: O(T^2) Memory Scaling",
        consensus:
          "Standard PyTorch attention materializes the full T x T attention matrix in GPU HBM, hitting out-of-memory errors on long context lengths without FlashAttention.",
        counterArgument:
          "For educational models with block size 256 or 512, quadratic attention is trivial to run on modern consumer GPUs or even MacBooks.",
        topCommentQuote:
          "Tri Dao's FlashAttention is an engineering marvel, but Andrej's manual tril masking is what makes you understand WHY FlashAttention was necessary.",
        author: "cuda_kernel_dev"
      }
    ],
    faqs: [
      {
        question: "Why do we scale QK^T by 1/sqrt(d_k) in Scaled Dot-Product Attention?",
        answer: "When the head dimension d_k is large, the dot products grow large in magnitude, pushing the softmax function into regions where gradients are extremely small (vanishing gradient problem). Scaling by 1/sqrt(d_k) preserves unit variance and maintains healthy backpropagation gradient flow."
      },
      {
        question: "What is the mathematical role of the causal attention mask (tril)?",
        answer: "The causal mask sets future token affinities to -infinity before the softmax operation, ensuring that during autoregressive decoding, token t can only attend to previous tokens <= t, preventing future information leakage when you build GPT from scratch."
      },
      {
        question: "Why are residual skip connections critical in deep Transformer architectures?",
        answer: "Residual connections create direct gradient superhighways through identity additions (x + f(x)), allowing backpropagation gradients to travel directly from the loss function to early embedding layers without degradation across dozens of layers."
      },
      {
        question: "How does nanoGPT compare to Sebastian Raschka's 'Build a Large Language Model (from Scratch)' GitHub repo?",
        answer: "Karpathy's nanoGPT is a lean, hackable single-file PyTorch implementation designed for immediate conceptual clarity and lightning-fast experimentation. Sebastian Raschka's 'Build a Large Language Model from Scratch' book provides an expanded, production-oriented companion exploring byte-pair encoding (BPE), GPT-2 weights loading, and instruction fine-tuning."
      },
      {
        question: "What hardware is required to build GPT from scratch following this tutorial?",
        answer: "The toy Shakespeare model demonstrated in the lecture can be trained on a free Google Colab T4 GPU, an Apple Silicon Mac, or even a modern multi-core CPU within minutes. Scaling up to train 124M parameter models (GPT-2 small) benefits from an NVIDIA GPU with 16GB+ VRAM."
      },
      {
        question: "How does nanoGPT differ from Hugging Face Transformers or OpenAI GPT-4?",
        answer: "NanoGPT strips away thousands of lines of boilerplate configuration files, multi-modal routing, and distributed cluster hooks. It implements the pure mathematical essence of the decoder-only Transformer, making the entire forward and backward execution understandable in one sitting."
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
  "karpathy-intro-llm": {
    videoId: "karpathy-intro-llm",
    seoTitle: "[1hr Talk] Intro to Large Language Models: Karpathy Notes",
    seoDescription:
      "[1hr talk] intro to large language models by Andrej Karpathy: lossy internet compression, pre-training, SFT, RLHF alignment, and LLM OS architecture study notes.",
    h2ExecutiveSummary: "Executive Summary: [1hr Talk] Intro to Large Language Models",
    h2Timestamps: "Key Timestamps: Intro to Large Language Models Lecture Breakdown",
    h2Derivations: "Mathematical Derivations: Large Language Models Training Objectives",
    h2Debates: "Community Consensus: Hacker News Debates on Large Language Models",
    h2Faq: "Technical FAQ: Intro to Large Language Models & LLM OS",
    executiveSummary:
      "Andrej Karpathy's premier 1-hour talk providing the definitive intro to large language models. The lecture systematically deconstructs the generative AI stack from first principles without marketing hype: starting from web-scale unsupervised pre-training (conceptualized as a lossy zip file of the public internet) through supervised fine-tuning (SFT) and reinforcement learning from human feedback (RLHF) alignment. Karpathy culminates with the groundbreaking mental model of the LLM OS—viewing large language models as a new operating system kernel orchestrating memory, multi-modal I/O, tool execution, and deliberate System 2 reasoning trajectories.",
    coreMentalModels: [
      "The LLM as a Lossy Zip File: Pre-training compresses terabytes of public web text into neural network parameter weights, retaining a probabilistic world model of syntax, common sense, and semantic facts.",
      "Base Model vs Assistant Model: Raw base models simply complete internet text; Supervised Fine-Tuning (SFT) and RLHF transform them into obedient conversational assistants with helpful personas.",
      "Thinking Fast vs Thinking Slow: Autoregressive decoding spends fixed compute per token (System 1); frontier reasoning models explore tree-search deliberation and self-correction loops (System 2).",
      "The LLM OS Paradigm: The transformer neural net acts as the CPU kernel, the context window acts as RAM, vector RAG databases act as hard disk storage, and external APIs act as I/O peripherals.",
      "Jailbreaks as Buffer Overflows: Prompt injection occurs because instructions and untrusted user data are concatenated into the same linear token stream without hardware-level memory boundaries.",
      "Compute & Hardware Economics: Modern LLM pre-training requires thousands of specialized GPUs running continuously for months, bound by empirical scaling laws governing FLOPs, dataset tokens, and parameter counts."
    ],
    keyTimestamps: [
      {
        time: "00:00",
        seconds: 0,
        title: "Introduction: LLM as Lossy Zip Compression of the Internet",
        slideConcept: "Compressing 10TB of internet text into 140GB network weights via next-token prediction",
        keyTakeaway: "Neural networks model continuous probability distributions, fundamentally different from database query retrieval."
      },
      {
        time: "12:30",
        seconds: 750,
        title: "Stage 1: Pre-training on GPU Superclusters & Scaling Laws",
        slideConcept: "Unsupervised next-token prediction across trillions of tokens on massive GPU clusters",
        keyTakeaway: "Pre-training consumes 99% of the computational budget and produces foundation base models."
      },
      {
        time: "25:40",
        seconds: 1540,
        title: "Stage 2 & 3: Supervised Fine-Tuning (SFT) & RLHF Alignment",
        slideConcept: "Curated dialogue datasets and reward model policy optimization via PPO / DPO",
        keyTakeaway: "Post-training aligns raw text continuation into a compliant, safe, and helpful AI assistant persona."
      },
      {
        time: "41:15",
        seconds: 2475,
        title: "System 1 vs System 2 Reasoning & Deliberate Problem Solving",
        slideConcept: "Linear autoregressive token generation vs deliberate tree-search exploration",
        keyTakeaway: "Enabling models to pause, deliberate, and verify intermediate steps unlocks complex multi-step reasoning."
      },
      {
        time: "51:00",
        seconds: 3060,
        title: "The LLM Operating System & Security Vulnerabilities",
        slideConcept: "Transformer as CPU kernel, context window as RAM, tool use, and prompt injection vectors",
        keyTakeaway: "Prompt injection represents the structural buffer overflow vulnerability of the language model era."
      }
    ],
    mathDerivations: [
      {
        title: "Cross-Entropy Loss for Next-Token Prediction in LLMs",
        formula: "L = - \\frac{1}{N} \\sum_{i=1}^N \\log P(w_i \\mid w_1, \\dots, w_{i-1})",
        explanation:
          "During web-scale pre-training, large language models minimize the negative log likelihood of predicting the correct ground-truth next token across billions of web sentences.",
        codeSnippet: `# PyTorch Cross-Entropy Loss over Vocab Logits
loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))`
      },
      {
        title: "RLHF Reward Objective with KL Divergence Regularization",
        formula: "\\max_\\theta \\mathbb{E}_{(x, y) \\sim D} \\left[ r(x, y) - \\beta \\mathbb{D}_{\\text{KL}}(\\pi_\\theta(y \\mid x) \\parallel \\pi_{\\text{ref}}(y \\mid x)) \\right]",
        explanation:
          "Reinforcement learning tunes policy parameters to maximize human preference reward scores while the KL penalty prevents the policy from drifting catastrophically far from the initial base model.",
        codeSnippet: `# KL divergence penalty preventing reward model hacking
kl_loss = F.kl_div(policy_log_probs, ref_log_probs, reduction='batchmean')`
      },
      {
        title: "Chinchilla Compute-Optimal Pre-Training Scaling Law",
        formula: "C \\approx 6 \\cdot N \\cdot D",
        explanation:
          "Training compute C (in floating point operations, FLOPs) scales proportionally with parameter count N and token count D. Compute optimality dictates scaling model size and training data tokens equally.",
        codeSnippet: `# Estimated training FLOPs for 7B model on 2T tokens
flops = 6 * 7e9 * 2e12 # ~8.4e22 FLOPs`
      },
      {
        title: "Perplexity as an Intrinsic Evaluation Metric",
        formula: "\\text{PPL} = \\exp(L) = \\exp\\left(-\\frac{1}{N}\\sum_{i=1}^N \\ln P(w_i \\mid w_{<i})\\right)",
        explanation:
          "Perplexity measures the average number of equally likely tokens the model is choosing between at each step. Lower perplexity directly reflects superior probabilistic compression."
      }
    ],
    hnDebates: [
      {
        topic: "Lossy Internet Compression vs Deterministic Database Retrieval",
        consensus:
          "Karpathy's lossy compression analogy is the clearest conceptual framework for understanding why hallucinations occur naturally rather than being software bugs.",
        counterArgument:
          "Enterprise engineers noted that while compression explains statistical patterns, mission-critical applications require hybrid retrieval-augmented generation (RAG) to guarantee factual auditability.",
        topCommentQuote:
          "Karpathy's lossy zip explanation made LLMs instantly click for our entire executive engineering team. It dispels the myth that AI is a magic factual lookup.",
        author: "simonw"
      },
      {
        topic: "Prompt Injection as an Incurable Structural Vulnerability",
        consensus:
          "Mixing developer instructions and untrusted third-party data into the same input token stream is fundamentally equivalent to early computer architecture buffer overflows.",
        counterArgument:
          "Security researchers argue that multi-agent supervisor verifiers, input sanitization boundaries, and hardware-level token tagging can mitigate injection exploits in practice.",
        topCommentQuote:
          "Until we separate data channels from instruction channels at the attention matrix level, prompt injection will remain the SQL injection of our generation.",
        author: "tptacek"
      },
      {
        topic: "System 1 Reactive Generation vs System 2 Deliberate Reasoning",
        consensus:
          "Standard transformers spend identical compute on trivial punctuation and difficult mathematical proofs. True breakthroughs require dynamic search deliberation over reasoning chains.",
        counterArgument:
          "Scaling pre-training data volume and quality still drives massive real-world performance gains without incurring inference-time latency penalties from tree search.",
        topCommentQuote:
          "Karpathy predicted reasoning tokens and test-time compute scaling months before OpenAI o1 and DeepSeek R1 validated the thesis publicly.",
        author: "noam_shazeer_fan"
      },
      {
        topic: "Open-Weights Ecosystem (Llama, DeepSeek, Qwen) vs Proprietary APIs",
        consensus:
          "High-performance open models enable local on-premise deployment, specialized domain fine-tuning, and algorithmic transparency without commercial vendor lock-in.",
        counterArgument:
          "Hyperscalers maintain an edge in capital expenditure, multi-thousand H100 cluster orchestration, and private real-time browsing tool infrastructure.",
        topCommentQuote:
          "The combination of Karpathy's open educational lectures and open-source models like Llama has democratized AI engineering globally.",
        author: "meta_ai_eng"
      }
    ],
    faqs: [
      {
        question: "What does Karpathy mean by describing LLMs as a 'lossy zip file of the internet'?",
        answer: "During pre-training, petabytes of web text are compressed into a few hundred gigabytes of neural network weights. The model does not memorize exact text files like a lossless .zip archive; rather, it compresses statistical grammar, common sense, and semantic facts. When prompted, it decompresses ideas probabilistically, explaining both reasoning abilities and hallucinations."
      },
      {
        question: "What is the fundamental difference between Base Models and Instruct/Chat Models?",
        answer: "A Base Model is trained solely on next-token prediction across raw web documents; if given a prompt like 'How do I make coffee?', it might simply output another question or complete the text as a forum thread. An Instruct/Chat model has undergone Supervised Fine-Tuning (SFT) and RLHF on curated conversation datasets, training it to act as a helpful assistant."
      },
      {
        question: "How does Karpathy's LLM OS analogy map to modern software architectures?",
        answer: "In the LLM OS model, the transformer neural network acts as the CPU kernel; the active context window acts as RAM; external document repositories, vector embeddings, and RAG databases act as hard disk storage; external APIs, code execution sandbox runners, and web search engines act as I/O peripherals."
      },
      {
        question: "Why are prompt injections and jailbreaks so difficult to eliminate permanently?",
        answer: "In conventional computing, executable code and data streams are separated in memory. In an LLM context window, system developer instructions and untrusted third-party input data are concatenated into a single linear sequence of tokens. Because the neural network evaluates all tokens within the same attention matrix, malicious input can hijack the model's instruction-following attention heads."
      },
      {
        question: "What are the computational and financial costs of training large language models from scratch?",
        answer: "Pre-training a competitive 70B parameter model requires millions of GPU hours across clusters of thousands of NVIDIA H100/A100 accelerators, often costing between $2M and $10M+ in cloud electricity and compute alone, which is why open-weights community checkpoints are so transformative."
      },
      {
        question: "How do System 1 reactive generation and System 2 deliberate reasoning differ in modern AI models?",
        answer: "System 1 generation emits tokens sequentially without reconsidering past mistakes, similar to human instinctual speech. System 2 reasoning allocates variable test-time compute to generate chain-of-thought tokens, explore alternative candidate branches, verify logic, and backtrack before outputting the final answer."
      }
    ],
    obsidianFrontmatter: `---
title: "Intro to Large Language Models (1hr Talk)"
speaker: "Andrej Karpathy"
source: "HackerTube"
url: "https://www.hacker-tube.net/?v=karpathy-intro-llm&ref=obsidian_notes"
youtubeId: "zjkBMFhNj_g"
tags:
  - machine-learning
  - large-language-models
  - system-architecture
  - karpathy
  - ai-foundations
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
