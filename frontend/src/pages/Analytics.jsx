import { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PALETTE = ['#00df8f', '#f5a623', '#f81ce5', '#ff0055', '#7928ca', '#3291ff', '#888888']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111',
        border: '1px solid #333',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: '#ededed',
        fontFamily: 'monospace'
      }}>
        <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{label || payload[0].name}</p>
        <p style={{ color: payload[0].color || '#0070f3' }}>
          {payload[0].value?.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">&gt; Aggregating dataset distributions...</div>
  if (error) return <div className="page"><div className="error">Error: {error}</div></div>
  if (!data) return null

  const monthData = data.monthlyDistribution.map(d => ({ month: MONTHS[d._id - 1], count: d.count }))
  const levelData = data.trendingLevelDistribution.map(d => ({ name: d._id, value: d.count }))
  const catData = data.categoryDistribution.map(d => ({ name: d._id, value: d.count }))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Seasonality, virality levels, and domain distribution metrics</p>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Trends Analyzed</h3>
          <div className="value">{data.totalTrends.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Tracked Categories</h3>
          <div className="value">{data.categoryDistribution.length}</div>
        </div>
        <div className="stat-card">
          <h3>Avg Volume per Trend</h3>
          <div className="value">
            {Math.round(data.trendsByYear.reduce((s, d) => s + d.totalTweets, 0) / data.totalTrends).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <h3>Viral Ratio (&gt;10M)</h3>
          <div className="value">
            {((data.trendingLevelDistribution.find(l => l._id === 'Viral')?.count || 0) / data.totalTrends * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trend Seasonality</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthData}>
              <XAxis dataKey="month" stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <YAxis stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#f5a623" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Trending Level Proportions</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={levelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                stroke="#111"
                strokeWidth={2}
              >
                {levelData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Category Density</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={catData}>
              <XAxis dataKey="name" stroke="#444" tick={{fill: '#888', fontSize: 10}} />
              <YAxis stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#7928ca" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Cumulative Tweets per Year</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.trendsByYear.map(d => ({year: String(d._id), tweets: d.totalTweets}))}>
              <XAxis dataKey="year" stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <YAxis stroke="#444" tick={{fill: '#888', fontSize: 11}} tickFormatter={(v) => `${(v/1e9).toFixed(1)}B`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tweets" fill="#3291ff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
