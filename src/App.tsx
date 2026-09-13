import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SlidingNavPanel, NavTabType } from "./components/SlidingNavPanel";
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { DashboardView } from "./components/DashboardView";
import { LectureProcessor } from "./components/LectureProcessor";
import { TaskManager } from "./components/TaskManager";
import { CalendarSyncView } from "./components/CalendarSyncView";
import { StudyGroupBoardView } from "./components/StudyGroupBoardView";
import { ToastContainer, ToastItem } from "./components/Toast";
import { Task, StudyGroupBoard, NotificationItem, DetectedDeadline } from "./types";
import { INITIAL_TASKS, INITIAL_STUDY_GROUPS, INITIAL_NOTIFICATIONS } from "./data/initialData";
import { checkUpcomingTaskAlerts, sendBrowserPushNotification, getDeadlineUrgency } from "./utils/notifications";
import { UserProfile, signOutUser } from "./utils/firebaseAuth";

export default function App() {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("sw_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Theme state: light vs dark
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("sw_theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  // Data persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("sw_tasks");
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [studyGroups, setStudyGroups] = useState<StudyGroupBoard[]>(() => {
    try {
      const saved = localStorage.getItem("sw_study_groups");
      return saved ? JSON.parse(saved) : INITIAL_STUDY_GROUPS;
    } catch {
      return INITIAL_STUDY_GROUPS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("sw_notifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: "success" | "info" | "warning" | "error", title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme class to root html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("sw_theme", theme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Sync user state
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("sw_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("sw_user");
      }
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [user]);

  // Sync tasks, study groups, notifications
  useEffect(() => {
    try {
      localStorage.setItem("sw_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("sw_study_groups", JSON.stringify(studyGroups));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [studyGroups]);

  useEffect(() => {
    try {
      localStorage.setItem("sw_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [notifications]);

  // Check upcoming assignments on mount and trigger notification
  useEffect(() => {
    const upcoming = checkUpcomingTaskAlerts(tasks);
    if (upcoming.length > 0) {
      sendBrowserPushNotification("Upcoming Assignment Alert", {
        body: `You have ${upcoming.length} deliverable(s) due within the next 48 hours!`,
      });
    }
  }, []);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setActiveTab("dashboard");
    addToast(
      "success",
      `Welcome, ${authenticatedUser.displayName}!`,
      "Successfully authenticated via Firebase Google Sign-In."
    );
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    addToast("info", "Signed Out", "You have safely signed out of your student workspace.");
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = !t.completed;
          if (updated) {
            addToast("success", "Task Completed! 🎉", `"${t.title}" marked as finished.`);
          }
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  // Add deadlines detected by AI Lecture Processor into the task management system
  const handleAddTasksFromAI = (deadlines: DetectedDeadline[]) => {
    const newTasks: Task[] = deadlines.map((dl, idx) => ({
      id: `task-ai-${Date.now()}-${idx}`,
      title: dl.title,
      description: dl.notes || `Extracted by AI copilot for ${dl.course}`,
      dueDate: dl.dueDate,
      priority: dl.priority,
      category: dl.category,
      course: dl.course,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...newTasks, ...prev]);

    // Push in-app notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "New Deadlines Added to Workspace",
      message: `Imported ${newTasks.length} task(s) into your deadline tracking & calendar sync.`,
      timestamp: "Just now",
      type: "system",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(
      "success",
      `Imported ${newTasks.length} Deadline(s)`,
      "Synced with Task Manager, iCal (.ICS) and Academic Calendar."
    );
  };

  const urgentTasksCount = tasks.filter(
    (t) => !t.completed && getDeadlineUrgency(t.dueDate, t.completed).isSoon
  ).length;

  // If user is not logged in, show the lively Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500 selection:text-white">
        <LandingPage
          onGetStarted={() => {
            setAuthModalMode("signup");
            setIsAuthModalOpen(true);
          }}
          onSignIn={() => {
            setAuthModalMode("signin");
            setIsAuthModalOpen(true);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // Authenticated User: Full Dashboard & Sliding Panel Workspace
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Sliding Navigation Panel */}
      <SlidingNavPanel
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          // On small screens, close panel after selecting a tab
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
        user={user}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={toggleTheme}
        urgentTasksCount={urgentTasksCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          setNotifications={setNotifications}
          tasks={tasks}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
        />

        {/* Workspace Body */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          {activeTab === "dashboard" && (
            <DashboardView
              user={user}
              tasks={tasks}
              studyGroups={studyGroups}
              onSelectTab={setActiveTab}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "summarizer" && (
            <LectureProcessor
              onAddTasks={handleAddTasksFromAI}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "tasks" && (
            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              onOpenCalendarView={() => setActiveTab("calendar")}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarSyncView
              tasks={tasks}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "study-groups" && (
            <StudyGroupBoardView
              studyGroups={studyGroups}
              setStudyGroups={setStudyGroups}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                AI-Powered Student Workspace
              </span>
              <span>•</span>
              <span>Signed in as {user.displayName}</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500">
              <span>Gemini 3.8 Flash Engine</span>
              <span>•</span>
              <span>RFC 5545 iCal Protocol</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal (if user opens account switcher) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
