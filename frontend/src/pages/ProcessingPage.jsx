import { motion } from 'framer-motion'
import { Zap, Film } from 'lucide-react'

export default function ProcessingPage({ progress, message, filename }) {
  const steps = [
    { label: 'Upload', threshold: 5 },
    { label: 'Frame extraction', threshold: 15 },
    { label: 'Feature extraction', threshold: 62 },
    { label: 'Model inference', threshold: 80 },
    { label: 'Computing metrics', threshold: 95 },
    { label: 'Done', threshold: 100 },
  ]

  const currentStep = steps.findIndex(s => progress < s.threshold)
  const activeStep = currentStep === -1 ? steps.length - 1 : Math.max(0, currentStep - 1)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 noise-overlay pointer-events-none opacity-30" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full opacity-[0.03]
                        bg-gradient-radial from-ink-400 to-transparent blur-3xl
                        animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Icon */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-ink-900 border border-ink-800 flex items-center justify-center">
              <Film size={36} className="text-ink-400" />
            </div>
            {/* Spinning ring */}
            <svg className="absolute -inset-2 w-24 h-24 -rotate-90 animate-spin" style={{ animationDuration: '3s' }}>
              <circle cx="48" cy="48" r="44" fill="none" stroke="#5e4c40" strokeWidth="1" strokeDasharray="276" strokeDashoffset="0" />
              <circle cx="48" cy="48" r="44" fill="none" stroke="#957e65" strokeWidth="1.5"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progress) / 100}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
          </div>
        </div>

        {/* File name */}
        <div className="text-center mb-8">
          <p className="label-tag mb-2">Analysing</p>
          <p className="font-display text-ink-200 text-xl truncate px-4">{filename}</p>
        </div>

        {/* Progress bar */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm text-ink-400">{message}</span>
            <span className="font-mono text-lg text-ink-200 font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-ink-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-ink-600 to-ink-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <div className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-500
                  ${i < activeStep ? 'bg-ink-500' :
                    i === activeStep ? 'bg-ink-300 scale-125 shadow-lg shadow-ink-500/50' :
                    'bg-ink-800'}
                `} />
                <span className={`
                  font-mono text-[9px] text-center leading-tight max-w-[60px]
                  ${i <= activeStep ? 'text-ink-400' : 'text-ink-700'}
                `}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          {/* Connecting line */}
          <div className="relative mt-[-22px] mb-4 mx-5">
            <div className="h-px bg-ink-900" />
            <motion.div
              className="absolute top-0 left-0 h-px bg-ink-600"
              animate={{ width: `${Math.min(100, (activeStep / (steps.length - 1)) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <p className="text-center label-tag mt-6">
          This may take 1–3 minutes depending on video length
        </p>
      </motion.div>
    </div>
  )
}
