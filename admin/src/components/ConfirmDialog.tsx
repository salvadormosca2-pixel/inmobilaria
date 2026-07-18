"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-red/10 border border-red/20 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-red">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <h3 className="font-[Cormorant_Garamond,serif] text-xl mb-2">{title}</h3>
            <p className="text-sm text-muted mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={onCancel} className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-white hover:border-white transition-all">
                Cancelar
              </button>
              <button onClick={onConfirm} className="px-5 py-2.5 bg-red text-white rounded-lg text-sm font-medium hover:bg-red/80 transition-all">
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
