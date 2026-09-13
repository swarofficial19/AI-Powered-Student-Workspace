import { describe, it, expect } from "vitest";
import { generateICalendarFile, getGoogleCalendarEventUrl } from "../utils/calendarSync";
import { Task } from "../types";

describe("Calendar Synchronization & RFC 5545 Compliance", () => {
  const mockTasks: Task[] = [
    {
      id: "task-test-1",
      title: "Problem Set 4: Graph Theory",
      description: "Complete exercises 4.1 through 4.8 on Dijkstra and BFS.",
      dueDate: "2026-10-15",
      dueTime: "23:59",
      priority: "high",
      category: "assignment",
      course: "CS 201",
      completed: false,
      createdAt: "2026-10-01T00:00:00Z"
    },
    {
      id: "task-test-2",
      title: "Midterm Exam",
      description: "In-class 80-minute closed-book midterm examination.",
      dueDate: "2026-10-22",
      priority: "high",
      category: "exam",
      course: "CS 201",
      completed: false,
      createdAt: "2026-10-01T00:00:00Z"
    }
  ];

  it("produces a valid RFC 5545 iCalendar stream", () => {
    const ics = generateICalendarFile(mockTasks, "Test Course Deadlines");

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//AI-Powered Student Workspace//EN");
    expect(ics).toContain("X-WR-CALNAME:Test Course Deadlines");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("correctly encapsulates individual task VEVENT blocks with alarms", () => {
    const ics = generateICalendarFile(mockTasks);

    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:task-test-1@studentworkspace.ai");
    expect(ics).toContain("SUMMARY:[CS 201] Problem Set 4: Graph Theory");
    expect(ics).toContain("PRIORITY:1"); // High priority
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT24H");
    expect(ics).toContain("END:VEVENT");
  });

  it("generates a valid direct Google Calendar web render link", () => {
    const url = getGoogleCalendarEventUrl(mockTasks[0]);

    expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(url).toContain(encodeURIComponent("[CS 201] Problem Set 4: Graph Theory"));
    expect(url).toContain("dates=20261015/20261015");
  });
});
