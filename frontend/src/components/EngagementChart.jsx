import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatTimestamp, getRiskColor } from '../utils/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="card-inner px-4 py-3 border border-ink-700/50">
      <p className="font-mono text-xs text-ink-500 mb-1">{formatTimestamp(label)}</p>
      <p className="font-mono text-base font-medium" style={{ color: getRiskColor(d?.risk_level) }}>
        {d?.engagement?.toFixed(1)}%
      </p>
      <p className="font-mono text-[10px] mt-0.5"
        style={{ color: getRiskColor(d?.risk_level) }}>
        {d?.risk_level === 'high' ? '⚠ High risk' : d?.risk_level === 'medium' ? '● Medium' : '✓ Engaged'}
      </p>
    </div>
  )
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  if (payload?.risk_level !== 'high') return null
  return <circle cx={cx} cy={cy} r={3} fill="#e63946" fillOpacity={0.7} />
}

export default function EngagementChart({ data, dropOffPoints }) {
  // Downsample for performance if too many points
  const displayData = data.length > 300
    ? data.filter((_, i) => i % Math.ceil(data.length / 300) === 0)
    : data

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label-tag mb-1">Engagement Timeline</p>
          <h3 className="font-display text-ink-100 text-xl">Frame-level Analysis</h3>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'High risk', color: '#e63946' },
            { label: 'Medium', color: '#f4a261' },
            { label: 'Engaged', color: '#2a9d8f' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] text-ink-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={displayData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#957e65" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#957e65" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            interval={Math.max(1, Math.floor(data.length / 8))}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10 }}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Drop-off reference lines */}
          {dropOffPoints?.slice(0, 5).map((dp, i) => (
            <ReferenceLine
              key={i}
              x={dp.timestamp}
              stroke="#e63946"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
              strokeWidth={1}
            />
          ))}

          {/* Threshold lines */}
          <ReferenceLine y={60} stroke="#2a9d8f" strokeDasharray="6 4" strokeOpacity={0.3} strokeWidth={1} />
          <ReferenceLine y={35} stroke="#f4a261" strokeDasharray="6 4" strokeOpacity={0.3} strokeWidth={1} />

          <Area
            type="monotone"
            dataKey="engagement"
            stroke="#957e65"
            strokeWidth={1.5}
            fill="url(#engagementGrad)"
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: '#eeeae3', stroke: '#957e65' }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-ink-900/60">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-px border-t border-dashed border-signal-green/50" />
          <span className="font-mono text-[10px] text-ink-600">60% — good threshold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-px border-t border-dashed border-signal-amber/50" />
          <span className="font-mono text-[10px] text-ink-600">35% — risk threshold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-3 border-l border-dashed border-signal-red/50" />
          <span className="font-mono text-[10px] text-ink-600">drop-off event</span>
        </div>
      </div>
    </div>
  )
}
