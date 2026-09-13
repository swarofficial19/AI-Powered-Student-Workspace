import React, { useState } from "react";
import {
  Users,
  Plus,
  Pin,
  MessageSquare,
  CheckSquare,
  Square,
  ThumbsUp,
  Send,
  Sparkles,
  BookOpen,
  Tag,
  Clock,
  CheckCircle2,
  Calendar,
  Share2
} from "lucide-react";
import { StudyGroupBoard, Task, PinnedResource, DiscussionMessage, StudyGroupMember } from "../types";
import { getDeadlineUrgency } from "../utils/notifications";

interface StudyGroupBoardViewProps {
  studyGroups: StudyGroupBoard[];
  setStudyGroups: React.Dispatch<React.SetStateAction<StudyGroupBoard[]>>;
}

export const StudyGroupBoardView: React.FC<StudyGroupBoardViewProps> = ({
  studyGroups,
  setStudyGroups,
}) => {
  const [activeGroupId, setActiveGroupId] = useState<string>(
    studyGroups[0]?.id || "group-cs"
  );
  const [newMessageText, setNewMessageText] = useState("");
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New resource form state
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceContent, setNewResourceContent] = useState("");
  const [newResourceTags, setNewResourceTags] = useState("Midterm, Summary");

  // New shared task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");

  const activeGroup = studyGroups.find((g) => g.id === activeGroupId) || studyGroups[0];

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeGroup) return;

    const newMsg: DiscussionMessage = {
      id: `msg-${Date.now()}`,
      author: "You (Student)",
      avatar: "ME",
      time: "Just now",
      text: newMessageText.trim(),
      likes: 0,
    };

    setStudyGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId
          ? { ...g, messages: [...g.messages, newMsg] }
          : g
      )
    );
    setNewMessageText("");
  };

  // Like message
  const handleLikeMessage = (msgId: string) => {
    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          messages: g.messages.map((m) =>
            m.id === msgId ? { ...m, likes: m.likes + 1 } : m
          ),
        };
      })
    );
  };

  // Toggle group task
  const handleToggleGroupTask = (taskId: string) => {
    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          sharedTasks: g.sharedTasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  };

  // Add pinned resource
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceContent.trim()) return;

    const newResource: PinnedResource = {
      id: `pin-${Date.now()}`,
      title: newResourceTitle.trim(),
      author: "You (Student)",
      timestamp: "Just now",
      content: newResourceContent.trim(),
      tags: newResourceTags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    setStudyGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId
          ? { ...g, pinnedResources: [newResource, ...g.pinnedResources] }
          : g
      )
    );

    setNewResourceTitle("");
    setNewResourceContent("");
    setShowAddResourceModal(false);
  };

  // Add shared task
  const handleAddSharedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `st-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: `Assigned in study squad ${activeGroup.name}`,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      category: "project",
      course: activeGroup.course,
      completed: false,
      assignedTo: newTaskAssignee || "Unassigned",
      createdAt: new Date().toISOString(),
    };

    setStudyGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId
          ? { ...g, sharedTasks: [newTask, ...g.sharedTasks] }
          : g
      )
    );

    setNewTaskTitle("");
    setShowAddTaskModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/80 via-white dark:via-zinc-900 to-indigo-50/80 dark:to-indigo-950/40 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              <Users className="h-3 w-3" /> Peer Collaboration
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-300">
              Shared Study Group Boards
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl font-display">
            Study Group Boards & Resource Sharing
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            Coordinate shared assignments, exchange revision notes, and discuss lecture quiz answers with study peers.
          </p>
        </div>

        {/* Group Selector Pills */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700 shadow-xs">
          {studyGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeGroupId === g.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Group Meta & Members Roster */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">{activeGroup.name}</h2>
            <span className="rounded-md bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {activeGroup.course}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{activeGroup.description}</p>
        </div>

        {/* Member list */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {activeGroup.members.map((m) => (
              <div
                key={m.id}
                title={`${m.name} (${m.role})`}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-800 text-[10px] font-bold text-white shadow-xs"
              >
                {m.avatar}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {activeGroup.members.length} Study Members
          </span>
        </div>
      </div>

      {/* 2-Column Board: Left = Tasks & Pinned Notes, Right = Discussion */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Shared Tasks & Pinned Resources (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* 1. Shared Tasks Board */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white">Group Milestones & Task Allocation</h3>
              </div>

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <Plus className="h-3 w-3 text-purple-600" />
                <span>Assign Task</span>
              </button>
            </div>

            {/* Task list */}
            <div className="mt-3 space-y-2">
              {activeGroup.sharedTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  No shared tasks yet in this study squad.
                </div>
              ) : (
                activeGroup.sharedTasks.map((st) => {
                  const urgency = getDeadlineUrgency(st.dueDate, st.completed);
                  return (
                    <div
                      key={st.id}
                      className={`flex items-start justify-between rounded-2xl border p-3 transition-colors ${
                        st.completed
                          ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-60"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => handleToggleGroupTask(st.id)}
                          className="mt-0.5 text-zinc-400 hover:text-purple-600"
                        >
                          {st.completed ? (
                            <CheckSquare className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                          )}
                        </button>
                        <div>
                          <h4
                            className={`text-xs font-bold ${
                              st.completed ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-white"
                            }`}
                          >
                            {st.title}
                          </h4>
                          {st.description && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{st.description}</p>
                          )}
                          <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                            {st.assignedTo && (
                              <span className="rounded-md bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 font-semibold text-purple-700 dark:text-purple-300">
                                Assigned: {st.assignedTo}
                              </span>
                            )}
                            <span className="font-mono text-zinc-500 dark:text-zinc-400">Due {st.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${urgency.colorClass}`}>
                        {urgency.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Pinned Study Resources & Revision Notes */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white">Pinned Notes & Revision Cheat Sheets</h3>
              </div>

              <button
                onClick={() => setShowAddResourceModal(true)}
                className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <Plus className="h-3 w-3 text-amber-600" />
                <span>Pin Resource</span>
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {activeGroup.pinnedResources.map((res) => (
                <div key={res.id} className="rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{res.title}</h4>
                    <span className="text-[10px] text-zinc-400">{res.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{res.content}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">By {res.author}</span>
                    {res.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded-md bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800 dark:text-amber-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Discussion Stream & Practice Review (5 cols) */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs lg:col-span-5 flex flex-col h-[640px]">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white">Study Squad Q&A Stream</h3>
            </div>
            <span className="text-[11px] font-semibold text-zinc-400">Live Peer Chat</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 space-y-3 overflow-y-auto py-3 pr-1">
            {activeGroup.messages.map((msg) => (
              <div key={msg.id} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                      {msg.avatar}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{msg.author}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{msg.time}</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-7">{msg.text}</p>
                <div className="mt-2 flex items-center justify-end pl-7">
                  <button
                    onClick={() => handleLikeMessage(msg.id)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{msg.likes > 0 ? msg.likes : "Like"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Ask a question or discuss practice quiz..."
              className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessageText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Modal: Pin Resource */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">Pin Study Resource / Formula Sheet</h3>
            <form onSubmit={handleAddResource} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Title</label>
                <input
                  type="text"
                  required
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  placeholder="e.g., Master Theorem Decision Tree"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Content / Summary</label>
                <textarea
                  rows={4}
                  required
                  value={newResourceContent}
                  onChange={(e) => setNewResourceContent(e.target.value)}
                  placeholder="Paste formulas, key bullet points, or revision tips..."
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newResourceTags}
                  onChange={(e) => setNewResourceTags(e.target.value)}
                  placeholder="Algorithms, Exam, Recurrences"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Pin to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Shared Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">Assign Group Task to Peer</h3>
            <form onSubmit={handleAddSharedTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Alex: Draft unit tests for graph traversal"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="">Select Member</option>
                    {activeGroup.members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white"
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Create Group Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
