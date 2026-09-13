import React from "react";
import {
  Sparkles,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  Flame,
  Plus,
  ExternalLink,
  Target
} from "lucide-react";
import { Task, StudyGroupBoard } from "../types";
import { UserProfile } from "../utils/firebaseAuth";
import { getDeadlineUrgency } from "../utils/notifications";
import { getGoogleCalendarEventUrl, downloadCalendarICS } from "../utils/calendarSync";

interface DashboardViewProps {
  user: UserProfile;
  tasks: Task[];
  studyGroups: StudyGroupBoard[];
  onSelectTab: (tab: "dashboard" | "summarizer" | "tasks" | "calendar" | "study-groups") => void;
  onToggleTask: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tasks,
  studyGroups,
  onSelectTab,
  onToggleTask,
}) => {
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const urgentTasks = pendingTasks.filter(
    (t) => getDeadlineUrgency(t.dueDate, t.completed).isSoon || getDeadlineUrgency(t.dueDate, t.completed).isOverdue
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome Banner with Hello message and Study Streak */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {currentDateFormatted}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>5 Day Study Streak</span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              Hello, {user.displayName || "Student"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Ready to conquer your academic goals today? You have{" "}
              <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {urgentTasks.length} urgent deliverable{urgentTasks.length === 1 ? "" : "s"}
              </strong>{" "}
              scheduled this week.
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onSelectTab("summarizer")}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Summarize Lecture PDF</span>
            </button>

            <button
              onClick={() => downloadCalendarICS(tasks)}
              className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Sync All to iCal (.ICS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Colorful Interactive KPI Boxes */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {/* Box 1: Lectures Synthesized (Indigo) */}
        <button
          onClick={() => onSelectTab("summarizer")}
          className="group rounded-3xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-zinc-900 p-5 text-left shadow-xs hover:shadow-md hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-display text-zinc-900 dark:text-white">3</div>
            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
              Study Kits Ready
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Notes & quizzes active
            </div>
          </div>
        </button>

        {/* Box 2: Pending Tasks & Urgency (Amber) */}
        <button
          onClick={() => onSelectTab("tasks")}
          className="group rounded-3xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/30 dark:to-zinc-900 p-5 text-left shadow-xs hover:shadow-md hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-display text-zinc-900 dark:text-white">
              {urgentTasks.length}
            </div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              Due in 48h
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              {pendingTasks.length} total pending
            </div>
          </div>
        </button>

        {/* Box 3: Quiz Accuracy / Target (Emerald) */}
        <button
          onClick={() => onSelectTab("summarizer")}
          className="group rounded-3xl border border-emerald-200/70 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-zinc-900 p-5 text-left shadow-xs hover:shadow-md hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Target className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-display text-zinc-900 dark:text-white">
              88%
            </div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              Recall Accuracy
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              15 questions mastered
            </div>
          </div>
        </button>

        {/* Box 4: Study Squads (Purple) */}
        <button
          onClick={() => onSelectTab("study-groups")}
          className="group rounded-3xl border border-purple-200/70 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/30 dark:to-zinc-900 p-5 text-left shadow-xs hover:shadow-md hover:border-purple-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-display text-zinc-900 dark:text-white">
              {studyGroups.length}
            </div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-0.5">
              Active Squads
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              7 peers collaborating
            </div>
          </div>
        </button>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Urgent Deadlines & Calendar Snapshot (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h2 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                  Urgent & Upcoming Deadlines
                </h2>
              </div>
              <button
                onClick={() => onSelectTab("tasks")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All Tasks ({tasks.length})</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {tasks.slice(0, 4).map((task) => {
                const urgency = getDeadlineUrgency(task.dueDate, task.completed);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                      task.completed
                        ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 opacity-60"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="text-zinc-400 hover:text-indigo-600 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-md border-2 border-zinc-300 dark:border-zinc-600" />
                        )}
                      </button>
                      <div>
                        <h3
                          className={`text-xs font-bold leading-tight ${
                            task.completed
                              ? "line-through text-zinc-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-[10px]">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {task.course}
                          </span>
                          <span className="text-zinc-400">•</span>
                          <span className="font-mono text-zinc-500">Due {task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${urgency.colorClass}`}>
                        {urgency.label}
                      </span>
                      <a
                        href={getGoogleCalendarEventUrl(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        title="Add to Google Calendar"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Launchpad to Core Tools */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <h2 className="font-display font-bold text-sm text-zinc-900 dark:text-white mb-3">
              Quick Workspace Modules
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                onClick={() => onSelectTab("summarizer")}
                className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 text-center hover:bg-indigo-100/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white mb-2 shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">AI Summarizer</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Notes & 5-MCQ Quiz</span>
              </button>

              <button
                onClick={() => onSelectTab("calendar")}
                className="flex flex-col items-center justify-center rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 text-center hover:bg-blue-100/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mb-2 shadow-xs">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Calendar Sync</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Month Grid & iCal</span>
              </button>

              <button
                onClick={() => onSelectTab("study-groups")}
                className="flex flex-col items-center justify-center rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20 p-4 text-center hover:bg-purple-100/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white mb-2 shadow-xs">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Study Squads</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Peer Q&A & Tasks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Loaded Study Kits & Squad Highlights (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Study Kits Ready */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                  Active Study Kits
                </h2>
              </div>
              <button
                onClick={() => onSelectTab("summarizer")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + New Synthesis
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    CS 201
                  </span>
                  <span className="text-[10px] text-zinc-400">Exam Mode</span>
                </div>
                <h3 className="font-display font-bold text-xs text-zinc-900 dark:text-white mt-1.5">
                  Graph Traversal & Dijkstra's Algorithm
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  5 Takesaways • 5 Quiz Questions • Problem Set extracted
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => onSelectTab("summarizer")}
                    className="rounded-xl bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-700"
                  >
                    Open Kit
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    BIO 110
                  </span>
                  <span className="text-[10px] text-zinc-400">Cram Mode</span>
                </div>
                <h3 className="font-display font-bold text-xs text-zinc-900 dark:text-white mt-1.5">
                  Cellular Respiration & Krebs Cycle
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  ATP Invariants • 5-Question Quiz • Lab Report due Friday
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => onSelectTab("summarizer")}
                    className="rounded-xl bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                  >
                    Open Kit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Study Squad Feed Highlight */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h2 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                  Study Squad Activity
                </h2>
              </div>
              <button
                onClick={() => onSelectTab("study-groups")}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Open Squad
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                  <span>Alex Chen (CS 201)</span>
                  <span>10m ago</span>
                </div>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                  "Pinned the Master Theorem decision flowchart in our group notes!"
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                  <span>Sarah Miller (BIO 110)</span>
                  <span>1h ago</span>
                </div>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                  "Took the 5-question active recall quiz, question 3 explanation is super helpful."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
