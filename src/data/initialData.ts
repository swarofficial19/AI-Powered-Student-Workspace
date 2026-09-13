import { Task, StudyGroupBoard, LectureSummary, NotificationItem } from "../types";

export interface SampleLecture {
  id: string;
  title: string;
  course: string;
  fileType: "pdf" | "slides" | "docs";
  fileName: string;
  sampleContent: string;
}

export const SAMPLE_LECTURES: SampleLecture[] = [
  {
    id: "cs-graph-theory",
    title: "Graph Theory, BFS/DFS, and Dijkstra's Algorithm",
    course: "Computer Science (CS 201)",
    fileType: "pdf",
    fileName: "CS201_Lecture_08_Graphs_Dijkstra.pdf",
    sampleContent: `CS 201: Data Structures & Algorithms
Lecture 8: Graph Traversals & Shortest Path Algorithms
Professor Henderson — Week 4

1. Foundations of Graph Representations
Graphs G = (V, E) model pairwise relationships. Two canonical representations:
- Adjacency Matrix: O(V^2) space, O(1) edge lookup. Preferred when graph is dense (|E| ~ |V|^2).
- Adjacency List: O(V + E) space, optimal for sparse real-world graphs (social networks, web crawler graphs).

2. Breadth-First Search (BFS) vs Depth-First Search (DFS)
- BFS explores level-by-level using a FIFO Queue. It computes single-source unweighted shortest paths in O(V + E).
- DFS plunges down branches using recursion or a LIFO Stack. Applications: topological sort for DAGs, cycle detection, strongly connected components (Tarjan / Kosaraju).

3. Dijkstra's Algorithm for Non-Negative Weighted Graphs
- Greedy approach maintaining a min-priority queue (Binary Heap or Fibonacci Heap).
- Time complexity: O((V + E) log V) with binary heap.
- Invariant: Once a vertex u is extracted from the min-heap, its shortest distance dist[u] is guaranteed final.
- CRITICAL EXAM TRAP: Dijkstra fails with negative edge weights! Use Bellman-Ford (O(V*E)) or Floyd-Warshall (O(V^3)) instead.

4. Upcoming Course Deadlines & Logistics
- Assignment 3 (Graph Traversal & Routing Engine Implementation) is DUE next Tuesday, September 16 at 11:59 PM. Submissions must include unit test suites. Late penalty: 10% per 24 hours.
- Midterm Exam Review Session scheduled for Friday, September 19 at 4:00 PM in Hall B.
- Group Project Milestone 1: Team formation and topic proposal due on September 22.
- Recommended Reading: Cormen et al. (CLRS) Chapter 22 & 24 before next lecture.`
  },
  {
    id: "bio-cellular-respiration",
    title: "Cellular Respiration, Glycolysis, and the Krebs Cycle",
    course: "Molecular Biology (BIO 110)",
    fileType: "slides",
    fileName: "BIO110_SlideDeck_Respiration_Mitochondria.pptx",
    sampleContent: `BIO 110: Principles of Cellular Biology
Lecture 14: Cellular Respiration & ATP Bioenergetics
Dr. Elena Rostova

Overview:
Cellular respiration is the multi-step metabolic pathway catabolizing glucose into chemical energy:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30-32 ATP.

Stage 1: Glycolysis (Cytosol)
- Anaerobic phase: Glucose (6C) phosphorylated and split into 2 Pyruvate (3C).
- Net yield: 2 ATP (via substrate-level phosphorylation) and 2 NADH.
- Key regulatory enzyme: Phosphofructokinase (PFK), allosterically inhibited by high ATP and citrate.

Stage 2: Pyruvate Oxidation & Citric Acid Cycle (Mitochondrial Matrix)
- Pyruvate converted to Acetyl-CoA with release of CO2 and generation of NADH.
- Citric Acid Cycle (Krebs): Combines 2C acetyl group with 4C oxaloacetate to form 6C citrate.
- Per glucose (2 cycles): Yields 6 NADH, 2 FADH2, 2 GTP/ATP, and 4 CO2.

Stage 3: Oxidative Phosphorylation & Chemiosmosis (Inner Mitochondrial Membrane)
- Electron Transport Chain (Complexes I-IV) transfers electrons from NADH/FADH2 to terminal electron acceptor O2, pumping H+ ions into the intermembrane space.
- Proton Motive Force drives ATP Synthase rotation (Chemiosmosis / Peter Mitchell hypothesis).

Lab Milestones & Exam Notices:
- Lab Report 4 (Enzymatic Rate of Yeast Fermentation) is strictly due this Thursday, September 18 at 5:00 PM.
- Pre-Lab Preparation Quiz for Spectrophotometry unlocks Sunday, September 21.
- Unit 2 Exam covers Lectures 10-16 on Wednesday, September 24.`
  },
  {
    id: "econ-macro-fiscal-policy",
    title: "Macroeconomic Equilibrium, Inflation & Fiscal Policy",
    course: "Macroeconomics (ECON 102)",
    fileType: "docs",
    fileName: "ECON102_LectureNotes_Keynesian_Policy.docx",
    sampleContent: `ECON 102: Principles of Macroeconomics
Lecture 9: Aggregate Demand, Aggregate Supply & Central Bank Mechanics

1. The AD-AS Equilibrium Framework
- Aggregate Demand (AD = C + I + G + NX): Downward sloping due to wealth effect, interest rate effect, and foreign exchange effect.
- Short-Run Aggregate Supply (SRAS): Upward sloping due to sticky wages and sticky prices.
- Long-Run Aggregate Supply (LRAS): Vertical at the Natural Rate of Output (Potential GDP / Y*).

2. Fiscal Policy Stimulus vs Contraction
- Government spending multiplier: k = 1 / (1 - MPC). If marginal propensity to consume (MPC) is 0.8, multiplier is 5.
- Tax multiplier: -MPC / (1 - MPC).
- Crowding-out effect: Expansionary fiscal policy (increased G or deficits) drives up real interest rates, damping private sector business investment.

3. Monetary Transmission Mechanism
- Central bank changes policy interest rates (Federal Funds Rate) via open market operations and reserve remuneration.
- Philips Curve: Historical inverse relationship between inflation and unemployment in the short run.

Assignments & Group Project Deadlines:
- Problem Set 4 (Fiscal Multipliers & Tax Shifts) due Monday, September 15 at 11:59 PM.
- Term Group Policy Paper Draft: Submit 5-page outline by September 23.
- Macro Simulation Case Competition signups close September 17.`
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "CS 201: Graph Traversal Assignment 3",
    description: "Implement BFS/DFS adjacency list representation and benchmark Dijkstra shortest path on real road network dataset.",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    priority: "high",
    category: "assignment",
    course: "Computer Science (CS 201)",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "BIO 110: Yeast Fermentation Lab Report",
    description: "Synthesize spectrophotometer data, calculate enzyme kinetics, and submit formal lab report with graphs.",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    priority: "high",
    category: "lab",
    course: "Molecular Biology (BIO 110)",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "ECON 102: Problem Set 4 - Multipliers",
    description: "Calculate Keynesian spending multipliers and plot shifts in aggregate demand curves under supply shocks.",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
    priority: "medium",
    category: "assignment",
    course: "Macroeconomics (ECON 102)",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "CS 201: Midterm Exam Review Prep",
    description: "Review asymptotic time complexities for heap operations and review topological sort algorithms.",
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0],
    priority: "medium",
    category: "exam",
    course: "Computer Science (CS 201)",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "BIO 110: Reading Chapter 12 & 13",
    description: "Read textbook sections on oxidative phosphorylation and ATP synthase mechanical rotation.",
    dueDate: new Date(Date.now() + 86400000 * 8).toISOString().split("T")[0],
    priority: "low",
    category: "reading",
    course: "Molecular Biology (BIO 110)",
    completed: true,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_STUDY_GROUPS: StudyGroupBoard[] = [
  {
    id: "group-cs",
    name: "CS 201 Algorithms Study Squad",
    course: "Computer Science (CS 201)",
    description: "Collaboration space for algorithm walkthroughs, problem sets, and coding interview practice.",
    members: [
      { id: "m1", name: "Alex Chen", avatar: "AC", role: "Organizer" },
      { id: "m2", name: "Sarah Miller", avatar: "SM", role: "Note Lead" },
      { id: "m3", name: "Dev Patel", avatar: "DP", role: "Member" },
      { id: "m4", name: "Liam Zhang", avatar: "LZ", role: "Member" },
    ],
    pinnedResources: [
      {
        id: "pin-1",
        title: "Dijkstra vs Bellman-Ford Decision Matrix",
        author: "Alex Chen",
        timestamp: "Yesterday at 6:40 PM",
        content: "Use Dijkstra when all edge weights are >= 0 for O((V+E)logV). If negative edges exist, must use Bellman-Ford in O(VE) to detect negative cycles.",
        tags: ["Cheat Sheet", "Shortest Path", "Midterm"]
      },
      {
        id: "pin-2",
        title: "Topological Sort Pseudocode & Invariants",
        author: "Sarah Miller",
        timestamp: "2 days ago",
        content: "DFS with post-order traversal reversed, or Kahn's in-degree queue algorithm. Only works on Directed Acyclic Graphs (DAGs).",
        tags: ["Algorithms", "Topological Sort"]
      }
    ],
    sharedTasks: [
      {
        id: "st-1",
        title: "Alex: Write test cases for Dijkstra priority queue",
        description: "Verify edge cases including disconnected nodes and multi-component graphs.",
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        priority: "high",
        category: "project",
        course: "Computer Science (CS 201)",
        completed: false,
        assignedTo: "Alex Chen",
        createdAt: new Date().toISOString()
      },
      {
        id: "st-2",
        title: "Sarah: Summarize CLRS Chapter 22 Graph Properties",
        description: "Extract essential definitions and tree edge classifications (Tree, Back, Forward, Cross).",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        priority: "medium",
        category: "reading",
        course: "Computer Science (CS 201)",
        completed: true,
        assignedTo: "Sarah Miller",
        createdAt: new Date().toISOString()
      },
      {
        id: "st-3",
        title: "Dev & Liam: Benchmark adjacency list memory usage",
        description: "Run memory profiler on 10,000 vertex graph benchmark.",
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
        priority: "low",
        category: "assignment",
        course: "Computer Science (CS 201)",
        completed: false,
        assignedTo: "Dev Patel",
        createdAt: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: "msg-1",
        author: "Alex Chen",
        avatar: "AC",
        time: "10:14 AM",
        text: "Hey everyone! I just uploaded the Lecture 8 notes into our AI Workspace. It generated the 5-question practice quiz — make sure to test your recall on the negative weights trap!",
        likes: 3
      },
      {
        id: "msg-2",
        author: "Sarah Miller",
        avatar: "SM",
        time: "10:32 AM",
        text: "Awesome! The deadline extraction caught Assignment 3 due next Tuesday. I synced it straight to Google Calendar using the .ics export button.",
        likes: 2
      },
      {
        id: "msg-3",
        author: "Dev Patel",
        avatar: "DP",
        time: "11:05 AM",
        text: "Let's meet in the library third floor tomorrow at 3 PM to review the practice quiz answers together.",
        likes: 4
      }
    ]
  },
  {
    id: "group-bio",
    name: "BIO 110 Molecular Bio Peer Group",
    course: "Molecular Biology (BIO 110)",
    description: "Lab report collaboration, respiration reaction pathways, and exam flashcard sharing.",
    members: [
      { id: "bm1", name: "Maya Lin", avatar: "ML", role: "Lab Lead" },
      { id: "bm2", name: "Jordan Reed", avatar: "JR", role: "Member" },
      { id: "bm3", name: "Chloe Vance", avatar: "CV", role: "Member" }
    ],
    pinnedResources: [
      {
        id: "pin-bio-1",
        title: "Net ATP Balance Sheet for Aerobic Respiration",
        author: "Maya Lin",
        timestamp: "3 days ago",
        content: "Glycolysis: 2 ATP + 2 NADH. Pyruvate Ox: 2 NADH. Krebs Cycle: 2 ATP + 6 NADH + 2 FADH2. Total: ~30-32 ATP per glucose molecule.",
        tags: ["Bioenergetics", "Respiration", "Exam"]
      }
    ],
    sharedTasks: [
      {
        id: "st-bio-1",
        title: "Maya: Standardize spectrophotometer calibration curves",
        description: "Plot absorbance at 540nm against known glucose concentration standards.",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        priority: "high",
        category: "lab",
        course: "Molecular Biology (BIO 110)",
        completed: false,
        assignedTo: "Maya Lin",
        createdAt: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: "bmsg-1",
        author: "Maya Lin",
        avatar: "ML",
        time: "Yesterday",
        text: "Remember to submit Lab Report 4 before Thursday 5 PM sharp! Don't forget the error bar calculations.",
        likes: 2
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Upcoming Assignment Due Soon",
    message: "ECON 102: Problem Set 4 is due in 24 hours. Click to view details.",
    timestamp: "10 mins ago",
    type: "due-soon",
    read: false,
    taskId: "task-3"
  },
  {
    id: "notif-2",
    title: "Study Group Milestone Added",
    message: "Alex Chen assigned 'Write test cases for Dijkstra' in CS 201 study squad.",
    timestamp: "1 hour ago",
    type: "study-group",
    read: false
  },
  {
    id: "notif-3",
    title: "Quiz Mastery Alert",
    message: "You scored 100% on the Graph Traversal active recall quiz! High five!",
    timestamp: "3 hours ago",
    type: "quiz-score",
    read: true
  }
];
