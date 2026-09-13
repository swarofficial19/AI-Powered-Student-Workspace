import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  Brain,
  Shield,
  Layers,
  GraduationCap,
  Download,
  Zap,
  Star,
  FileText
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  theme,
  onToggleTheme,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the AI process lecture PDFs, slides, and audio transcripts?",
      answer:
        "The workspace connects with Gemini 3.8 Flash via a secure server proxy to ingest complex academic PDFs, slide decks, or typed notes. It analyzes core mathematical theorems, definitions, and syllabus timelines, outputting formatted executive summaries and exam revision notes.",
    },
    {
      question: "How does the 5-Question Active Recall Practice Quiz work?",
      answer:
        "Every time a lecture or study guide is synthesized, the system generates exactly 5 conceptual multiple-choice questions with 4 distinct choices, the verified answer, and an in-depth pedagogical explanation to test understanding before midterm exams.",
    },
    {
      question: "Can I sync deadlines to my Google, Apple, or Outlook Calendar?",
      answer:
        "Yes! The workspace provides both one-click RFC 5545 iCalendar (.ics) exports with automated 24-hour reminder alarms, as well as direct 'Add to Google Calendar' event links for each individual assignment.",
    },
    {
      question: "How do the Shared Study Group Boards work with peers?",
      answer:
        "You can form or join Study Squads (e.g., CS 201 Algorithms, BIO 110 Peer Group). Within each squad, members can delegate group tasks, pin revision formulas, and discuss difficult exam concepts in an interactive live Q&A feed.",
    },
    {
      question: "Can I export my study kits to Markdown or JSON?",
      answer:
        "Yes! Every generated study kit features 1-click downloads for Markdown (.md) formatted note sheets, raw JSON schemas, and clean clipboard copying for Notion, Obsidian, or Anki.",
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Panel Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                AI Student Workspace
              </span>
              <span className="ml-1.5 hidden rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 sm:inline-block">
                v2.0
              </span>
            </div>
          </div>

          {/* Top Panel Section Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-800/50 p-1">
            <button
              onClick={() => scrollToSection("features")}
              className="rounded-full px-3.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="rounded-full px-3.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("faqs")}
              className="rounded-full px-3.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              FAQs
            </button>
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Sign In button */}
            <button
              onClick={onSignIn}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 px-3.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign In
            </button>

            {/* Get Started button */}
            <button
              onClick={onGetStarted}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Centered CTA */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Colorful background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[120px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* Lively pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-6 shadow-xs animate-in fade-in slide-in-from-top-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Built for High-Yield Student Success & Exam Mastery</span>
          </div>

          {/* High-Impact Headline */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-zinc-900 dark:text-white">
            Transform Raw Lecture Notes into{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              High-Yield Study Kits
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Eliminate hours of academic busywork. Ingest lecture PDFs, slides, and transcripts to
            instantly generate concise revision notes, 5-question active recall quizzes, automated
            deadline trackers, and cross-platform calendar synchronization.
          </p>

          {/* Centered "Get Started" CTA Button with Lively Glow */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => scrollToSection("features")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs transition-colors"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Free Google Sign-In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Multi-Format PDF & Slides Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Apple / Google / Outlook iCal Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful Features Section */}
      <section id="features" className="py-16 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Complete Student Toolset
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Colorful, Intuitive & Designed for Focus
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Everything you need to stay ahead of exams, track assignments, and collaborate with your study squad.
            </p>
          </div>

          {/* Grid of Colorful Feature Boxes */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Box 1: AI Summarizer (Indigo/Purple) */}
            <div className="group rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                AI Lecture Summarization
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Drop your lecture PDFs, PowerPoint slides, or audio transcripts. Get structured takeaways, key formulas, and high-yield revision cards in seconds.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Supports PDF, DOCX, Slides & Text</span>
              </div>
            </div>

            {/* Box 2: 5-Question Active Recall Quiz (Emerald) */}
            <div className="group rounded-3xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                5-Question Active Recall Quiz
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Immediate interactive practice with 4 multiple-choice options, instant pedagogical explanations, and score tracking to cement concepts.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Scientifically Proven Retention</span>
              </div>
            </div>

            {/* Box 3: Automated Deadline Tracking (Amber) */}
            <div className="group rounded-3xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md shadow-amber-500/20 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                Automated Deadline Tracking
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                AI automatically extracts scheduled deliverables and homework from course files. Real-time countdowns highlight urgent tasks due in 48 hours.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Priority Tagging & Countdown</span>
              </div>
            </div>

            {/* Box 4: Integrated Calendar Sync (Blue) */}
            <div className="group rounded-3xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                Cross-Platform Calendar Sync
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Visual interactive month grid with 1-click RFC 5545 iCal (.ics) exports with 24-hour reminder alarms for Apple, Google, and Outlook.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Google Cal & iCal Compatible</span>
              </div>
            </div>

            {/* Box 5: Shared Study Squad Boards (Rose/Pink) */}
            <div className="group rounded-3xl border border-rose-100 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/20 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                Shared Study Group Boards
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Coordinate assignments with classmates, pin formula sheets, and discuss practice quiz explanations in a live peer chat stream.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <span>Task Allocation & Peer Q&A</span>
              </div>
            </div>

            {/* Box 6: One-Click Export & Share (Violet) */}
            <div className="group rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/60 via-white to-white dark:from-purple-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20 mb-4">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                Universal Export & Sharing
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Download high-yield revision sheets as Markdown (.md) or JSON to seamlessly transfer into Notion, Obsidian, Anki, or printing.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Markdown, JSON & Clipboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                About The Workspace
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Created to Solve Student Cognitive Overload
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Between multiple courses, dense 60-slide lecture decks, lab assignments, and overlapping
                exam schedules, university students spend up to 40% of their study time just formatting
                notes and untangling syllabus dates.
              </p>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                The AI-Powered Student Workspace brings together cutting-edge LLM synthesis with practical
                productivity workflows: automated deadline extraction, calendar synchronizations, and
                immediate active recall testing.
              </p>

              {/* Lively Stat Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
                  <div className="font-display text-2xl font-black text-indigo-600 dark:text-indigo-400">5x</div>
                  <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Faster Revision</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
                  <div className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
                  <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Exam Grounded</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
                  <div className="font-display text-2xl font-black text-purple-600 dark:text-purple-400">0</div>
                  <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Missed Deadlines</div>
                </div>
              </div>
            </div>

            {/* Right Card Visual (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                      Exam Prep Architecture
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active System
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      1
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Input raw slides, lecture notes, or syllabus
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                      2
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Gemini 3.8 extracts formulas & syllabus milestones
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      3
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      5-Question quiz + sync to your phone calendar
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGetStarted}
                    className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Student Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Frequently Asked Questions
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Got Questions? We Have Answers.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Learn how the student workspace organizes your academic life.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? "rotate-180 text-indigo-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-850 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Final CTA */}
      <section className="py-16 border-t border-zinc-200 dark:border-zinc-850 bg-gradient-to-b from-indigo-50/50 to-purple-50/50 dark:from-zinc-950 dark:to-zinc-900 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h3 className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Ready to Ace Your Next Midterm?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Join thousands of university students streamlining their notes, quizzes, and deadlines.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 py-8 text-xs text-zinc-500 dark:text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-zinc-700 dark:text-zinc-300">AI-Powered Student Workspace</span>
          </div>
          <div>
            <span>Developed for Students • Google Cloud & Gemini Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
