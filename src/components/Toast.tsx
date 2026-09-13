import React from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgBorder =
          toast.type === "success"
            ? "border-emerald-500/30 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-emerald-500/10"
            : toast.type === "warning"
            ? "border-amber-500/30 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-amber-500/10"
            : toast.type === "error"
            ? "border-rose-500/30 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-rose-500/10"
            : "border-indigo-500/30 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-indigo-500/10";

        const icon =
          toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          ) : toast.type === "error" ? (
            <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-indigo-500 shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${bgBorder}`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div>
                <h4 className="text-xs font-bold leading-tight font-display">{toast.title}</h4>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
