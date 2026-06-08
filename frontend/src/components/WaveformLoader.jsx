import { motion } from "framer-motion";

// Bar configs — varied heights and delays for organic feel
const BARS = [
  { delay: 0.00, min: 12, max: 55 },
  { delay: 0.08, min: 20, max: 80 },
  { delay: 0.16, min: 8,  max: 100 },
  { delay: 0.24, min: 28, max: 72 },
  { delay: 0.32, min: 6,  max: 90 },
  { delay: 0.40, min: 18, max: 64 },
  { delay: 0.48, min: 30, max: 96 },
  { delay: 0.56, min: 10, max: 78 },
  { delay: 0.64, min: 22, max: 88 },
  { delay: 0.72, min: 14, max: 60 },
  { delay: 0.64, min: 26, max: 84 },
  { delay: 0.56, min: 8,  max: 70 },
  { delay: 0.48, min: 32, max: 92 },
  { delay: 0.40, min: 16, max: 58 },
  { delay: 0.32, min: 20, max: 76 },
];

// Step labels shown below the waveform
const STEPS = [
  { label: "Decoding Audio",    done: true  },
  { label: "Transcribing",      done: true  },
  { label: "Summarizing",       done: false },
];

export default function WaveformLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      {/* ── Card ── */}
      <div className="relative w-full max-w-md glass-strong rounded-3xl p-10 overflow-hidden">

        {/* Background glow blobs */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* AI badge */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30"
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
            <span className="text-xs font-semibold text-indigo-300 tracking-wider uppercase">
              AI Processing
            </span>
          </motion.div>
        </div>

        {/* ── Waveform ── */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer glow halo */}
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-72 h-24 bg-indigo-500/15 rounded-full blur-2xl"
          />

          {/* Bars */}
          <div className="relative flex items-center justify-center gap-[4px]" style={{ height: 100 }}>
            {BARS.map((bar, i) => (
              <motion.div
                key={i}
                animate={{ height: [bar.min, bar.max, bar.min] }}
                transition={{
                  duration: 0.75 + (i % 3) * 0.15,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: bar.delay,
                  ease: "easeInOut",
                }}
                className="rounded-full"
                style={{
                  width: 5,
                  minHeight: bar.min,
                  background: `linear-gradient(to top,
                    #4f46e5 0%,
                    #818cf8 40%,
                    #c084fc 70%,
                    #f472b6 100%
                  )`,
                  boxShadow: `
                    0 0 6px rgba(99,102,241,0.9),
                    0 0 14px rgba(167,139,250,0.5),
                    0 0 28px rgba(244,114,182,0.2)
                  `,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Label ── */}
        <div className="text-center mb-8">
          <motion.h3
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-bold text-gradient mb-2"
          >
            Analyzing Meeting Audio...
          </motion.h3>
          <p className="text-sm text-slate-400">
            Transcribing speech and extracting key insights
          </p>
        </div>

        {/* ── Step indicators ── */}
        <div className="flex items-center justify-center gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={step.done
                  ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
                  : { opacity: [0.3, 0.7, 0.3] }
                }
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                className={`w-2 h-2 rounded-full ${
                  step.done ? "bg-indigo-400" : "bg-slate-600"
                }`}
              />
              <span className={`text-[10px] font-medium tracking-wide ${
                step.done ? "text-indigo-300" : "text-slate-600"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/3 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, #818cf8, #c084fc, transparent)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
