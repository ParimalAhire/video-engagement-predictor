import { motion } from 'framer-motion'
import { ArrowLeft, Download, Zap } from 'lucide-react'
import EngagementChart from '../components/EngagementChart'
import RiskTimeline from '../components/RiskTimeline'
import DropOffPanel from '../components/DropOffPanel'
import CutSuggestions from '../components/CutSuggestions'
import { OverallScoreCard, PeakMoments } from '../components/ScoreCards'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
})

export default function ResultsPage({ result, filename, onReset }) {
  const handleExport = () => {
    const data = JSON.stringify(result, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename.replace(/\.[^.]+$/, '')}_engagement_analysis.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 noise-overlay pointer-events-none opacity-25" />

      {/* Header */}
      <header className="sticky top-0 z-20 px-8 py-4 border-b border-ink-900/60
                         bg-ink-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onReset}
              className="flex items-center gap-2 text-ink-500 hover:text-ink-200 transition-colors font-body text-sm">
              <ArrowLeft size={16} />
              New analysis
            </button>
            <div className="w-px h-5 bg-ink-800" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-ink-800 flex items-center justify-center">
                <Zap size={11} className="text-ink-400" />
              </div>
              <span className="font-body text-ink-400 text-sm truncate max-w-xs">{filename}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-sm py-2 px-4">
              <Download size={14} />
              Export JSON
            </button>
            <div className="flex items-center gap-2 bg-ink-900/60 border border-ink-800 rounded-xl px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
              <span className="font-mono text-xs text-ink-400">Analysis complete</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-8 py-8 space-y-6 relative z-10">

        {/* Top row — score + peak moments */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div className="lg:col-span-2" {...fadeUp(0)}>
            <OverallScoreCard
              score={result.overall_score}
              rating={result.overall_rating}
              videoStats={result.video_stats}
            />
          </motion.div>
          <motion.div className="lg:col-span-3" {...fadeUp(0.05)}>
            <PeakMoments peaks={result.peak_moments} />
          </motion.div>
        </div>

        {/* Engagement chart — full width */}
        <motion.div {...fadeUp(0.1)}>
          <EngagementChart
            data={result.engagement_curve}
            dropOffPoints={result.drop_off_points}
          />
        </motion.div>

        {/* Risk timeline — full width */}
        <motion.div {...fadeUp(0.15)}>
          <RiskTimeline
            riskZones={result.risk_zones}
            duration={result.video_stats.duration}
          />
        </motion.div>

        {/* Drop-offs + cut suggestions side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div {...fadeUp(0.2)}>
            <DropOffPanel dropOffPoints={result.drop_off_points} />
          </motion.div>
          <motion.div {...fadeUp(0.25)}>
            <CutSuggestions suggestions={result.cut_suggestions} />
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.div {...fadeUp(0.3)}
          className="text-center pb-8">
          <p className="label-tag">
            MIT Academy of Engineering
          </p>
        </motion.div>
      </main>
    </div>
  )
}
