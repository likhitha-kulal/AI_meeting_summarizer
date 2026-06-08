import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Music2, X, FileAudio, CheckCircle2 } from "lucide-react";

export default function UploadZone({ file, onFileChange, disabled }) {
  const inputRef  = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleClick     = () => { if (!disabled) inputRef.current.click(); };
  const clearFile       = (e) => { e.stopPropagation(); onFileChange(null); };

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : null;

  return (
    <motion.div
      whileHover={!disabled && !file ? { scale: 1.005 } : {}}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload audio file"
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={`
        relative rounded-3xl p-10 text-center cursor-pointer
        transition-all duration-300 outline-none select-none overflow-hidden
        ${dragging
          ? "border-2 border-indigo-400 bg-indigo-500/10 glow-indigo"
          : file
          ? "border-2 border-indigo-500/50 bg-indigo-500/8"
          : "border-2 border-dashed border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.03]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        glass
      `}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".wav,.mp3"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onFileChange(e.target.files[0] || null)}
      />

      {/* Drag overlay shimmer */}
      {dragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 shimmer pointer-events-none rounded-3xl"
        />
      )}

      <AnimatePresence mode="wait">
        {/* ── File selected state ── */}
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Icon with pulse ring */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center"
              >
                <Music2 className="w-9 h-9 text-indigo-400" />
              </motion.div>
              {/* Check badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#080812]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* File info */}
            <div className="space-y-1">
              <p className="font-semibold text-white text-sm truncate max-w-xs">
                {file.name}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400">{fileSizeMB} MB</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-emerald-400 font-medium">Ready to process</span>
              </div>
            </div>

            {/* Remove button */}
            {!disabled && (
              <motion.button
                onClick={clearFile}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove file
              </motion.button>
            )}
          </motion.div>
        ) : (
          /* ── Empty state ── */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Upload icon */}
            <motion.div
              animate={dragging
                ? { scale: 1.2, rotate: 8, y: -4 }
                : { scale: 1, rotate: 0, y: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center float">
                <Upload className="w-9 h-9 text-indigo-400" />
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-2xl border border-indigo-500/20 scale-110 opacity-50" />
              <div className="absolute inset-0 rounded-2xl border border-indigo-500/10 scale-125 opacity-30" />
            </motion.div>

            {/* Text */}
            <div className="space-y-2">
              <p className="font-bold text-white text-lg">
                {dragging ? "Drop it here!" : "Drop your audio file"}
              </p>
              <p className="text-sm text-slate-400">
                or{" "}
                <span className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                  click to browse
                </span>
              </p>
            </div>

            {/* Format badges */}
            <div className="flex items-center gap-2">
              {[".MP3", ".WAV"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-400"
                >
                  {fmt}
                </span>
              ))}
              <span className="text-xs text-slate-500">· Max 25 MB</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
