import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mic, Sparkles, FileText, ListChecks,
  RotateCcw, Zap, Brain, Clock, ChevronRight,
} from "lucide-react";

import UploadZone     from "./components/UploadZone";
import WaveformLoader from "./components/WaveformLoader";
import ResultCard     from "./components/ResultCard";
import Toast          from "./components/Toast";

const API_URL = "/process-meeting";

// ─── Background orbs ─────────────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top-left indigo */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px]"
      />
      {/* Bottom-right purple */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-purple-700 rounded-full blur-[120px]"
      />
      {/* Center faint */}
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-900 rounded-full blur-[140px]"
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass border border-white/8"
    >
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="text-left">
        <p className="text-white font-semibold text-xs leading-none">{value}</p>
        <p className="text-slate-500 text-[10px] mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Action item row ──────────────────────────────────────────────────────────
function ActionItem({ text, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0 group"
    >
      <motion.span
        whileHover={{ scale: 1.15 }}
        className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center"
      >
        <Zap className="w-3 h-3 text-emerald-400" />
      </motion.span>
      <span className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">
        {text}
      </span>
    </motion.li>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/8 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
        <div className="h-4 w-28 rounded-lg bg-white/5 shimmer" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded bg-white/5 shimmer" />
        <div className="h-3 w-5/6 rounded bg-white/5 shimmer" />
        <div className="h-3 w-4/6 rounded bg-white/5 shimmer" />
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || loading) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    // Show skeleton briefly before waveform
    setShowSkeleton(true);
    setTimeout(() => setShowSkeleton(false), 600);

    try {
      const { data } = await axios.post(API_URL, formData);
      setResult(data);
      toast.success("Meeting processed successfully!");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : err.message || "Something went wrong. Please try again.";
      toast.error(message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <>
      <Toast />
      <BackgroundOrbs />

      <div className="relative z-10 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12 pb-20">

          {/* ── Header ── */}
          <motion.header
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            {/* AI badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-500/25 text-xs font-semibold text-indigo-300 mb-6 tracking-wide"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.span>
              AI-Powered Meeting Intelligence
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-5xl sm:text-6xl font-black tracking-tight mb-4 leading-none"
            >
              <span className="text-white">Meeting </span>
              <span className="text-gradient">Processor</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-slate-400 text-base sm:text-lg max-w-sm mx-auto leading-relaxed"
            >
              Upload your recording and instantly get a transcript,
              smart summary, and action items.
            </motion.p>

            {/* Stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2.5 mt-8"
            >
              <StatPill icon={Brain}  label="Transcription" value="Whisper AI"   color="bg-indigo-500/60" />
              <StatPill icon={Sparkles} label="Summarization" value="LSA Model"  color="bg-purple-500/60" />
              <StatPill icon={Clock}  label="Processing"    value="100% Local"   color="bg-emerald-500/60" />
            </motion.div>
          </motion.header>

          {/* ── Main content ── */}
          <AnimatePresence mode="wait">

            {/* ── Upload form ── */}
            {!loading && !result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <UploadZone file={file} onFileChange={setFile} disabled={false} />

                {/* Submit button */}
                <div className="flex justify-center pt-1">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!file}
                    whileHover={file ? { scale: 1.04, y: -1 } : {}}
                    whileTap={file ? { scale: 0.97 } : {}}
                    className={`
                      relative flex items-center gap-3 px-8 py-3.5 rounded-2xl
                      font-semibold text-sm transition-all duration-300
                      ${file
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white glow-btn cursor-pointer"
                        : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/8"
                      }
                    `}
                  >
                    <Mic className="w-4 h-4" />
                    Process Meeting
                    {file && (
                      <>
                        <ChevronRight className="w-4 h-4 opacity-70" />
                        {/* Live indicator dot */}
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080812]"
                        />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Feature hints */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-6 pt-2"
                >
                  {[
                    { icon: FileText,   label: "Full Transcript" },
                    { icon: Sparkles,   label: "Smart Summary"   },
                    { icon: ListChecks, label: "Action Items"    },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ── Loading ── */}
            {loading && (
              <motion.div key="loading">
                {showSkeleton ? (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : (
                  <WaveformLoader />
                )}
              </motion.div>
            )}

            {/* ── Results ── */}
            {result && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Results header bar */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-3">
                    {/* Success indicator */}
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                      />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-base leading-none">
                        Analysis Complete
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {file?.name}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass border border-white/8 text-xs text-slate-300 hover:text-white hover:border-white/15 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    New Meeting
                  </motion.button>
                </motion.div>

                {/* ── Transcript card ── */}
                <ResultCard
                  title="Transcript"
                  icon={FileText}
                  iconColor="text-blue-400"
                  iconBg="bg-blue-500/15"
                  borderColor="border-blue-500/15"
                  glowClass=""
                  delay={0.05}
                  defaultOpen={false}
                  copyText={result.transcript}
                >
                  <div className="mt-3 max-h-56 overflow-y-auto pr-1">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.transcript}
                    </p>
                  </div>
                </ResultCard>

                {/* ── Summary card ── */}
                <ResultCard
                  title="Meeting Summary"
                  icon={Sparkles}
                  iconColor="text-purple-400"
                  iconBg="bg-purple-500/15"
                  borderColor="border-purple-500/15"
                  glowClass="glow-sm"
                  delay={0.15}
                  defaultOpen={true}
                  copyText={result.summary}
                >
                  <div className="mt-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </ResultCard>

                {/* ── Action items card ── */}
                <ResultCard
                  title={`Action Items ${result.action_items.length > 0 ? `(${result.action_items.length})` : ""}`}
                  icon={ListChecks}
                  iconColor="text-emerald-400"
                  iconBg="bg-emerald-500/15"
                  borderColor="border-emerald-500/15"
                  glowClass="glow-emerald"
                  delay={0.25}
                  defaultOpen={true}
                  copyText={result.action_items.join("\n")}
                >
                  {result.action_items.length > 0 ? (
                    <ul className="mt-2 divide-y divide-white/[0.04]">
                      {result.action_items.map((item, idx) => (
                        <ActionItem key={idx} text={item} index={idx} />
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3 flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                        <ListChecks className="w-4 h-4 text-slate-500" />
                      </div>
                      <p className="text-slate-500 text-sm italic">
                        No action items detected in this meeting.
                      </p>
                    </div>
                  )}
                </ResultCard>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-0 inset-x-0 py-3 text-center"
        >
          <p className="text-slate-600 text-xs">
            Powered by{" "}
            <span className="text-slate-500 font-medium">Whisper AI</span>
            {" · "}
            <span className="text-slate-500 font-medium">FastAPI</span>
            {" · "}
            <span className="text-slate-500 font-medium">React</span>
          </p>
        </motion.footer>
      </div>
    </>
  );
}
