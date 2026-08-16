import { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1da1f2', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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

  if (loading) return <div className="loading">Loading analytics...</div>
  if (error) return <div className="page"><div className="error">Error: {error}</div></div>
  if (!data) return null

  const monthData = data.monthlyDistribution.map(d => ({ month: MONTHS[d._id - 1], count: d.count }))
  const levelData = data.trendingLevelDistribution.map(d => ({ name: d._id, value: d.count }))
  const catData = data.categoryDistribution.map(d => ({ name: d._id, value: d.count }))

  return (
    <div className="page">
      <h1 className="page-title">Analytics</h1>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Trends</h3>
          <div className="value">{data.totalTrends.toLocaleString()}</div>
        </div>
        <div className="stat-card green">
          <h3>Categories</h3>
          <div className="value">{data.categoryDistribution.length}</div>
        </div>
        <div className="stat-card orange">
          <h3>Year Range</h3>
          <div className="value">{data.years[0]} - {data.years[data.years.length - 1]}</div>
        </div>
        <div className="stat-card purple">
          <h3>Avg Tweets/Trend</h3>
          <div className="value">
            {Math.round(data.trendsByYear.reduce((s, d) => s + d.totalTweets, 0) / data.totalTrends).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trending Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#e67e22" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Trending Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={levelData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                   outerRadius={100} label={({name, value}) => `${name}: ${value}`}>
                {levelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={catData}>
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#9b59b6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Tweets by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.trendsByYear.map(d => ({year: d._id, tweets: d.totalTweets}))}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Bar dataKey="tweets" fill="#1abc9c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
