import { useState } from 'react'
import { formatINR } from '../../utils/formatINR'

/**
 * 1. Area Trend Chart (SVG spline area with gradient fill, gridlines, and interactive tooltip)
 */
export function AreaTrendChart({ title, subtitle, data, height = 240 }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const [activeRange, setActiveRange] = useState('30d')

  // Sample data fallback if none provided
  const points = data || [
    { label: 'Oct 1', value: 14200 },
    { label: 'Oct 5', value: 18900 },
    { label: 'Oct 9', value: 16500 },
    { label: 'Oct 13', value: 24800 },
    { label: 'Oct 17', value: 22100 },
    { label: 'Oct 21', value: 31400 },
    { label: 'Oct 23', value: 38900 }
  ]

  const maxVal = Math.max(...points.map(p => p.value), 1)
  const minVal = 0
  const chartWidth = 560
  const chartHeight = height - 60
  const paddingX = 35
  const paddingY = 20

  const getX = (index) => paddingX + (index / (points.length - 1)) * (chartWidth - paddingX * 2)
  const getY = (val) => chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2)

  // Construct SVG Path (Smooth curve)
  const pathD = points.reduce((acc, pt, i) => {
    const x = getX(i)
    const y = getY(pt.value)
    if (i === 0) return `M ${x} ${y}`
    const prevX = getX(i - 1)
    const prevY = getY(points[i - 1].value)
    const cpX1 = prevX + (x - prevX) / 2
    const cpX2 = prevX + (x - prevX) / 2
    return `${acc} C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`
  }, '')

  const areaD = `${pathD} L ${getX(points.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title || 'Revenue Trend'}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>

        <div className="chart-time-tabs">
          <button 
            type="button" 
            className={`chart-time-tab ${activeRange === '7d' ? 'active' : ''}`}
            onClick={() => setActiveRange('7d')}
          >
            7D
          </button>
          <button 
            type="button" 
            className={`chart-time-tab ${activeRange === '30d' ? 'active' : ''}`}
            onClick={() => setActiveRange('30d')}
          >
            30D
          </button>
          <button 
            type="button" 
            className={`chart-time-tab ${activeRange === '1y' ? 'active' : ''}`}
            onClick={() => setActiveRange('1y')}
          >
            1Y
          </button>
        </div>
      </div>

      <div className="chart-svg-container" style={{ position: 'relative' }}>
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="chart-svg" 
          preserveAspectRatio="none"
          style={{ width: '100%', height: `${chartHeight}px`, overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#a855f7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2)
            return (
              <g key={idx}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={chartWidth - paddingX} 
                  y2={y} 
                  stroke="#f1f5f9" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingX - 6} 
                  y={y + 4} 
                  fontSize="10" 
                  fill="#94a3b8" 
                  textAnchor="end"
                  fontWeight="600"
                >
                  ₹{Math.round((maxVal * pct) / 1000)}k
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Spline line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            filter="url(#glow)"
          />

          {/* Interactive Data Nodes */}
          {points.map((pt, i) => {
            const cx = getX(i)
            const cy = getY(pt.value)
            const isHovered = hoverIndex === i

            return (
              <g key={i}>
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isHovered ? 6 : 4} 
                  fill="#ffffff" 
                  stroke="#4f46e5" 
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            )
          })}
        </svg>

        {/* X-axis labels */}
        <div className="chart-x-labels" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 20px 0 35px' }}>
          {points.map((pt, idx) => (
            <span key={idx} style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {pt.label}
            </span>
          ))}
        </div>

        {/* Interactive Tooltip Overlay */}
        {hoverIndex !== null && (
          <div 
            className="chart-tooltip"
            style={{
              position: 'absolute',
              left: `${(getX(hoverIndex) / chartWidth) * 100}%`,
              top: `${(getY(points[hoverIndex].value) / chartHeight) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none'
            }}
          >
            <span className="tooltip-label">{points[hoverIndex].label}</span>
            <span className="tooltip-val">{formatINR(points[hoverIndex].value)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 2. Donut Breakdown Chart (multi-segment circular SVG with center metric & legend)
 */
export function DonutBreakdownChart({ title, subtitle, segments, totalLabel = 'Total Volume' }) {
  const items = segments || [
    { label: 'Electronics', value: 45, amount: 48900, color: '#6366f1' },
    { label: 'Fashion', value: 25, amount: 26500, color: '#ec4899' },
    { label: 'Accessories', value: 15, amount: 16200, color: '#f59e0b' },
    { label: 'Grocery', value: 15, amount: 9800, color: '#10b981' }
  ]

  const total = items.reduce((sum, item) => sum + item.value, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)

  const radius = 64
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius
  let accumulatedAngle = 0

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title || 'Category Revenue Share'}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="donut-layout">
        <div className="donut-svg-wrap">
          <svg width="170" height="170" viewBox="0 0 170 170" className="donut-svg">
            <circle 
              cx="85" 
              cy="85" 
              r={radius} 
              fill="none" 
              stroke="#f1f5f9" 
              strokeWidth={strokeWidth} 
            />
            {items.map((item, idx) => {
              const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`
              const strokeDashoffset = -accumulatedAngle
              accumulatedAngle += (item.value / total) * circumference

              return (
                <circle
                  key={idx}
                  cx="85"
                  cy="85"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '85px 85px',
                    transition: 'stroke-dasharray 0.5s ease'
                  }}
                />
              )
            })}
          </svg>

          {/* Center Info inside Donut */}
          <div className="donut-center-info">
            <span className="donut-center-num">{formatINR(totalAmount)}</span>
            <span className="donut-center-sub">{totalLabel}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {items.map((item, idx) => (
            <div key={idx} className="legend-item">
              <span className="legend-dot" style={{ background: item.color }}></span>
              <div className="legend-meta">
                <span className="legend-name">{item.label}</span>
                <span className="legend-pct">{item.value}%</span>
              </div>
              <span className="legend-val">{formatINR(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 3. Horizontal Progress Bar Chart (Top rankings, vendor comparison)
 */
export function HorizontalBarChart({ title, subtitle, items }) {
  const list = items || [
    { name: 'Wireless Headphones', category: 'Electronics', count: 18, revenue: 161982, progress: 95, color: '#4f46e5' },
    { name: 'Horizon Smartwatch', category: 'Electronics', count: 12, revenue: 179988, progress: 75, color: '#7c3aed' },
    { name: 'Urban Flex Runners', category: 'Fashion', count: 9, revenue: 49491, progress: 55, color: '#ec4899' },
    { name: 'Cookware Set (5-Pc)', category: 'Home', count: 7, revenue: 24493, progress: 40, color: '#06b6d4' }
  ]

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title || 'Top Performing Products'}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="bar-chart-list">
        {list.map((item, idx) => (
          <div key={idx} className="bar-chart-row">
            <div className="bar-row-header">
              <div className="bar-row-title-wrap">
                <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                <div>
                  <strong className="bar-item-name">{item.name}</strong>
                  <span className="bar-item-cat">{item.category}</span>
                </div>
              </div>
              <div className="bar-row-stats">
                <span className="bar-stat-units">{item.count} sold</span>
                <strong className="bar-stat-rev">{formatINR(item.revenue)}</strong>
              </div>
            </div>

            <div className="bar-progress-track">
              <div 
                className="bar-progress-fill" 
                style={{ 
                  width: `${item.progress}%`,
                  background: `linear-gradient(90deg, ${item.color || '#4f46e5'} 0%, #a855f7 100%)`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 4. Fulfillment & SLA Reliability Gauge
 */
export function FulfillmentGauge({ rate = 99.4, avgHours = 18, title = 'Fulfillment Reliability' }) {
  const radius = 55
  const circumference = Math.PI * radius // semicircle
  const strokeDashoffset = circumference - (rate / 100) * circumference

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">{title}</h3>
      </div>

      <div className="gauge-wrap">
        <svg width="150" height="90" viewBox="0 0 150 90" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Semicircle background */}
          <path
            d="M 15 80 A 60 60 0 0 1 135 80"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Gauge meter arc */}
          <path
            d="M 15 80 A 60 60 0 0 1 135 80"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        <div className="gauge-value-box">
          <span className="gauge-pct">{rate}%</span>
          <span className="gauge-label">Order Success Rate</span>
        </div>

        <div className="gauge-stats-row">
          <div className="gauge-stat">
            <span className="stat-bullet green">●</span>
            <span>Avg Dispatch: <strong>{avgHours} hrs</strong></span>
          </div>
          <div className="gauge-stat">
            <span className="stat-bullet blue">●</span>
            <span>Cancellation: <strong>0.6%</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 5. Metric Spark Card with trend sparkline and icon
 */
export function MetricSparkCard({ title, value, delta, subtext, icon, trend = 'up', color = '#4f46e5' }) {
  return (
    <div className="metric-spark-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="spark-card-top">
        <div className="spark-card-text">
          <span className="spark-card-title">{title}</span>
          <h3 className="spark-card-value">{value}</h3>
        </div>
        <div className="spark-card-icon" style={{ background: `${color}15`, color: color }}>
          {icon}
        </div>
      </div>

      <div className="spark-card-bottom">
        <span className={`spark-delta-pill ${trend === 'up' ? 'delta-up' : 'delta-down'}`}>
          {trend === 'up' ? '↑' : '↓'} {delta}
        </span>
        <span className="spark-subtext">{subtext}</span>
      </div>
    </div>
  )
}
