import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Filter,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  ArrowUpDown,
  Search,
  BookOpen
} from "lucide-react";
import { Task, PriorityLevel, TaskCategory } from "../types";
import { getDeadlineUrgency } from "../utils/notifications";
import { downloadCalendarICS, getGoogleCalendarEventUrl } from "../utils/calendarSync";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onOpenCalendarView: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  setTasks,
  onOpenCalendarView,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"urgency" | "date" | "priority">("urgency");
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("Computer Science (CS 201)");
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [newPriority, setNewPriority] = useState<PriorityLevel>("high");
  const [newCategory, setNewCategory] = useState<TaskCategory>("assignment");
  const [newDescription, setNewDescription] = useState("");

  // Toggle completed
  const handleToggleCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Add new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      course: newCourse,
      dueDate: newDueDate,
      priority: newPriority,
      category: newCategory,
      description: newDescription.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setShowAddModal(false);
  };

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filterStatus === "active" && t.completed) return false;
        if (filterStatus === "completed" && !t.completed) return false;
        if (filterPriority !== "all" && t.priority !== filterPriority) return false;
        if (filterCategory !== "all" && t.category !== filterCategory) return false;
        if (
          searchQuery &&
          !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.course.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "urgency") {
          // Incomplete first, then earliest due date
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "date") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "priority") {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return 0;
      });
  }, [tasks, filterStatus, filterPriority, filterCategory, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && getDeadlineUrgency(t.dueDate, t.completed).isOverdue
    ).length;
    const dueSoon = tasks.filter(
      (t) => !t.completed && getDeadlineUrgency(t.dueDate, t.completed).isSoon
    ).length;
    return { total, completed, overdue, dueSoon };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Top Header with Quick Metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl font-display">
            Task Management & Deadline Tracking
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            Automated countdowns, priority tagging, and integrated calendar export for all assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCalendarICS(tasks)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            title="Download .ics file to import directly into Apple Calendar, Google Calendar, or Outlook"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Sync All (.ICS)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-700 dark:bg-indigo-600 px-3.5 py-2 text-xs font-bold text-zinc-100 shadow-xs hover:bg-indigo-800 dark:hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Total Tasks</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-display text-zinc-900 dark:text-zinc-100">{stats.total}</span>
            <span className="text-xs text-zinc-500">items</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Due in 48 Hours
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-display text-amber-900 dark:text-amber-200">{stats.dueSoon}</span>
            <span className="text-xs text-amber-700 dark:text-amber-400">upcoming</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Overdue
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-display text-rose-900 dark:text-rose-200">{stats.overdue}</span>
            <span className="text-xs text-rose-700 dark:text-rose-400">needs action</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Completed
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-display text-emerald-900 dark:text-emerald-200">{stats.completed}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400">done</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments, exams, or courses..."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 py-1.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-850 p-1 border border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setFilterStatus("all")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "active"
                  ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "completed"
                  ? "bg-indigo-300 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 border-2 border-indigo-600 shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
              }`}
            >
              Done
            </button>
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">All Categories</option>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
            <option value="lab">Lab Report</option>
            <option value="reading">Reading</option>
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200"
          >
            <option value="urgency">Sort by Urgency</option>
            <option value="date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-12 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">No tasks found</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Try adjusting your search or filters, or add a new assignment.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const urgency = getDeadlineUrgency(task.dueDate, task.completed);
            const priorityBadge =
              task.priority === "high"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : task.priority === "medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div
                key={task.id}
                className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  task.completed
                    ? "border-zinc-300 dark:border-zinc-800 bg-zinc-200/50 dark:bg-zinc-900/40 opacity-70"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-750"
                }`}
              >
                {/* Checkbox and details */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleCompleted(task.id)}
                    className="mt-0.5 text-zinc-500 hover:text-indigo-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckSquare className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Square className="h-5 w-5 text-zinc-400 dark:text-zinc-600 hover:text-zinc-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${priorityBadge}`}>
                        {task.priority} Priority
                      </span>
                      <span className="rounded-md bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                        {task.category}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">{task.course}</span>
                    </div>

                    <h3
                      className={`text-sm font-bold leading-snug ${
                        task.completed ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Deadlines & Calendar Sync Actions */}
                <div className="flex items-center justify-between gap-3 pl-8 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">{task.dueDate}</div>
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${urgency.colorClass}`}>
                        {urgency.label}
                      </span>
                    </div>
                  </div>

                  {/* Sync to Google Calendar & Actions */}
                  <div className="flex items-center gap-1">
                    <a
                      href={getGoogleCalendarEventUrl(task)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 items-center gap-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100"
                      title="Add this event to Google Calendar"
                    >
                      <Calendar className="h-3 w-3 text-blue-500" />
                      <span className="hidden md:inline">Google Cal</span>
                    </a>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-zinc-100">Add Academic Task or Assignment</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Set priority tags and target deadlines with automated reminder triggers.
            </p>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Assignment / Exam Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Problem Set 4: Dynamic Programming"
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Course</label>
                  <input
                    type="text"
                    required
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Priority Tag</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="high">🔴 High (Urgent)</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="lab">Lab Report</option>
                    <option value="reading">Reading</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notes & Milestones (Optional)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Additional syllabus notes or sub-tasks..."
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-700 dark:bg-indigo-600 px-4 py-2 text-xs font-bold text-zinc-100 hover:bg-indigo-800 dark:hover:bg-indigo-500 shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
