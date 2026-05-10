import { Scissors } from 'lucide-react'

export default function CutSuggestions({ suggestions }) {
  if (!suggestions?.length) {
    return (
      <div className="card p-6">
        <p className="label-tag mb-1">Edit Recommendations</p>
        <h3 className="font-display text-ink-100 text-xl mb-4">Suggested Cuts</h3>
        <div className="card-inner p-6 text-center">
          <p className="font-mono text-ink-500 text-sm">No cut suggestions — engagement is strong throughout.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-tag mb-1">Edit Recommendations</p>
          <h3 className="font-display text-ink-100 text-xl">Suggested Cuts</h3>
        </div>
        <p className="font-mono text-xs text-ink-500">
          Could save {suggestions.reduce((s, c) => s + c.duration, 0).toFixed(0)}s
        </p>
      </div>

      <div className="space-y-3">
        {suggestions.map((cut, i) => (
          <div key={i} className="card-inner p-4 border border-ink-800/40
                                  hover:border-signal-amber/20 transition-all duration-200 group">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-signal-amber/10 border border-signal-amber/20
                              flex items-center justify-center mt-0.5 group-hover:bg-signal-amber/15 transition-colors">
                <Scissors size={16} className="text-signal-amber" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="font-mono text-sm font-medium text-ink-200">
                    {cut.start_str} → {cut.end_str}
                  </span>
                  <span className="font-mono text-xs text-ink-500 border border-ink-800 px-2 py-0.5 rounded">
                    {cut.duration}s
                  </span>
                  <span className="font-mono text-xs text-signal-red border border-signal-red/20 bg-signal-red/5 px-2 py-0.5 rounded">
                    {cut.avg_engagement.toFixed(0)}% avg engagement
                  </span>
                </div>
                <p className="font-body text-ink-500 text-sm">{cut.reason}</p>
              </div>

              {/* Priority indicator */}
              <div className="flex-shrink-0 text-right">
                <p className="font-mono text-[10px] text-ink-600 mb-1">priority</p>
                <div className="flex gap-0.5 justify-end">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: cut.avg_engagement < 20 ? '#e63946' :
                                         cut.avg_engagement < 30 ? '#f4a261' : '#5e4c40',
                        opacity: dot <= (cut.avg_engagement < 20 ? 3 : cut.avg_engagement < 30 ? 2 : 1) ? 1 : 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[10px] text-ink-700 mt-4 text-center">
        Suggestions based on sustained engagement below 35% threshold for ≥5 seconds
      </p>
    </div>
  )
}
