import { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1da1f2', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22']

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

  if (loading) return <div className="loading">Loading dashboard...</div>
  if (error) return <div className="page"><div className="error">Error: {error}</div></div>
  if (!data) return null

  const yearData = data.trendsByYear.map(d => ({ year: d._id, count: d.count, tweets: d.totalTweets }))
  const catData = data.categoryDistribution.map(d => ({ name: d._id, value: d.count }))

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Trends</h3>
          <div className="value">{data.totalTrends.toLocaleString()}</div>
        </div>
        <div className="stat-card green">
          <h3>Total Years</h3>
          <div className="value">{data.totalYears}</div>
        </div>
        <div className="stat-card orange">
          <h3>Maximum Tweets</h3>
          <div className="value">{data.maxTweets.toLocaleString()}</div>
        </div>
        <div className="stat-card red">
          <h3>Most Popular</h3>
          <div className="value">{data.mostPopular}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Trends by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1da1f2" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Total Tweets by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Bar dataKey="tweets" fill="#e74c3c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                   outerRadius={100} label={({name, value}) => `${name}: ${value}`}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top 10 Hashtags</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top10.map(t => ({tag: t.tag, tweets: t.tweets}))} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="tag" width={120} tick={{fontSize: 12}} />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Bar dataKey="tweets" fill="#2ecc71" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
