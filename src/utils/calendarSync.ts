import { Task } from "../types";

/**
 * Formats a Date object or YYYY-MM-DD string into iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ
 */
function toICalDateTime(dateStr: string, timeStr?: string): string {
  const d = new Date(dateStr);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  let hour = "23";
  let min = "59";
  if (timeStr && timeStr.includes(":")) {
    const [h, m] = timeStr.split(":");
    hour = h.padStart(2, "0");
    min = m.padStart(2, "0");
  }

  return `${year}${month}${day}T${hour}${min}00Z`;
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Generates an RFC 5545 standard .ics file string for a list of student tasks.
 */
export function generateICalendarFile(tasks: Task[], calendarTitle = "Student Workspace Deadlines"): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI-Powered Student Workspace//EN",
    `X-WR-CALNAME:${escapeICalText(calendarTitle)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  tasks.forEach((task) => {
    const start = toICalDateTime(task.dueDate, task.dueTime);
    const end = start; // Point-in-time deadline
    const cleanDesc = escapeICalText(task.description || `Course: ${task.course} | Priority: ${task.priority.toUpperCase()}`);
    const cleanTitle = escapeICalText(`[${task.course}] ${task.title}`);

    ics.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@studentworkspace.ai`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDesc}`,
      `CATEGORIES:${task.category.toUpperCase()},STUDY`,
      `PRIORITY:${task.priority === "high" ? "1" : task.priority === "medium" ? "5" : "9"}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT24H", // 24-hour reminder
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${cleanTitle} is due tomorrow!`,
      "END:VALARM",
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Downloads the .ics file directly in the browser
 */
export function downloadCalendarICS(tasks: Task[], filename = "student_deadlines.ics"): void {
  const content = generateICalendarFile(tasks);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an interactive web link to add a single task directly to Google Calendar
 */
export function getGoogleCalendarEventUrl(task: Task): string {
  const d = new Date(task.dueDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dateFormatted = `${year}${month}${day}`;

  const title = encodeURIComponent(`[${task.course}] ${task.title}`);
  const details = encodeURIComponent(
    `${task.description || "Student Assignment / Milestone"}\nPriority: ${task.priority.toUpperCase()}\nCategory: ${task.category}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${dateFormatted}&details=${details}`;
}
