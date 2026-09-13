import { describe, it, expect } from "vitest";
import { getDeadlineUrgency, checkUpcomingTaskAlerts } from "../utils/notifications";
import { Task } from "../types";

describe("Deadline Urgency & Alert Automation", () => {
  it("marks completed tasks as completed regardless of date", () => {
    const status = getDeadlineUrgency("2020-01-01", true);
    expect(status.label).toBe("Completed");
    expect(status.isOverdue).toBe(false);
  });

  it("flags past dates as overdue for uncompleted tasks", () => {
    const status = getDeadlineUrgency("2020-01-01", false);
    expect(status.isOverdue).toBe(true);
    expect(status.label).toContain("Overdue");
  });

  it("correctly identifies tasks due within 48 hours for push alerts", () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000 * 1).toISOString().split("T")[0];
    const inTwoWeeks = new Date(now.getTime() + 86400000 * 14).toISOString().split("T")[0];

    const tasks: Task[] = [
      {
        id: "t1",
        title: "Urgent Lab Report",
        description: "Submit titration findings and error analysis.",
        dueDate: tomorrow,
        priority: "high",
        category: "lab",
        course: "CHEM 204",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "t2",
        title: "Distant Final Paper",
        description: "Term research paper on industrial revolutions.",
        dueDate: inTwoWeeks,
        priority: "low",
        category: "project",
        course: "HIST 150",
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];

    const alerts = checkUpcomingTaskAlerts(tasks);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].id).toBe("t1");
  });
});
