export type PriorityLevel = "high" | "medium" | "low";
export type TaskCategory = "assignment" | "exam" | "reading" | "project" | "lab";
export type TaskStatus = "todo" | "in_progress" | "completed";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  uid: "student-workspace-user",
  displayName: "Student",
  email: "student@helpify.workspace",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: PriorityLevel;
  category: TaskCategory;
  course: string;
  completed: boolean;
  assignedTo?: string;
  studyGroupId?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface CoreConcept {
  title: string;
  explanation: string;
  exampleOrFormula?: string;
}

export interface DetectedDeadline {
  title: string;
  dueDate: string;
  priority: PriorityLevel;
  category: TaskCategory;
  course: string;
  notes: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  questionType: string; // e.g. "Conceptual Breakdown", "Analytical Derivation", "Compare & Contrast", "Application / Case Study", "Short Answer"
  relevanceScore: string; // e.g. "98% Probability", "Core Exam Focus", "High Yield"
  marks: number; // e.g. 5, 8, 10
  modelAnswer: string;
  keyRubricPoints: string[];
  commonPitfalls?: string;
}

export interface LectureSummary {
  id: string;
  title: string;
  course: string;
  date: string;
  sourceType: "pdf" | "docs" | "slides" | "text";
  fileName?: string;
  studyMode: "comprehensive" | "cram" | "exam-prep";
  overview: string;
  keyTakeaways: string[];
  coreConcepts: CoreConcept[];
  examTips: string[];
  quiz: QuizQuestion[];
  examQuestions?: ExamQuestion[];
  detectedDeadlines: DetectedDeadline[];
}

export interface StudyGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface DiscussionMessage {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
}

export interface PinnedResource {
  id: string;
  title: string;
  author: string;
  timestamp: string;
  content: string;
  tags: string[];
}

export interface StudyGroupBoard {
  id: string;
  name: string;
  course: string;
  description: string;
  members: StudyGroupMember[];
  pinnedResources: PinnedResource[];
  sharedTasks: Task[];
  messages: DiscussionMessage[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "due-soon" | "study-group" | "quiz-score" | "system";
  read: boolean;
  taskId?: string;
}
