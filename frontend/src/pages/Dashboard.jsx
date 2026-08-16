import { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PALETTE = ['#0070f3', '#00df8f', '#f81ce5', '#f5a623', '#7928ca', '#3291ff', '#888888']

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

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">&gt; Loading dashboard analytics...</div>
  if (error) return <div className="page"><div className="error">Error: {error}</div></div>
  if (!data) return null

  const yearData = data.trendsByYear.map(d => ({ year: String(d._id), count: d.count, tweets: d.totalTweets }))
  const catData = data.categoryDistribution.map(d => ({ name: d._id, value: d.count }))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Real-time engagement telemetry &amp; high-volume trending statistics</p>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Trends Ingested</h3>
          <div className="value">{data.totalTrends.toLocaleString()}</div>
          <div className="subtext">Historical dataset (2020–2025)</div>
        </div>
        <div className="stat-card">
          <h3>Temporal Range</h3>
          <div className="value">{data.totalYears} <span style={{fontSize:'1rem', color:'#888'}}>Years</span></div>
          <div className="subtext">{data.years[0]} – {data.years[data.years.length - 1]}</div>
        </div>
        <div className="stat-card">
          <h3>Peak Single Trend Volume</h3>
          <div className="value">{data.maxTweets.toLocaleString()}</div>
          <div className="subtext">Maximum recorded virality</div>
        </div>
        <div className="stat-card">
          <h3>Top Overall Hashtag</h3>
          <div className="value" style={{fontSize: '1.4rem'}}>{data.mostPopular}</div>
          <div className="subtext">Rank #1 by tweet count</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Trending Topics by Year</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearData}>
              <XAxis dataKey="year" stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <YAxis stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#ededed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Aggregate Tweets Volume (Yearly)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearData}>
              <XAxis dataKey="year" stroke="#444" tick={{fill: '#888', fontSize: 11}} />
              <YAxis stroke="#444" tick={{fill: '#888', fontSize: 11}} tickFormatter={(v) => `${(v/1e9).toFixed(1)}B`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tweets" fill="#0070f3" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Topic Categorization Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={catData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                stroke="#111"
                strokeWidth={2}
              >
                {catData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top 10 Hashtags by Total Tweets</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.top10.map(t => ({tag: t.tag, tweets: t.tweets}))} layout="vertical">
              <XAxis type="number" stroke="#444" tick={{fill: '#888', fontSize: 10}} tickFormatter={(v) => `${(v/1e6).toFixed(0)}M`} />
              <YAxis type="category" dataKey="tag" width={110} stroke="#444" tick={{fill: '#ededed', fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tweets" fill="#00df8f" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
