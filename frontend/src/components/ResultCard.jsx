import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function ResultCard({
  title,
  icon: Icon,
  iconColor    = "text-indigo-400",
  iconBg       = "bg-indigo-500/15",
  borderColor  = "border-indigo-500/20",
  glowClass    = "glow-sm",
  delay        = 0,
  children,
  defaultOpen  = true,
  copyText     = null,
}) {
  const [open, setOpen]     = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass rounded-2xl overflow-hidden ${glowClass} border ${borderColor}`}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors group"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4.5 h-4.5 ${iconColor}`} style={{ width: 18, height: 18 }} />
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          {copyText && (
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              {copied
                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                : <Copy className="w-3.5 h-3.5 text-slate-400" />
              }
            </motion.button>
          )}

          {/* Chevron */}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
