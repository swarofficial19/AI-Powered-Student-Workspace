import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Share2
} from "lucide-react";
import { Task } from "../types";
import { downloadCalendarICS, getGoogleCalendarEventUrl } from "../utils/calendarSync";
import { getDeadlineUrgency } from "../utils/notifications";

interface CalendarSyncViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export const CalendarSyncView: React.FC<CalendarSyncViewProps> = ({
  tasks,
  onToggleTask,
}) => {
  // Calendar date navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean }> = [];

    // Prev month padding
    const prevMonthTotal = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthTotal - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().split("T")[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      days.push({
        dateStr: `${year}-${monthStr}-${dayStr}`,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Trailing padding to make a multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        dateStr: nextDate.toISOString().split("T")[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Map tasks to dates
  const tasksByDate = useMemo(() => {
    const map: { [date: string]: Task[] } = {};
    tasks.forEach((t) => {
      if (!map[t.dueDate]) {
        map[t.dueDate] = [];
      }
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  const selectedDayTasks = tasksByDate[selectedDateStr] || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Calendar Header with Sync Actions */}
      <div className="flex flex-col gap-4 rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 via-white dark:via-zinc-900 to-indigo-50/80 dark:to-indigo-950/40 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              <CalendarIcon className="h-3 w-3" /> Synchronization Hub
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              Cross-Platform Calendar Integration
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl font-display">
            Integrated Academic Calendar
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            Sync deadlines with Google Calendar, Apple Calendar, and Microsoft Outlook.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadCalendarICS(tasks, "academic_schedule.ics")}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download All (.ICS)</span>
          </button>
        </div>
      </div>

      {/* Main Calendar & Day Inspector Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Monthly Visual Calendar (8 cols) */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs lg:col-span-8">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Days Grid */}
          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const dayTasks = tasksByDate[day.dateStr] || [];
              const isSelected = selectedDateStr === day.dateStr;
              const isToday = todayStr === day.dateStr;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`min-h-[76px] rounded-2xl border p-1.5 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-600"
                      : isToday
                      ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30"
                      : day.isCurrentMonth
                      ? "border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700"
                      : "border-transparent bg-zinc-50/40 dark:bg-zinc-900/30 text-zinc-300 dark:text-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-black"
                          : day.isCurrentMonth
                          ? "text-zinc-800 dark:text-zinc-200"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[9px] font-bold text-zinc-600 dark:text-zinc-300">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Dots / mini badges */}
                  <div className="mt-1.5 space-y-1">
                    {dayTasks.slice(0, 2).map((t) => {
                      const dotColor =
                        t.priority === "high"
                          ? "bg-rose-500 text-rose-900 border-rose-200"
                          : t.priority === "medium"
                          ? "bg-amber-500 text-amber-900 border-amber-200"
                          : "bg-emerald-500 text-emerald-900 border-emerald-200";

                      return (
                        <div
                          key={t.id}
                          className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                          <span className="truncate">{t.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] font-bold text-zinc-400 pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Inspector (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Target Date Deliverables
                </span>
                <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-white">{selectedDateStr}</h3>
              </div>
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {selectedDayTasks.length} scheduled
              </span>
            </div>

            {/* List for selected date */}
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto">
              {selectedDayTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  <p className="mt-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">No deliverables on this date</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Click another date with colored indicators to view assignments.
                  </p>
                </div>
              ) : (
                selectedDayTasks.map((task) => {
                  const urgency = getDeadlineUrgency(task.dueDate, task.completed);
                  const priorityColor =
                    task.priority === "high"
                      ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                      : task.priority === "medium"
                      ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
                      : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900";

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2 bg-white dark:bg-zinc-850"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${priorityColor}`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                          {task.category}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{task.course}</p>
                      {task.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${urgency.colorClass}`}>
                          {urgency.label}
                        </span>

                        <a
                          href={getGoogleCalendarEventUrl(task)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Google Cal</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
