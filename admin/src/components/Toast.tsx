"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: "success" | "error";
}

export default function Toast({ message, visible, onHide, type = "success" }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  const color = type === "error" ? "var(--color-red)" : "var(--color-green)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-[500] flex items-center gap-2 px-5 py-3.5 rounded-lg text-sm"
          style={{ background: "var(--color-surface)", border: `1px solid ${color}`, color }}
        >
          {type === "success" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
