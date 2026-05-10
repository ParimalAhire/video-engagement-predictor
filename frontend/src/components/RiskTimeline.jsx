import { getRiskColor } from '../utils/api'

export default function RiskTimeline({ riskZones, duration }) {
  if (!riskZones?.length) return null

  return (
    <div className="card p-6">
      <p className="label-tag mb-1">Risk Zones</p>
      <h3 className="font-display text-ink-100 text-xl mb-5">Engagement Risk Map</h3>

      {/* Timeline bar */}
      <div className="relative mb-4">
        <div className="flex h-6 rounded-full overflow-hidden gap-px">
          {riskZones.map((zone, i) => {
            const width = ((zone.end - zone.start) / duration) * 100
            return (
              <div
                key={i}
                className="relative group cursor-pointer transition-all duration-200 hover:brightness-125"
                style={{
                  width: `${Math.max(width, 0.5)}%`,
                  backgroundColor: getRiskColor(zone.risk_level),
                  opacity: zone.risk_level === 'high' ? 0.85 :
                           zone.risk_level === 'medium' ? 0.6 : 0.45,
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                card-inner px-3 py-2 text-center pointer-events-none
                                opacity-0 group-hover:opacity-100 transition-opacity z-20
                                whitespace-nowrap border border-ink-700/50">
                  <p className="font-mono text-[10px] text-ink-400">
                    {zone.start_str} – {zone.end_str}
                  </p>
                  <p className="font-mono text-xs font-medium mt-0.5"
                    style={{ color: getRiskColor(zone.risk_level) }}>
                    {zone.avg_engagement.toFixed(0)}% engagement
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px] text-ink-600">0:00</span>
          <span className="font-mono text-[10px] text-ink-600">
            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Zone legend */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {['high', 'medium', 'low'].map((level) => {
          const zones = riskZones.filter(z => z.risk_level === level)
          const totalDuration = zones.reduce((sum, z) => sum + (z.end - z.start), 0)
          return (
            <div key={level}
              className={`card-inner p-3 border ${level === 'high' ? 'risk-high' : level === 'medium' ? 'risk-medium' : 'risk-low'}`}>
              <p className="font-mono text-xs font-medium capitalize mb-1">
                {level === 'high' ? '⚠ High Risk' : level === 'medium' ? '● Medium' : '✓ Engaged'}
              </p>
              <p className="font-display text-lg">
                {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, '0')}
              </p>
              <p className="font-mono text-[10px] opacity-60 mt-0.5">{zones.length} segment{zones.length !== 1 ? 's' : ''}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
