import { Star, Trophy } from 'lucide-react'
import { getRatingColor } from '../utils/api'

export function OverallScoreCard({ score, rating, videoStats }) {
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (circumference * score) / 100
  const color = getRatingColor(rating)

  return (
    <div className="card p-6">
      <p className="label-tag mb-4">Overall Assessment</p>

      <div className="flex items-center gap-8">
        {/* Score ring */}
        <div className="flex-shrink-0 relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#2a2118" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl text-ink-100">{score.toFixed(0)}</span>
            <span className="font-mono text-[10px] text-ink-500">/ 100</span>
          </div>
        </div>

        {/* Rating and stats */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} style={{ color }} />
            <span className="font-display text-2xl" style={{ color }}>{rating}</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Duration', value: videoStats.duration_str },
              { label: 'Frames analysed', value: videoStats.frames_analyzed.toLocaleString() },
              { label: 'FPS sampled', value: '2 FPS' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-mono text-xs text-ink-600">{label}</span>
                <span className="font-mono text-xs text-ink-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PeakMoments({ peaks }) {
  if (!peaks?.length) return null

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Star size={16} className="text-signal-green" />
        <div>
          <p className="label-tag">Top performing</p>
          <h3 className="font-display text-ink-100 text-xl">Peak Moments</h3>
        </div>
      </div>

      <div className="space-y-3">
        {peaks.map((peak, i) => (
          <div key={i} className="card-inner p-4 flex items-center gap-4 border border-ink-800/40
                                  hover:border-signal-green/20 transition-all duration-200">
            <div className="flex-shrink-0 font-display text-2xl text-ink-700">
              #{peak.rank}
            </div>

            <div className="flex-1">
              <p className="font-mono text-sm text-ink-200 font-medium">
                {peak.start_str} – {peak.end_str}
              </p>
              <p className="font-mono text-xs text-ink-500 mt-0.5">
                Highest engagement segment
              </p>
            </div>

            <div className="text-right">
              <p className="font-mono text-lg font-medium text-signal-green">
                {peak.avg_engagement}%
              </p>
              <p className="font-mono text-[10px] text-ink-600">avg engagement</p>
            </div>

            {/* Bar */}
            <div className="w-16">
              <div className="h-1 bg-ink-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${peak.avg_engagement}%`,
                    backgroundColor: '#2a9d8f',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
