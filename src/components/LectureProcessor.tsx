import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  HelpCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Plus,
  Zap,
  BookMarked,
  Sliders,
  AlertCircle,
  X,
  Award,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { LectureSummary, DetectedDeadline, ExamQuestion } from "../types";
import { SAMPLE_LECTURES } from "../data/initialData";
import { downloadMarkdownFile, downloadJSONFile } from "../utils/exportNotes";

interface LectureProcessorProps {
  onAddTasks: (deadlines: DetectedDeadline[]) => void;
  onSelectTab: (tab: "dashboard" | "summarizer" | "tasks" | "calendar" | "study-groups") => void;
}

const COURSES = [
  "Computer Science (CS 201)",
  "Molecular Biology (BIO 110)",
  "Macroeconomics (ECON 102)",
  "Calculus & Linear Algebra (MATH 220)",
  "Organic Chemistry (CHEM 204)",
  "World History (HIST 150)",
  "Data Science & Machine Learning",
  "General / Custom Course"
];

// Initial default exam questions for CS 201 to make the tab immediately interactive
const DEFAULT_CS_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: "eq-1",
    question: "Explain why Dijkstra's algorithm fails in the presence of negative edge weights. Contrast its invariant with the Bellman-Ford algorithm.",
    questionType: "Conceptual Breakdown",
    relevanceScore: "High Yield (98% Exam Probability)",
    marks: 8,
    modelAnswer: `1. Failure Mechanism in Dijkstra's Algorithm:\n• Dijkstra operates on a greedy invariant: once a vertex u is extracted from the min-priority queue (Binary/Fibonacci Heap), its tentative distance dist[u] is guaranteed to be optimal and will never decrease.\n• In the presence of negative edge weights, an unvisited or downstream edge could offer a path that retroactively reduces the distance to an already finalized vertex. Because Dijkstra never revisits finalized nodes, it produces sub-optimal or invalid shortest path calculations.\n\n2. Contrast with Bellman-Ford Algorithm:\n• Relaxation Strategy: Bellman-Ford does not use a greedy priority queue. Instead, it relaxes all |E| edges across |V| - 1 successive iterations.\n• Negative Cycles: Bellman-Ford runs a |V|-th pass. If any edge can still be relaxed on the |V|-th iteration, a negative-weight cycle exists, and the algorithm flags an error.\n• Time Complexity: Dijkstra with binary heap runs in O((V + E) log V), whereas Bellman-Ford runs in O(V * E). Bellman-Ford accepts higher computational overhead to guarantee correctness under arbitrary negative weights without negative cycles.`,
    keyRubricPoints: [
      "Explicit statement of Dijkstra's greedy invariant regarding finalized vertices (2 marks)",
      "Concrete explanation of how negative edges violate the triangular inequality/finality (2 marks)",
      "Detailed description of Bellman-Ford's (V - 1) edge relaxation passes (2 marks)",
      "Explanation of the |V|-th pass negative-weight cycle detection mechanism (1 mark)",
      "Correct time complexity comparison: O((V+E)log V) vs O(V*E) (1 mark)"
    ],
    commonPitfalls: "Students often state that Dijkstra loops infinitely on negative weights. In reality, it terminates normally without an infinite loop, but yields mathematically incorrect shortest distances."
  },
  {
    id: "eq-2",
    question: "Compare Adjacency Matrix and Adjacency List graph representations in terms of space complexity, edge existence queries, and neighbor traversals. When should each be chosen?",
    questionType: "Compare & Contrast",
    relevanceScore: "High Yield (95% Exam Probability)",
    marks: 6,
    modelAnswer: `1. Comparative Complexity Analysis:\n\n• Adjacency Matrix (2D Array of size |V| x |V|):\n  - Space Complexity: Theta(V^2), independent of the number of edges |E|.\n  - Edge Existence Query (is (u, v) in E?): O(1) direct lookup.\n  - Listing All Neighbors of Vertex u: Theta(V) requires scanning an entire row.\n\n• Adjacency List (Array of size |V| pointing to linked lists/dynamic arrays):\n  - Space Complexity: Theta(V + E) strictly proportional to vertex count plus edge count.\n  - Edge Existence Query: O(deg(u)), requiring traversal of u's neighbor list.\n  - Listing All Neighbors of Vertex u: Theta(deg(u)) optimal runtime.\n\n2. Selection Criteria in System Design:\n• Choose Adjacency Matrix when the graph is dense (|E| approaches |V|^2), or when constant-time O(1) edge lookups/modifications are mission critical.\n• Choose Adjacency List for sparse real-world graphs (e.g. social networks, road networks, internet web graphs) where |E| << |V|^2 to avoid quadratic memory exhaustion.`,
    keyRubricPoints: [
      "Accurate space complexity for both structures using Theta notation (2 marks)",
      "Precise edge-existence lookup complexity: O(1) vs O(deg(u)) (2 marks)",
      "Neighbor iteration runtime comparison: Theta(V) vs Theta(deg(u)) (1 mark)",
      "Clear engineering guideline for dense vs sparse graph choices (1 mark)"
    ],
    commonPitfalls: "Writing O(1) for finding all neighbors in an adjacency matrix instead of Theta(V)."
  },
  {
    id: "eq-3",
    question: "Describe Breadth-First Search (BFS) and Depth-First Search (DFS). State their underlying data structures and give two distinct algorithmic applications of each.",
    questionType: "Analytical Comparison",
    relevanceScore: "Midterm Core (92% Probability)",
    marks: 6,
    modelAnswer: `1. BFS (Breadth-First Search):\n• Exploration Paradigm: Explores graph layer-by-layer (frontier vertices at distance k before distance k+1).\n• Underlying Data Structure: FIFO Queue.\n• Primary Applications:\n  a) Finding the unweighted single-source shortest path (minimum edge hops).\n  b) Testing bipartite graphs (2-colorability) and finding connected components.\n\n2. DFS (Depth-First Search):\n• Exploration Paradigm: Plunges along paths as deep as possible before backtracking.\n• Underlying Data Structure: LIFO Stack (explicit stack or function call recursion).\n• Primary Applications:\n  a) Topological sorting of Directed Acyclic Graphs (DAGs).\n  b) Strongly Connected Components decomposition (Tarjan's or Kosaraju's algorithms) and cycle detection.`,
    keyRubricPoints: [
      "Identification of FIFO Queue for BFS and LIFO Stack for DFS (2 marks)",
      "Correct unweighted shortest path application for BFS (1 mark)",
      "Topological sort or SCC decomposition application for DFS (2 marks)",
      "Runtime complexity stated as O(V + E) for adjacency list representation (1 mark)"
    ],
    commonPitfalls: "Claiming BFS computes shortest paths in graphs with weighted edges without clarifying that all edge weights must be strictly identical or unweighted."
  },
  {
    id: "eq-4",
    question: "In Dijkstra's algorithm, what is the asymptotic runtime difference between implementing the min-priority queue with an Unsorted Array, a Binary Heap, and a Fibonacci Heap?",
    questionType: "Complexity & Data Structures",
    relevanceScore: "Advanced Section (88% Probability)",
    marks: 8,
    modelAnswer: `Dijkstra's algorithm executes:\n- |V| Insert operations\n- |V| Extract-Min operations\n- |E| Decrease-Key operations\n\n1. Unsorted Array Implementation:\n• Extract-Min: O(V) scan across array -> Total: O(V^2)\n• Decrease-Key: O(1) direct update -> Total: O(E)\n• Overall Runtime: O(V^2 + E) = O(V^2). Optimal for very dense graphs (|E| ~ V^2).\n\n2. Binary Min-Heap Implementation:\n• Extract-Min: O(log V) -> Total: O(V log V)\n• Decrease-Key: O(log V) via heapify-up -> Total: O(E log V)\n• Overall Runtime: O((V + E) log V). Standard choice for sparse graphs.\n\n3. Fibonacci Heap Implementation:\n• Extract-Min: O(log V) amortized -> Total: O(V log V)\n• Decrease-Key: O(1) amortized -> Total: O(E)\n• Overall Runtime: O(V log V + E). Asymptotically fastest in theory for moderately dense graphs, though high constant factors limit practical usage.`,
    keyRubricPoints: [
      "Breakdown of total operations: V Extract-Min and E Decrease-Key (2 marks)",
      "Unsorted array complexity derivation: O(V^2) (2 marks)",
      "Binary heap complexity derivation: O((V + E) log V) (2 marks)",
      "Fibonacci heap amortized analysis: O(V log V + E) (2 marks)"
    ],
    commonPitfalls: "Forgetting to account for the Decrease-Key operations executed for every traversed edge |E|."
  },
  {
    id: "eq-5",
    question: "Given a Directed Acyclic Graph (DAG) representing university course prerequisites, formulate an algorithm to find a valid course registration order in O(V + E) time.",
    questionType: "Algorithm Formulation & Proof",
    relevanceScore: "High Yield (94% Exam Probability)",
    marks: 10,
    modelAnswer: `1. Problem Formulation:\nA valid registration schedule is a Topological Sort of the vertices in DAG G = (V, E), where edge (u, v) indicates that course u must be taken before course v.\n\n2. Algorithm Specification (Kahn's In-Degree Algorithm):\nStep 1: Compute in-degree in_deg[u] for every vertex u in O(V + E).\nStep 2: Initialize an empty queue Q and enqueue all vertices with in_deg[u] == 0 (courses with no prerequisites).\nStep 3: While Q is not empty:\n  a) Dequeue vertex u and append u to the course schedule output list.\n  b) For each outgoing neighbor v in adj[u]:\n     - Decrement in_deg[v] by 1.\n     - If in_deg[v] becomes 0, enqueue v.\nStep 4: If the output schedule contains fewer than |V| courses, report that a cyclic prerequisite dependency exists (cycle detection).\n\n3. Complexity Verification:\n• Initializing degrees: O(V + E).\n• Each vertex is enqueued and dequeued exactly once: O(V).\n• Each edge is traversed exactly once during in-degree decrements: O(E).\n• Total Time Complexity: O(V + E).\n• Space Complexity: O(V) for queue and in-degree tracking.`,
    keyRubricPoints: [
      "Identification of Topological Sorting as the formal solution (2 marks)",
      "Detailed step-by-step description of Kahn's in-degree algorithm or DFS finishing times (4 marks)",
      "Cycle detection condition handling (2 marks)",
      "Strict proof of O(V + E) time and O(V) auxiliary space (2 marks)"
    ],
    commonPitfalls: "Omitting the cycle check step when the graph contains circular dependencies."
  },
  {
    id: "eq-6",
    question: "Define the term 'Graph Invariant' and formulate the loop invariant utilized to prove the correctness of Dijkstra's algorithm.",
    questionType: "Formal Verification & Proof",
    relevanceScore: "Theoretical Core (86% Probability)",
    marks: 6,
    modelAnswer: `1. Definition of Graph Invariant:\nA graph invariant is a structural property or logical predicate that remains consistently true under every valid state transition or loop iteration of an algorithm.\n\n2. Dijkstra's Loop Invariant:\nLet S denote the set of visited vertices whose shortest distances have been finalized, and Q = V \\ S denote the min-priority queue.\n• Invariant Statement: At the beginning of each while-loop iteration:\n  For all vertices u in S, dist[u] = delta(s, u), the true shortest path distance from source s to u.\n  For all vertices v in Q, dist[v] is the length of the shortest path from s to v that uses ONLY intermediate vertices in S.\n\n3. Inductive Step:\nWhen vertex u with minimum dist[u] is extracted from Q and added to S, if there existed a shorter path to u, it would have to leave S via some vertex y in Q. Because edge weights are non-negative, any path through y would have length >= dist[y] >= dist[u], making it impossible to find a strictly shorter path. Hence dist[u] is optimal.`,
    keyRubricPoints: [
      "Precise definition of loop invariant in formal algorithm analysis (2 marks)",
      "Accurate formulation of Dijkstra's two-part set invariant (S and V \\ S) (2 marks)",
      "Clear inductive proof showing why non-negative edge weights prevent shorter alternative paths (2 marks)"
    ],
    commonPitfalls: "Stating only that dist[u] is minimal without proving why an unvisited vertex cannot provide a shorter path via edge relaxation."
  }
];

// Initial default summary for CS 201 so the UI is immediately populated
const INITIAL_SUMMARY: LectureSummary = {
  id: "sum-cs201-init",
  title: "Graph Traversals, BFS/DFS & Dijkstra's Algorithm",
  course: "Computer Science (CS 201)",
  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  sourceType: "pdf",
  fileName: "CS201_Lecture_08_Graphs_Dijkstra.pdf",
  studyMode: "comprehensive",
  overview: "Comprehensive academic synthesis covering graph representations (Adjacency Matrix vs List), systematic search algorithms (BFS and DFS), and Dijkstra's single-source shortest path algorithm with strict non-negative edge weight invariants.",
  keyTakeaways: [
    "Adjacency Lists achieve O(V + E) space efficiency, optimal for sparse real-world graphs.",
    "Breadth-First Search (BFS) computes unweighted shortest paths using a FIFO queue in O(V + E).",
    "Depth-First Search (DFS) provides the foundation for topological sorting of DAGs and cycle detection.",
    "Dijkstra's greedy algorithm requires non-negative edge weights; negative weights demand Bellman-Ford.",
    "Binary Min-Heaps yield O((V + E) log V) Dijkstra execution; Fibonacci Heaps yield O(V log V + E)."
  ],
  coreConcepts: [
    {
      title: "Foundations of Graph Representations",
      explanation: "Graphs model pairwise relationships. Adjacency Matrix uses Theta(V^2) space with O(1) edge queries. Adjacency List uses Theta(V + E) space with optimal Theta(deg(v)) neighbor lookups.",
      exampleOrFormula: "Sparse threshold: |E| << |V|^2"
    },
    {
      title: "BFS vs DFS Traversals",
      explanation: "BFS explores level-by-level using a FIFO queue for unweighted shortest path calculation. DFS plunges recursively using a LIFO stack to uncover back edges and topological orderings.",
      exampleOrFormula: "Time Complexity: Theta(V + E)"
    },
    {
      title: "Dijkstra's Shortest Path Algorithm",
      explanation: "Greedy optimization extracting minimum tentative distances. Once a vertex is extracted from the min-heap, its distance is proven final.",
      exampleOrFormula: "Invariant: dist[u] = delta(s, u) for all u in S"
    }
  ],
  examTips: [
    "Exam Trap: Never apply Dijkstra to graphs with negative edge weights. Always cite Bellman-Ford.",
    "For dense graphs where |E| ~ V^2, an unsorted array priority queue achieves O(V^2), beating a binary heap.",
    "When proving Topological Sort correctness, state Kahn's in-degree zero queue invariant."
  ],
  quiz: [
    {
      id: "q1",
      question: "What is the primary reason Dijkstra's algorithm fails with negative edge weights?",
      options: [
        "Its greedy invariant assumes finalized shortest distances can never decrease",
        "It triggers an unavoidable divide-by-zero hardware exception",
        "It converts directed graphs into undirected multigraphs",
        "It causes the binary heap to run in O(V^3) time"
      ],
      correctAnswerIndex: 0,
      explanation: "Dijkstra finalizes vertex distances greedily. A negative edge can retroactively lower an already extracted node's distance."
    },
    {
      id: "q2",
      question: "Which graph representation is optimal for a sparse social network with 10M users and 50M connections?",
      options: [
        "Adjacency List (O(V + E) memory)",
        "Adjacency Matrix (O(V^2) memory)",
        "Full Incidence Table (O(V * E) memory)",
        "3D Dense Coordinate Tensor"
      ],
      correctAnswerIndex: 0,
      explanation: "An adjacency matrix would require 100 trillion cells (impossible). An adjacency list requires only proportional O(V + E) storage."
    },
    {
      id: "q3",
      question: "What is the time complexity of Dijkstra's algorithm implemented with a standard binary min-heap?",
      options: [
        "O((V + E) log V)",
        "O(V^2)",
        "O(V * E)",
        "O(V log V + E)"
      ],
      correctAnswerIndex: 0,
      explanation: "V Extract-Min operations take O(V log V) and E Decrease-Key operations take O(E log V), totaling O((V + E) log V)."
    },
    {
      id: "q4",
      question: "Which algorithm should you use to find the single-source shortest path in an UNWEIGHTED graph?",
      options: [
        "Breadth-First Search (BFS) in O(V + E)",
        "Floyd-Warshall Algorithm in O(V^3)",
        "Bellman-Ford Algorithm in O(V * E)",
        "Kruskal's Minimum Spanning Tree"
      ],
      correctAnswerIndex: 0,
      explanation: "BFS explores layer-by-layer; the first time an unweighted vertex is reached, the path is guaranteed shortest."
    },
    {
      id: "q5",
      question: "Which traversal is the prerequisite foundation for topological sorting of Directed Acyclic Graphs?",
      options: [
        "Depth-First Search (DFS) finishing times",
        "Breadth-First Search level indices",
        "Prim's cut vertex traversal",
        "A* Heuristic Manhattan search"
      ],
      correctAnswerIndex: 0,
      explanation: "Vertices ordered in reverse of DFS finishing times produce a valid topological sort."
    }
  ],
  examQuestions: DEFAULT_CS_EXAM_QUESTIONS,
  detectedDeadlines: [
    {
      title: "CS 201: Assignment 3 (Graph Traversal Engine)",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      priority: "high",
      category: "assignment",
      course: "Computer Science (CS 201)",
      notes: "Implement BFS/DFS adjacency list and Dijkstra shortest path benchmark with test suites."
    },
    {
      title: "CS 201: Midterm Exam Review Session",
      dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0],
      priority: "medium",
      category: "exam",
      course: "Computer Science (CS 201)",
      notes: "Hall B at 4:00 PM. Review negative cycles, asymptotic heap proofs, and Topological Sort."
    },
    {
      title: "CS 201: Group Project Milestone 1",
      dueDate: new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0],
      priority: "medium",
      category: "project",
      course: "Computer Science (CS 201)",
      notes: "Submit team formation and routing algorithm proposal."
    }
  ]
};

export const LectureProcessor: React.FC<LectureProcessorProps> = ({
  onAddTasks,
  onSelectTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"notes" | "quiz" | "exam-questions" | "deadlines">("notes");
  const [course, setCourse] = useState(COURSES[0]);
  const [studyMode, setStudyMode] = useState<"comprehensive" | "cram" | "exam-prep">("comprehensive");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active quiz state
  const [summary, setSummary] = useState<LectureSummary | null>(INITIAL_SUMMARY);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [addedDeadlineIds, setAddedDeadlineIds] = useState<{ [key: string]: boolean }>({});

  // Exam-oriented questions pop-up modal state
  const [selectedExamQuestion, setSelectedExamQuestion] = useState<ExamQuestion | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<string>("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    // If text file / markdown, read as text directly
    if (file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTextInput((event.target?.result as string) || "");
      };
      reader.readAsText(file);
      setFileBase64(null);
    } else {
      // Convert to base64 for direct multimodal sending to Gemini backend
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        setFileBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-load sample lecture for instant 1-click test
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_LECTURES.find((s) => s.id === sampleId);
    if (!sample) return;

    setCourse(sample.course);
    setTextInput(sample.sampleContent);
    setInputMode("paste");
    setSelectedFile(null);
    setFileBase64(null);
    setError(null);
  };

  // Run AI processing
  const handleProcessLecture = async () => {
    if (!textInput.trim() && !fileBase64) {
      setError("Please upload a lecture document (PDF, Docs, Slides) or paste lecture text.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep("Extracting core academic concepts from document...");

    try {
      const payload: any = {
        course,
        studyMode,
        fileName: selectedFile?.name || "Uploaded_Lecture_Notes",
      };

      if (textInput.trim()) {
        payload.content = textInput;
      }
      if (fileBase64 && selectedFile) {
        payload.fileData = {
          data: fileBase64,
          mimeType: selectedFile.type || "application/pdf",
        };
      }

      setLoadingStep("Synthesizing structured revision notes and high-yield takeaways...");

      const response = await fetch("/api/ai/process-lecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      setLoadingStep("Framing possible exam-oriented questions, rubrics, and practice quiz...");

      const data = await response.json();

      const newSummary: LectureSummary = {
        id: `sum-${Date.now()}`,
        title: data.title || "Lecture Synthesis",
        course: data.course || course,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        sourceType: selectedFile?.name.endsWith(".pptx") ? "slides" : selectedFile?.name.endsWith(".docx") ? "docs" : "pdf",
        fileName: selectedFile?.name,
        studyMode,
        overview: data.overview || "High-level summary of lecture.",
        keyTakeaways: data.keyTakeaways || [],
        coreConcepts: data.coreConcepts || [],
        examTips: data.examTips || [],
        quiz: data.quiz || [],
        examQuestions: (data.examQuestions && data.examQuestions.length > 0) ? data.examQuestions : DEFAULT_CS_EXAM_QUESTIONS,
        detectedDeadlines: data.detectedDeadlines || [],
      };

      setSummary(newSummary);
      setSelectedAnswers({});
      setSubmittedQuiz(false);
      setAddedDeadlineIds({});
      setActiveSubTab("notes");
    } catch (err: any) {
      console.error("AI lecture processing notice:", err);
      let userMsg = "Failed to process lecture. Please retry.";
      try {
        if (typeof err.message === "string") {
          if (err.message.includes("high demand") || err.message.includes("503")) {
            userMsg = "The AI service experienced high traffic. Please tap 'Synthesize & Generate Study Materials' again.";
          } else {
            const parsed = JSON.parse(err.message);
            userMsg = parsed.error?.message || parsed.error || userMsg;
          }
        }
      } catch {
        userMsg = err.message || userMsg;
      }
      setError(userMsg);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Quiz helper
  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const calculateQuizScore = () => {
    if (!summary || !summary.quiz) return { score: 0, total: 0 };
    let correct = 0;
    summary.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return { score: correct, total: summary.quiz.length };
  };

  // Handle adding single deadline to workspace
  const handleAddSingleDeadline = (dl: DetectedDeadline, index: number) => {
    onAddTasks([dl]);
    setAddedDeadlineIds((prev) => ({ ...prev, [index]: true }));
  };

  // Handle adding all detected deadlines
  const handleAddAllDeadlines = () => {
    if (!summary || !summary.detectedDeadlines.length) return;
    onAddTasks(summary.detectedDeadlines);
    const marked: { [key: string]: boolean } = {};
    summary.detectedDeadlines.forEach((_, idx) => {
      marked[idx] = true;
    });
    setAddedDeadlineIds(marked);
  };

  const handleCopyNotes = () => {
    if (!summary) return;
    const text = `${summary.title}\n\nOverview:\n${summary.overview}\n\nKey Takeaways:\n${summary.keyTakeaways.join(
      "\n"
    )}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyModelAnswer = (answer: string) => {
    navigator.clipboard.writeText(answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const filteredExamQuestions = (summary?.examQuestions || []).filter((q) => {
    if (questionFilter === "all") return true;
    if (questionFilter === "high-yield") return q.relevanceScore.toLowerCase().includes("high yield") || q.relevanceScore.includes("9");
    if (questionFilter === "conceptual") return q.questionType.toLowerCase().includes("concept");
    if (questionFilter === "compare") return q.questionType.toLowerCase().includes("compare");
    if (questionFilter === "derivation") return q.questionType.toLowerCase().includes("derivation") || q.questionType.toLowerCase().includes("algorithm");
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/90 via-zinc-100 dark:via-zinc-900 to-purple-50/80 dark:to-purple-950/40 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-zinc-100">
                <Sparkles className="h-3 w-3" /> Helpify AI Engine
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Active Study Kit Generator
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl font-display">
              AI Lecture Summarizer & Exam Question Bank
            </h1>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Upload course PDFs, slide decks, or lecture notes. Helpify extracts executive takeaways, builds 5-question active recall quizzes, frames probable exam questions with model answers, and auto-detects homework deadlines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Test with sample lecture:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleLoadSample("cs-graph-theory")}
                className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                CS 201
              </button>
              <button
                onClick={() => handleLoadSample("bio-cellular-respiration")}
                className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                BIO 110
              </button>
              <button
                onClick={() => handleLoadSample("econ-macro-fiscal-policy")}
                className="rounded-xl border border-amber-200 dark:border-amber-800 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                ECON 102
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload/Input Panel on Left, Study Kit on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Input Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Lecture Configuration
              </h2>
              {/* Input Mode Toggle - High Contrast */}
              <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-850 p-1 border border-zinc-300 dark:border-zinc-700">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    inputMode === "upload"
                      ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputMode("paste")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    inputMode === "paste"
                      ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  Paste Notes
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Target Subject / Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Mode Filter */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Study Focus Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "comprehensive", label: "Comprehensive", desc: "Full Notes & Quiz" },
                    { id: "cram", label: "Cram Mode", desc: "Quick High-Yields" },
                    { id: "exam-prep", label: "Exam Prep", desc: "Formulas & Questions" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setStudyMode(mode.id as any)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all cursor-pointer ${
                        studyMode === mode.id
                          ? "border-indigo-600 bg-indigo-200 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-bold ring-2 ring-indigo-600"
                          : "border-zinc-300 dark:border-zinc-700 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 font-medium"
                      }`}
                    >
                      <span className="text-xs font-bold">{mode.label}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Box OR Text Paste */}
              {inputMode === "upload" ? (
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Upload Lecture Document (PDF, DOCX, PPTX, TXT)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.pptx,.txt,.md,.json"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-850/60 p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace file
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Click to select lecture slides or syllabus PDF
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          Supports PDF, DOCX, PowerPoint & plain text (up to 25MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Paste Lecture Transcript or Study Notes
                  </label>
                  <textarea
                    rows={7}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste lecture transcript, reading excerpts, problem set questions, or syllabus notes here..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                    <span>Markdown & plain text supported</span>
                    <span>{textInput.length} characters</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleProcessLecture}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-700 dark:bg-indigo-600 px-4 py-3.5 text-xs sm:text-sm font-bold text-zinc-100 shadow-md shadow-indigo-600/20 hover:bg-indigo-800 dark:hover:bg-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-zinc-100" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{loadingStep || "Synthesizing Lecture Materials..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Synthesize & Generate Study Materials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Study Kit Results (7 Cols) */}
        <div className="lg:col-span-7">
          {summary && (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-xs overflow-hidden">
              {/* Header with Title & Export Actions */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-200 dark:bg-indigo-950/60 px-2 py-0.5 text-[11px] font-bold text-indigo-950 dark:text-indigo-300">
                        {summary.course}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {summary.date}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-zinc-100">
                      {summary.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyNotes}
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                      title="Copy revision notes"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={() => downloadMarkdownFile(summary)}
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                      title="Download Markdown study sheet"
                    >
                      <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>.MD</span>
                    </button>

                    <button
                      onClick={() => downloadJSONFile(summary)}
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                      title="Download JSON data"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-600" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Sub Tabs - Crystal Clear, High-Contrast Palette */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <button
                    onClick={() => setActiveSubTab("notes")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === "notes"
                        ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                        : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Revision Notes</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab("quiz")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === "quiz"
                        ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                        : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Practice Quiz (5 Qs)</span>
                    {submittedQuiz && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        activeSubTab === "quiz" ? "bg-indigo-400 text-indigo-950" : "bg-indigo-200 dark:bg-indigo-900/60 text-indigo-950 dark:text-indigo-300"
                      }`}>
                        {calculateQuizScore().score}/5
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveSubTab("exam-questions")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === "exam-questions"
                        ? "bg-purple-300 text-purple-950 dark:bg-purple-900/90 dark:text-purple-200 border-2 border-purple-600 shadow-xs"
                        : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                    }`}
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                    <span>Possible Exam-oriented Questions</span>
                    {summary?.examQuestions && summary.examQuestions.length > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        activeSubTab === "exam-questions" ? "bg-purple-400 text-purple-950" : "bg-purple-200 dark:bg-purple-900/60 text-purple-950 dark:text-purple-300"
                      }`}>
                        {summary.examQuestions.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveSubTab("deadlines")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === "deadlines"
                        ? "bg-amber-300 text-amber-950 dark:bg-amber-900/90 dark:text-amber-200 border-2 border-amber-600 shadow-xs"
                        : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Detected Deadlines</span>
                    {summary?.detectedDeadlines && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        activeSubTab === "deadlines" ? "bg-amber-400 text-amber-950" : "bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200"
                      }`}>
                        {summary.detectedDeadlines.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="p-5 max-h-[580px] overflow-y-auto">
                {/* 1. REVISION NOTES TAB */}
                {activeSubTab === "notes" && (
                  <div className="space-y-5">
                    {/* Executive Overview */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Executive Summary</h4>
                      <p className="mt-1 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium">{summary.overview}</p>
                    </div>

                    {/* Key Takeaways */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                        Core High-Yield Takeaways
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {summary.keyTakeaways.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Core Concepts */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-2.5">
                        Structured Conceptual Breakdown
                      </h4>
                      <div className="space-y-3">
                        {summary.coreConcepts.map((concept, idx) => (
                          <div key={idx} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-100 dark:bg-zinc-850 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-700 text-[10px] font-bold text-zinc-100">
                                {idx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{concept.title}</h5>
                            </div>
                            <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{concept.explanation}</p>
                            {concept.exampleOrFormula && (
                              <div className="mt-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 font-mono text-[11px] text-indigo-900 dark:text-indigo-300">
                                <span className="font-bold text-zinc-600 dark:text-zinc-400 mr-2">Formula/Rule:</span>
                                {concept.exampleOrFormula}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exam Tips */}
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-600" />
                        Exam Focal Points & Traps
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {summary.examTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-amber-950 dark:text-amber-200 font-medium">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 2. PRACTICE QUIZ TAB */}
                {activeSubTab === "quiz" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-3.5 border border-indigo-100 dark:border-indigo-900/50">
                      <div>
                        <h4 className="text-xs font-bold font-display text-indigo-900 dark:text-indigo-200">5-Question Active Recall Quiz</h4>
                        <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                          Reinforce retention immediately after reviewing lecture notes.
                        </p>
                      </div>
                      {submittedQuiz && (
                        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-center shadow-xs border border-indigo-200 dark:border-indigo-800">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {calculateQuizScore().score} / {summary.quiz.length}
                          </span>
                          <span className="block text-[10px] text-zinc-500 font-semibold">Mastery</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {summary.quiz.map((q, qIndex) => {
                        const selectedOption = selectedAnswers[q.id];
                        const isAnswered = selectedOption !== undefined;

                        return (
                          <div
                            key={q.id}
                            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-850 p-4"
                          >
                            <div className="flex items-start gap-2 mb-3">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-zinc-100">
                                {qIndex + 1}
                              </span>
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                                {q.question}
                              </h5>
                            </div>

                            <div className="space-y-2">
                              {q.options.map((opt, optIndex) => {
                                let optionStyle =
                                  "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-indigo-300";

                                if (submittedQuiz) {
                                  if (optIndex === q.correctAnswerIndex) {
                                    optionStyle =
                                      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500";
                                  } else if (selectedOption === optIndex) {
                                    optionStyle =
                                      "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold";
                                  }
                                } else if (selectedOption === optIndex) {
                                  optionStyle =
                                    "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold ring-1 ring-indigo-600";
                                }

                                return (
                                  <button
                                    key={optIndex}
                                    type="button"
                                    onClick={() => handleSelectOption(q.id, optIndex)}
                                    disabled={submittedQuiz}
                                    className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-colors cursor-pointer ${optionStyle}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-current text-[10px] font-bold uppercase">
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {submittedQuiz && optIndex === q.correctAnswerIndex && (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    )}
                                    {submittedQuiz && selectedOption === optIndex && optIndex !== q.correctAnswerIndex && (
                                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {submittedQuiz && (
                              <div className="mt-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">Explanation:</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {!submittedQuiz ? (
                        <button
                          onClick={() => setSubmittedQuiz(true)}
                          disabled={Object.keys(selectedAnswers).length === 0}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-zinc-100 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          <Check className="h-4 w-4" />
                          <span>Submit Answers & Check Score</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAnswers({});
                            setSubmittedQuiz(false);
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Retake Practice Quiz</span>
                        </button>
                      )}

                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono font-semibold">
                        {Object.keys(selectedAnswers).length} of {summary.quiz.length} answered
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. POSSIBLE EXAM-ORIENTED QUESTIONS TAB */}
                {activeSubTab === "exam-questions" && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/90 via-zinc-100 dark:via-zinc-900 to-indigo-50/90 dark:to-indigo-950/40 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-zinc-100 uppercase">
                              <Award className="h-3 w-3" /> Exam Question Bank
                            </span>
                            <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                              {summary.examQuestions?.length || 0} Questions Framed
                            </span>
                          </div>
                          <h4 className="mt-1 text-xs sm:text-sm font-bold font-display text-zinc-900 dark:text-zinc-100">
                            Probable Exam-oriented Questions & Step-by-Step Model Answers
                          </h4>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                            Click any question below to open a pop-up window with the complete model answer, scoring rubric, and common mistakes to avoid.
                          </p>
                        </div>
                      </div>

                      {/* Filter Pills */}
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                        {[
                          { id: "all", label: "All Questions" },
                          { id: "high-yield", label: "High Yield (90%+)" },
                          { id: "conceptual", label: "Conceptual" },
                          { id: "compare", label: "Compare & Contrast" },
                          { id: "derivation", label: "Derivations / Proofs" },
                        ].map((flt) => (
                          <button
                            key={flt.id}
                            onClick={() => setQuestionFilter(flt.id)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                              questionFilter === flt.id
                                ? "bg-purple-600 text-zinc-100 shadow-xs"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {flt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Cards List */}
                    <div className="space-y-3">
                      {filteredExamQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          onClick={() => setSelectedExamQuestion(q)}
                          className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-850 p-4 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="space-y-1.5 flex-1 pr-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-300 dark:bg-purple-900 text-[10px] font-black text-purple-950 dark:text-purple-200 shrink-0">
                                {idx + 1}
                              </span>
                              <span className="rounded-md bg-purple-200 dark:bg-purple-950/60 px-2 py-0.5 text-[10px] font-bold text-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-900/60">
                                {q.questionType}
                              </span>
                              <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900">
                                {q.relevanceScore}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                {q.marks || 5} Marks
                              </span>
                            </div>

                            <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors leading-snug">
                              {q.question}
                            </h5>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                            <span className="hidden sm:inline">View Answer & Rubric</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. DETECTED DEADLINES TAB */}
                {activeSubTab === "deadlines" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3.5">
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                          Automated Deadline & Milestone Extraction
                        </h4>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300">
                          {summary.detectedDeadlines.length} actionable assignments and exam dates found in this lecture.
                        </p>
                      </div>

                      <button
                        onClick={handleAddAllDeadlines}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3.5 py-1.5 text-xs font-bold text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add All to My Tasks</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {summary.detectedDeadlines.map((dl, idx) => {
                        const isAdded = addedDeadlineIds[idx];
                        const priorityColor =
                          dl.priority === "high"
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900"
                            : dl.priority === "medium"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                            : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";

                        return (
                          <div
                            key={idx}
                            className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-850 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${priorityColor}`}>
                                  {dl.priority} Priority
                                </span>
                                <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                                  {dl.category}
                                </span>
                                <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                  Due: {dl.dueDate}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{dl.title}</h5>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{dl.notes}</p>
                            </div>

                            <div className="shrink-0">
                              {isAdded ? (
                                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Check className="h-3.5 w-3.5" /> Added to Tasks
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAddSingleDeadline(dl, idx)}
                                  className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                  <span>Add to Tasks</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={() => onSelectTab("tasks")}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <span>Open Task Manager & Calendar Timeline</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POP-UP MODAL: POSSIBLE EXAM-ORIENTED QUESTION & MODEL ANSWER */}
      {selectedExamQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-2xl transition-all">
            {/* Top Accent Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 sticky top-0 z-10" />

            {/* Close Button */}
            <button
              onClick={() => setSelectedExamQuestion(null)}
              className="absolute right-4 top-5 z-20 rounded-full p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Modal Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-purple-200 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-900">
                    {selectedExamQuestion.questionType}
                  </span>
                  <span className="rounded-full bg-emerald-200 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900">
                    {selectedExamQuestion.relevanceScore}
                  </span>
                  <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-mono">
                    Weight: {selectedExamQuestion.marks || 5} Marks
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  {selectedExamQuestion.question}
                </h3>
              </div>

              {/* Model Answer Section */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-100/60 dark:bg-indigo-950/20 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    Model Answer (Full Marks Standard)
                  </h4>
                  <button
                    onClick={() => handleCopyModelAnswer(selectedExamQuestion.modelAnswer)}
                    className="inline-flex items-center gap-1 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold text-indigo-950 dark:text-indigo-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    {copiedAnswer ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                    <span>{copiedAnswer ? "Copied" : "Copy Answer"}</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 space-y-2 whitespace-pre-line leading-relaxed font-normal">
                  {selectedExamQuestion.modelAnswer}
                </div>
              </div>

              {/* Examiner Rubric Section */}
              {selectedExamQuestion.keyRubricPoints && selectedExamQuestion.keyRubricPoints.length > 0 && (
                <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-200/60 dark:bg-zinc-850 p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-purple-600" />
                    Examiner Grading Rubric & Key Marking Points
                  </h4>
                  <ul className="space-y-2">
                    {selectedExamQuestion.keyRubricPoints.map((rubric, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{rubric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Pitfalls Section */}
              {selectedExamQuestion.commonPitfalls && (
                <div className="rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-100/70 dark:bg-amber-950/20 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-300 flex items-center gap-2 mb-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Common Student Mistakes on this Question
                  </h4>
                  <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                    {selectedExamQuestion.commonPitfalls}
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedExamQuestion(null)}
                  className="rounded-xl bg-zinc-800 dark:bg-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-100 dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-300 transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
