import { AlertTriangle } from 'lucide-react'

export default function DropOffPanel({ dropOffPoints }) {
  if (!dropOffPoints?.length) {
    return (
      <div className="card p-6">
        <p className="label-tag mb-1">Drop-off Detection</p>
        <h3 className="font-display text-ink-100 text-xl mb-4">Sharp Engagement Drops</h3>
        <div className="card-inner p-6 text-center">
          <p className="font-mono text-ink-500 text-sm">No significant drop-off points detected.</p>
          <p className="font-mono text-ink-600 text-xs mt-1">Great engagement consistency!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-tag mb-1">Drop-off Detection</p>
          <h3 className="font-display text-ink-100 text-xl">Sharp Engagement Drops</h3>
        </div>
        <span className="font-mono text-xs bg-signal-red/10 border border-signal-red/30 text-signal-red px-3 py-1 rounded-full">
          {dropOffPoints.length} event{dropOffPoints.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {dropOffPoints.map((dp, i) => (
          <div key={i} className="card-inner p-4 flex items-center gap-4 border border-ink-800/40
                                  hover:border-signal-red/20 transition-all duration-200 group">
            {/* Severity indicator */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-signal-red/10 border border-signal-red/20
                            flex items-center justify-center group-hover:bg-signal-red/15 transition-colors">
              <AlertTriangle size={18} className="text-signal-red" />
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0">
              <p className="font-mono text-xl text-ink-100 font-medium">{dp.timestamp_str}</p>
              <p className="font-mono text-[10px] text-ink-600">timestamp</p>
            </div>

            {/* Drop details */}
            <div className="flex-1 flex items-center gap-6">
              <div>
                <p className="font-mono text-xs text-ink-500">Before</p>
                <p className="font-mono text-sm text-ink-300">{dp.engagement_before.toFixed(0)}%</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-signal-red/40" />
                <span className="font-mono text-xs text-signal-red">−{dp.drop_magnitude.toFixed(1)}%</span>
                <div className="h-px w-8 bg-signal-red/40" />
              </div>
              <div>
                <p className="font-mono text-xs text-ink-500">After</p>
                <p className="font-mono text-sm text-signal-red">{dp.engagement_after.toFixed(0)}%</p>
              </div>
            </div>

            {/* Severity bar */}
            <div className="flex-shrink-0 w-20">
              <div className="h-1 bg-ink-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-red rounded-full"
                  style={{ width: `${Math.min(100, dp.drop_magnitude)}%` }}
                />
              </div>
              <p className="font-mono text-[9px] text-ink-600 mt-1 text-right">severity</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
