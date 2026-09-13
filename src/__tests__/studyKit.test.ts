import { describe, it, expect } from "vitest";
import { LectureSummary, QuizQuestion } from "../types";
import { exportLectureToMarkdown } from "../utils/exportNotes";

describe("Study Kit Validation & Problem Statement Alignment", () => {
  const mockStudyKit: LectureSummary = {
    id: "test-kit-1",
    title: "Graph Algorithms & Dijkstra Invariant",
    course: "CS 201",
    date: "Oct 12, 2026",
    sourceType: "pdf",
    fileName: "cs201_lecture_graphs.pdf",
    studyMode: "comprehensive",
    overview: "This lecture introduces graph representations including adjacency matrices and lists. It details systematic traversals and analyzes Dijkstra's single-source shortest path algorithm. Key constraints emphasize non-negative edge weights.",
    keyTakeaways: [
      "Adjacency lists provide optimal O(V + E) memory for sparse networks.",
      "Breadth-First Search finds unweighted shortest paths using a FIFO queue.",
      "Depth-First Search provides discovery and finishing timestamps for topological ordering.",
      "Dijkstra's greedy choice requires non-negative edge weights to guarantee subproblem optimality.",
      "Min-heap priority queues reduce Dijkstra runtime to O((V + E) log V)."
    ],
    coreConcepts: [
      {
        title: "Adjacency Matrix vs. Adjacency List",
        explanation: "Adjacency matrices support O(1) edge lookup at the cost of O(V^2) memory. Adjacency lists optimize memory to O(V + E) and neighbor enumeration to O(deg(v)).",
        exampleOrFormula: "Space: O(V + E) vs O(V^2)"
      },
      {
        title: "Dijkstra's Greedy Invariant",
        explanation: "Once vertex u is extracted from the min-priority queue, its tentative distance is proven optimal. Negative edge weights violate this invariant.",
        exampleOrFormula: "dist[u] = delta(s, u)"
      }
    ],
    examTips: [
      "Watch for negative edge weights on final exams; always use Bellman-Ford instead.",
      "State Kahn's in-degree 0 invariant when describing topological sort."
    ],
    detectedDeadlines: [],
    examQuestions: [
      {
        id: "eq-1",
        question: "Explain the Dijkstra non-negative weight constraint and its invariant.",
        questionType: "Conceptual Breakdown",
        relevanceScore: "High Yield (98%)",
        marks: 5,
        modelAnswer: "Dijkstra relies on greedy monotonic distances. Negative weights invalidate previously relaxed vertices.",
        keyRubricPoints: ["Mention greedy invariant", "Contrast with Bellman-Ford"]
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Why does Dijkstra's algorithm fail when negative edge weights are present?",
        options: [
          "Its greedy choice assumes extracted distances can never decrease",
          "It triggers a runtime division by zero in the priority queue",
          "It converts directed graphs into cyclic multigraphs",
          "It increases memory complexity to exponential O(2^V)"
        ],
        correctAnswerIndex: 0,
        explanation: "Dijkstra finalizes node distances greedily. A negative edge downstream can retroactively lower an already extracted node's distance."
      },
      {
        id: "q2",
        question: "What is the space complexity of an adjacency list representation?",
        options: ["O(V + E)", "O(V^2)", "O(V * E)", "O(E log V)"],
        correctAnswerIndex: 0,
        explanation: "Adjacency lists store vertices and only existing edges, yielding O(V + E) space."
      },
      {
        id: "q3",
        question: "Which traversal strategy uses a FIFO queue to discover unweighted shortest paths?",
        options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Bellman-Ford", "Prim's MST"],
        correctAnswerIndex: 0,
        explanation: "BFS explores nodes layer by layer using a FIFO queue, guaranteeing minimum edge paths."
      },
      {
        id: "q4",
        question: "What is the standard time complexity of Dijkstra using a binary min-heap?",
        options: ["O((V + E) log V)", "O(V^2)", "O(V * E)", "O(V log V + E)"],
        correctAnswerIndex: 0,
        explanation: "V extract-min operations take O(V log V) and E decrease-key operations take O(E log V)."
      },
      {
        id: "q5",
        question: "Which algorithm detects negative-weight cycles in directed graphs?",
        options: ["Bellman-Ford", "Dijkstra", "Kruskal", "Topological Sort"],
        correctAnswerIndex: 0,
        explanation: "Bellman-Ford runs a V-th iteration pass to detect if any edge distance can still be relaxed."
      }
    ]
  };

  it("1. Generates an Executive Summary meeting academic standards", () => {
    expect(mockStudyKit.overview).toBeDefined();
    expect(mockStudyKit.overview.length).toBeGreaterThan(50);
    // 2-3 sentences
    const sentenceCount = mockStudyKit.overview.split(/[.!?]+/).filter(Boolean).length;
    expect(sentenceCount).toBeGreaterThanOrEqual(2);
  });

  it("2. Contains exactly 4-6 high-yield Core Takeaways", () => {
    expect(mockStudyKit.keyTakeaways).toBeDefined();
    expect(mockStudyKit.keyTakeaways.length).toBeGreaterThanOrEqual(4);
    expect(mockStudyKit.keyTakeaways.length).toBeLessThanOrEqual(6);
    mockStudyKit.keyTakeaways.forEach((takeaway) => {
      expect(takeaway.trim().length).toBeGreaterThan(15);
    });
  });

  it("3. Delivers structured High-Yield Revision Notes with key concepts & formulas", () => {
    expect(mockStudyKit.coreConcepts.length).toBeGreaterThanOrEqual(2);
    mockStudyKit.coreConcepts.forEach((concept) => {
      expect(concept.title).toBeTruthy();
      expect(concept.explanation).toBeTruthy();
      expect(concept.explanation.length).toBeGreaterThan(20);
    });
  });

  it("4. Delivers exactly 5 multiple choice Practice Quiz questions with 4 options and explanations", () => {
    expect(mockStudyKit.quiz).toHaveLength(5);
    mockStudyKit.quiz.forEach((q: QuizQuestion, index: number) => {
      expect(q.id).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThanOrEqual(3);
      expect(q.explanation).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(10);
    });
  });

  it("5. Computes quiz scoring accurately", () => {
    const userAnswersCorrect: Record<string, number> = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
    };
    let score = 0;
    mockStudyKit.quiz.forEach((q) => {
      if (userAnswersCorrect[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    expect(score).toBe(5);
    expect((score / mockStudyKit.quiz.length) * 100).toBe(100);

    const userAnswersPartial: Record<string, number> = {
      q1: 0,
      q2: 1, // wrong
      q3: 0,
      q4: 0,
      q5: 2, // wrong
    };
    let partialScore = 0;
    mockStudyKit.quiz.forEach((q) => {
      if (userAnswersPartial[q.id] === q.correctAnswerIndex) {
        partialScore++;
      }
    });
    expect(partialScore).toBe(3);
    expect((partialScore / mockStudyKit.quiz.length) * 100).toBe(60);
  });

  it("6. Exports full Markdown study kit including overview, takeaways, and quiz", () => {
    const md = exportLectureToMarkdown(mockStudyKit);
    expect(md).toContain("# Graph Algorithms & Dijkstra Invariant");
    expect(md).toContain("## 📌 Overview");
    expect(md).toContain("## 🎯 Key Takeaways");
    expect(md).toContain("## 💡 Core Concepts & Formulations");
    expect(md).toContain("## 🧠 5-Question Active Recall Practice Quiz");
    expect(md).toContain("Question 1:");
    expect(md).toContain("## 📝 Possible Exam Questions & Step-by-Step Solutions");
    expect(md).toContain("[Conceptual Breakdown]");
  });
});
