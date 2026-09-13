import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Plus,
  Zap,
  BookMarked,
  Sliders,
  AlertCircle
} from "lucide-react";
import { LectureSummary, Task, DetectedDeadline } from "../types";
import { SAMPLE_LECTURES } from "../data/initialData";
import { downloadMarkdownFile, downloadJSONFile } from "../utils/exportNotes";

interface LectureProcessorProps {
  onAddTasks: (deadlines: DetectedDeadline[]) => void;
  onSelectTab: (tab: "dashboard" | "summarizer" | "tasks" | "calendar" | "study-groups") => void;
}

const COURSES = [
  "Computer Science (CS 201)",
  "Molecular Biology (BIO 110)",
  "Macroeconomics (ECON 102)",
  "Calculus & Linear Algebra (MATH 220)",
  "Organic Chemistry (CHEM 204)",
  "World History (HIST 150)",
  "Data Science & Machine Learning",
  "General / Custom Course"
];

export const LectureProcessor: React.FC<LectureProcessorProps> = ({
  onAddTasks,
  onSelectTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"notes" | "quiz" | "deadlines">("notes");
  const [course, setCourse] = useState(COURSES[0]);
  const [studyMode, setStudyMode] = useState<"comprehensive" | "cram" | "exam-prep">("comprehensive");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active quiz state
  const [summary, setSummary] = useState<LectureSummary | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [addedDeadlineIds, setAddedDeadlineIds] = useState<{ [key: string]: boolean }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    // If text file / markdown, read as text directly
    if (file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTextInput((event.target?.result as string) || "");
      };
      reader.readAsText(file);
      setFileBase64(null);
    } else {
      // Convert to base64 for direct multimodal sending to Gemini backend
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        setFileBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-load sample lecture for instant 1-click test
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_LECTURES.find((s) => s.id === sampleId);
    if (!sample) return;

    setCourse(sample.course);
    setTextInput(sample.sampleContent);
    setInputMode("paste");
    setSelectedFile(null);
    setFileBase64(null);
    setError(null);
  };

  // Run AI processing
  const handleProcessLecture = async () => {
    if (!textInput.trim() && !fileBase64) {
      setError("Please upload a lecture document (PDF, Docs, Slides) or paste lecture text.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep("Extracting core academic concepts from document...");

    try {
      const payload: any = {
        course,
        studyMode,
        fileName: selectedFile?.name || "Uploaded_Lecture_Notes",
      };

      if (textInput.trim()) {
        payload.content = textInput;
      }
      if (fileBase64 && selectedFile) {
        payload.fileData = {
          data: fileBase64,
          mimeType: selectedFile.type || "application/pdf",
        };
      }

      setLoadingStep("Gemini 3.8 Flash synthesizing structured revision notes...");

      const response = await fetch("/api/ai/process-lecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      setLoadingStep("Generating 5-question active recall practice quiz...");

      const data = await response.json();

      const newSummary: LectureSummary = {
        id: `sum-${Date.now()}`,
        title: data.title || "Lecture Synthesis",
        course: data.course || course,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        sourceType: selectedFile?.name.endsWith(".pptx") ? "slides" : selectedFile?.name.endsWith(".docx") ? "docs" : "pdf",
        fileName: selectedFile?.name,
        studyMode,
        overview: data.overview || "High-level summary of lecture.",
        keyTakeaways: data.keyTakeaways || [],
        coreConcepts: data.coreConcepts || [],
        examTips: data.examTips || [],
        quiz: data.quiz || [],
        detectedDeadlines: data.detectedDeadlines || [],
      };

      setSummary(newSummary);
      setSelectedAnswers({});
      setSubmittedQuiz(false);
      setAddedDeadlineIds({});
      setActiveSubTab("notes");
    } catch (err: any) {
      console.error("AI lecture processing notice:", err);
      let userMsg = "Failed to process lecture. Please retry.";
      try {
        if (typeof err.message === "string") {
          if (err.message.includes("high demand") || err.message.includes("503")) {
            userMsg = "The AI service experienced high traffic. Please tap 'Synthesize & Generate Study Materials' again.";
          } else {
            const parsed = JSON.parse(err.message);
            userMsg = parsed.error?.message || parsed.error || userMsg;
          }
        }
      } catch {
        userMsg = err.message || userMsg;
      }
      setError(userMsg);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Quiz helper
  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const calculateQuizScore = () => {
    if (!summary || !summary.quiz) return { score: 0, total: 0 };
    let correct = 0;
    summary.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return { score: correct, total: summary.quiz.length };
  };

  // Handle adding single deadline to workspace
  const handleAddSingleDeadline = (dl: DetectedDeadline, index: number) => {
    onAddTasks([dl]);
    setAddedDeadlineIds((prev) => ({ ...prev, [index]: true }));
  };

  // Handle adding all detected deadlines
  const handleAddAllDeadlines = () => {
    if (!summary || !summary.detectedDeadlines.length) return;
    onAddTasks(summary.detectedDeadlines);
    const marked: { [key: string]: boolean } = {};
    summary.detectedDeadlines.forEach((_, idx) => {
      marked[idx] = true;
    });
    setAddedDeadlineIds(marked);
  };

  const handleCopyNotes = () => {
    if (!summary) return;
    const text = `${summary.title}\n\nOverview:\n${summary.overview}\n\nKey Takeaways:\n${summary.keyTakeaways.join(
      "\n"
    )}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Problem Statement Flow Indicator */}
      <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white dark:via-zinc-900 to-blue-50/80 dark:to-blue-950/40 p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <Zap className="h-3 w-3" /> Core AI Flow
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Lecture Material → Revision Notes + Quiz + Deadlines
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl font-display">
              AI-Powered Lecture Synthesis & Quiz Copilot
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              Upload course PDFs, lecture slide decks, syllabus outlines, or transcripts. Gemini 3.8 Flash distills
              essential concepts, creates a 5-question active recall practice quiz, and extracts deadline timelines.
            </p>
          </div>

          {/* 1-Click Sample Preloaders for instant testing */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 p-2 text-xs">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">Quick Test Samples:</span>
            {SAMPLE_LECTURES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample.id)}
                className="rounded-xl bg-zinc-100 dark:bg-zinc-700/60 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {sample.id === "cs-graph-theory" ? "💻 CS 201 Graphs" : sample.id === "bio-cellular-respiration" ? "🧬 Bio 110 Respiration" : "📊 Econ 102 Policy"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input, Document Upload, & Personalisation (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 font-display">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              1. Input Lecture Material
            </h2>

            {/* Input Mode Toggle */}
            <div className="mt-3 flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <button
                onClick={() => setInputMode("upload")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  inputMode === "upload" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                File Upload (PDF / Slides / Docs)
              </button>
              <button
                onClick={() => setInputMode("paste")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  inputMode === "paste" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                Paste Transcript / Notes
              </button>
            </div>

            {/* File Upload Zone */}
            {inputMode === "upload" ? (
              <div className="mt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.pptx,.txt,.md,.json"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    selectedFile
                      ? "border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  {selectedFile ? (
                    <div className="mt-3">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-xs">{selectedFile.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace file
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Click to upload or drag & drop lecture file
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Supports PDF (.pdf), Slides (.pptx), Docs (.docx), Markdown, or Text
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your lecture notes, transcript, slide bullet points, or syllabus section here..."
                  rows={8}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/60 p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-400">
                  <span>{textInput.length} characters</span>
                  {textInput && (
                    <button
                      onClick={() => setTextInput("")}
                      className="text-zinc-500 hover:text-rose-600 transition-colors"
                    >
                      Clear text
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Light Personalisation Controls */}
            <div className="mt-5 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                2. Study Focus & Course Selection
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Subject / Course
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Study Focus Mode
                  </label>
                  <select
                    value={studyMode}
                    onChange={(e) => setStudyMode(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="comprehensive">Comprehensive (All Invariants)</option>
                    <option value="cram">Quick Cram (High Yield Summary)</option>
                    <option value="exam-prep">Exam Prep (Trap Warnings & Proofs)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Synthesize Button */}
            <div className="mt-5">
              <button
                id="btn-process-lecture"
                onClick={handleProcessLecture}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing with Gemini 3.8 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Generate Revision Notes & 5-Question Quiz</span>
                  </>
                )}
              </button>

              {loading && (
                <p className="mt-2 text-center font-mono text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                  {loadingStep}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Generated Output, Quiz Runner, & Deadlines (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          {!summary && !loading ? (
            /* Blank state encouraging action */
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3">
                <BookMarked className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">Your AI Study Output Will Appear Here</h3>
              <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Select one of the Quick Test Samples above or upload your own lecture notes to experience the end-to-end
                synthesis: condensed revision notes, a 5-question active recall quiz, and automated calendar-syncable deadlines.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleLoadSample("cs-graph-theory")}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Try CS 201 Graph Theory Sample →
                </button>
              </div>
            </div>
          ) : (
            /* Result Card with Tabs */
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
              {/* Output Header */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                        {summary?.course}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{summary?.date}</span>
                    </div>
                    <h2 className="mt-1 text-base font-bold font-display text-zinc-900 dark:text-white sm:text-lg">{summary?.title}</h2>
                  </div>

                  {/* Share & Export Actions */}
                  {summary && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyNotes}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        title="Copy summary text"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        onClick={() => downloadMarkdownFile(summary)}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        title="Download Markdown study sheet"
                      >
                        <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>.MD</span>
                      </button>

                      <button
                        onClick={() => downloadJSONFile(summary)}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        title="Download JSON data"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-600" />
                        <span>JSON</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub Tabs */}
                <div className="mt-4 flex gap-2 border-t border-zinc-200/60 dark:border-zinc-800 pt-3">
                  <button
                    onClick={() => setActiveSubTab("notes")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      activeSubTab === "notes"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Revision Notes</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab("quiz")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      activeSubTab === "quiz"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Practice Quiz (5 Qs)</span>
                    {submittedQuiz && (
                      <span className="rounded-full bg-white/20 px-1 text-[10px]">
                        {calculateQuizScore().score}/5
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveSubTab("deadlines")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      activeSubTab === "deadlines"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Detected Deadlines</span>
                    {summary?.detectedDeadlines && (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-black text-zinc-900">
                        {summary.detectedDeadlines.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-5 max-h-[580px] overflow-y-auto">
                {/* 1. REVISION NOTES TAB */}
                {activeSubTab === "notes" && summary && (
                  <div className="space-y-5">
                    {/* Executive Overview */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Executive Summary</h4>
                      <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">{summary.overview}</p>
                    </div>

                    {/* Key Takeaways */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                        Core High-Yield Takeaways
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {summary.keyTakeaways.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Core Concepts */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2.5">
                        Structured Conceptual Breakdown
                      </h4>
                      <div className="space-y-3">
                        {summary.coreConcepts.map((concept, idx) => (
                          <div key={idx} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-white dark:bg-zinc-850">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-700 text-[10px] font-bold text-white">
                                {idx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-white">{concept.title}</h5>
                            </div>
                            <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{concept.explanation}</p>
                            {concept.exampleOrFormula && (
                              <div className="mt-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 px-3 py-1.5 font-mono text-[11px] text-indigo-900 dark:text-indigo-300">
                                <span className="font-semibold text-zinc-500 mr-2">Formula/Rule:</span>
                                {concept.exampleOrFormula}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exam Tips */}
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-600" />
                        Exam Focal Points & Traps
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {summary.examTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-amber-950 dark:text-amber-200">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 2. PRACTICE QUIZ TAB */}
                {activeSubTab === "quiz" && summary && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-3.5 border border-indigo-100 dark:border-indigo-900/50">
                      <div>
                        <h4 className="text-xs font-bold font-display text-indigo-900 dark:text-indigo-200">5-Question Active Recall Quiz</h4>
                        <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                          Reinforce retention immediately after reviewing lecture notes.
                        </p>
                      </div>
                      {submittedQuiz && (
                        <div className="text-right">
                          <span className="text-sm font-black text-indigo-900 dark:text-indigo-200 font-mono">
                            {calculateQuizScore().score} / {calculateQuizScore().total}
                          </span>
                          <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {calculateQuizScore().score >= 4 ? "Mastery Achieved! 🎉" : "Review Notes & Retry"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Question list */}
                    <div className="space-y-4">
                      {summary.quiz.map((q, qIndex) => {
                        const selected = selectedAnswers[q.id];
                        const isAnswered = selected !== undefined;
                        const isCorrect = isAnswered && selected === q.correctAnswerIndex;

                        return (
                          <div
                            key={q.id}
                            className={`rounded-2xl border p-4 transition-all ${
                              submittedQuiz
                                ? isCorrect
                                  ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20"
                                  : "border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20"
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
                                {qIndex + 1}
                              </span>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">{q.question}</p>
                            </div>

                            {/* Options */}
                            <div className="mt-3 space-y-2 pl-7">
                              {q.options.map((opt, optIdx) => {
                                const isThisSelected = selected === optIdx;
                                const isThisCorrectAnswer = optIdx === q.correctAnswerIndex;

                                let btnStyle = "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750";

                                if (submittedQuiz) {
                                  if (isThisCorrectAnswer) {
                                    btnStyle = "border-emerald-400 dark:border-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-semibold";
                                  } else if (isThisSelected && !isThisCorrectAnswer) {
                                    btnStyle = "border-rose-300 dark:border-rose-800 bg-rose-100/70 dark:bg-rose-950/50 text-rose-900 dark:text-rose-300 line-through";
                                  } else {
                                    btnStyle = "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600";
                                  }
                                } else if (isThisSelected) {
                                  btnStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-600";
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleSelectOption(q.id, optIdx)}
                                    disabled={submittedQuiz}
                                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all ${btnStyle}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {submittedQuiz && isThisCorrectAnswer && (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    )}
                                    {submittedQuiz && isThisSelected && !isThisCorrectAnswer && (
                                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation shown after submit */}
                            {submittedQuiz && (
                              <div className="mt-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 p-2.5 text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 pl-7 leading-relaxed">
                                <span className="font-bold text-zinc-900 dark:text-white mr-1">Explanation:</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quiz Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      {!submittedQuiz ? (
                        <button
                          onClick={() => setSubmittedQuiz(true)}
                          disabled={Object.keys(selectedAnswers).length === 0}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          <span>Submit Answers & Check Score</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAnswers({});
                            setSubmittedQuiz(false);
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Retake Practice Quiz</span>
                        </button>
                      )}

                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {Object.keys(selectedAnswers).length} of {summary.quiz.length} answered
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. DETECTED DEADLINES TAB */}
                {activeSubTab === "deadlines" && summary && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3.5">
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          Automated Deadline & Milestone Extraction
                        </h4>
                        <p className="text-[11px] text-amber-800 dark:text-amber-400">
                          {summary.detectedDeadlines.length} actionable assignments and exam dates found in this lecture.
                        </p>
                      </div>

                      <button
                        onClick={handleAddAllDeadlines}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add All to My Tasks</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {summary.detectedDeadlines.map((dl, idx) => {
                        const isAdded = addedDeadlineIds[idx];
                        const priorityColor =
                          dl.priority === "high"
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900"
                            : dl.priority === "medium"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                            : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";

                        return (
                          <div
                            key={idx}
                            className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${priorityColor}`}>
                                  {dl.priority} Priority
                                </span>
                                <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                                  {dl.category}
                                </span>
                                <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                  Due: {dl.dueDate}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-white">{dl.title}</h5>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{dl.notes}</p>
                            </div>

                            <div className="shrink-0">
                              {isAdded ? (
                                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Check className="h-3.5 w-3.5" /> Added to Tasks
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAddSingleDeadline(dl, idx)}
                                  className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                  <span>Add to Tasks</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={() => onSelectTab("tasks")}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <span>Open Task Manager & Calendar Timeline</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
