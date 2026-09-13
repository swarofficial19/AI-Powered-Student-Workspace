import { LectureSummary } from "../types";

export function exportLectureToMarkdown(summary: LectureSummary): string {
  let md = `# ${summary.title}\n`;
  md += `**Course:** ${summary.course} | **Date:** ${summary.date} | **Mode:** ${summary.studyMode}\n\n`;

  md += `## 📌 Overview\n${summary.overview}\n\n`;

  md += `## 🎯 Key Takeaways\n`;
  summary.keyTakeaways.forEach((k) => {
    md += `- ${k}\n`;
  });
  md += `\n`;

  md += `## 💡 Core Concepts & Formulations\n`;
  summary.coreConcepts.forEach((c, idx) => {
    md += `### ${idx + 1}. ${c.title}\n${c.explanation}\n`;
    if (c.exampleOrFormula) {
      md += `> **Key Formula / Invariant:** \`${c.exampleOrFormula}\`\n`;
    }
    md += `\n`;
  });

  md += `## ⚡ Exam Tips & Trap Avoidance\n`;
  summary.examTips.forEach((tip) => {
    md += `- ${tip}\n`;
  });
  md += `\n`;

  if (summary.detectedDeadlines && summary.detectedDeadlines.length > 0) {
    md += `## 📅 Extracted Deadlines & Action Items\n`;
    summary.detectedDeadlines.forEach((d) => {
      md += `- **[${d.priority.toUpperCase()}]** ${d.title} (Due: ${d.dueDate}) - ${d.notes}\n`;
    });
    md += `\n`;
  }

  if (summary.quiz && summary.quiz.length > 0) {
    md += `## 🧠 5-Question Active Recall Practice Quiz\n`;
    summary.quiz.forEach((q, idx) => {
      md += `### Question ${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const marker = oIdx === q.correctAnswerIndex ? "(Correct) " : "";
        md += `  ${String.fromCharCode(65 + oIdx)}. ${marker}${opt}\n`;
      });
      md += `*Explanation:* ${q.explanation}\n\n`;
    });
  }

  if (summary.examQuestions && summary.examQuestions.length > 0) {
    md += `## 📝 Possible Exam Questions & Step-by-Step Solutions\n`;
    summary.examQuestions.forEach((eq, idx) => {
      md += `### ${idx + 1}. [${eq.questionType}] ${eq.question} (${eq.marks} Marks - ${eq.relevanceScore})\n\n`;
      md += `**Model Answer:**\n${eq.modelAnswer}\n\n`;
      if (eq.keyRubricPoints && eq.keyRubricPoints.length > 0) {
        md += `**Marking Rubric:**\n`;
        eq.keyRubricPoints.forEach((r) => {
          md += `- ${r}\n`;
        });
        md += `\n`;
      }
      if (eq.commonPitfalls) {
        md += `> ⚠️ **Common Pitfalls:** ${eq.commonPitfalls}\n\n`;
      }
    });
  }

  return md;
}

export function downloadMarkdownFile(summary: LectureSummary, filename?: string): void {
  const md = exportLectureToMarkdown(summary);
  const name = filename || `${summary.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_revision_notes.md`;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSONFile(summary: LectureSummary, filename?: string): void {
  const jsonStr = JSON.stringify(summary, null, 2);
  const name = filename || `${summary.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_data.json`;
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
