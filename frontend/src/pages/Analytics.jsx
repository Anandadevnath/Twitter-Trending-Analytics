import { useState, useEffect } from 'react'
import React from 'react'
import { getAnalytics, getModelBenchmark, getXaiFeatures } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PALETTE = ['#00df8f', '#f5a623', '#f81ce5', '#ff0055', '#7928ca', '#3291ff', '#888888']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const CATEGORY_COLORS = {
  Politics: '#3291ff',
  Sports: '#00df8f',
  Entertainment: '#f81ce5',
  Technology: '#b779ff',
  Holiday: '#f5a623',
  Social: '#ff0055',
  Other: '#888888',
}

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
  const [benchmark, setBenchmark] = useState(null)
  const [xaiData, setXaiData] = useState(null)
  const [selectedCmModel, setSelectedCmModel] = useState('Random Forest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      getAnalytics().catch(err => { console.error(err); return null }),
      getModelBenchmark().catch(err => { console.error(err); return null }),
      getXaiFeatures().catch(err => { console.error(err); return null })
    ])
      .then(([analyticsRes, benchRes, xaiRes]) => {
        if (analyticsRes?.data) setData(analyticsRes.data)
        if (benchRes?.data) setBenchmark(benchRes.data)
        if (xaiRes?.data) setXaiData(xaiRes.data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">&gt; Aggregating dataset distributions and evaluation metrics...</div>
  if (error) return <div className="page"><div className="error">Error: {error}</div></div>

  const monthData = data?.monthlyDistribution?.map(d => ({ month: MONTHS[d._id - 1], count: d.count })) || []
  const levelData = data?.trendingLevelDistribution?.map(d => ({ name: d._id, value: d.count })) || []
  const catData = data?.categoryDistribution?.map(d => ({ name: d._id, value: d.count })) || []

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics &amp; Model Evaluation</h1>
        <p className="page-subtitle">
          Distribution dynamics, multi-model evaluation benchmarks, and interactive confusion matrix
        </p>
      </div>

      {/* Dataset Summary Cards */}
      {data && (
        <div className="cards-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <h3>Total Trends Analyzed</h3>
            <div className="value">{data.totalTrends?.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Tracked Categories</h3>
            <div className="value">{data.categoryDistribution?.length}</div>
          </div>
          <div className="stat-card">
            <h3>Avg Volume per Trend</h3>
            <div className="value">
              {Math.round((data.trendsByYear?.reduce((s, d) => s + d.totalTweets, 0) || 0) / (data.totalTrends || 1)).toLocaleString()}
            </div>
          </div>
          <div className="stat-card">
            <h3>Viral Ratio (&gt;10M)</h3>
            <div className="value">
              {(((data.trendingLevelDistribution?.find(l => l._id === 'Viral')?.count || 0) / (data.totalTrends || 1)) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Feature 4: Interactive Confusion Matrix & Metrics Table */}
      <div style={{
        background: '#111',
        border: '1px solid #282828',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00df8f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ Feature 4: Model Evaluation Matrix
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ededed', margin: '0.25rem 0 0 0' }}>
              Multi-Class Confusion Matrix ({selectedCmModel})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.2rem 0 0 0' }}>
              Ground truth vs predicted category counts on 2,408 held-out test samples (20% split)
            </p>
          </div>

          {/* Model Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#161616', padding: '0.25rem', borderRadius: '6px', border: '1px solid #222' }}>
            {['Random Forest', 'Gradient Boosting', 'Logistic Regression'].map((mName, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCmModel(mName)}
                style={{
                  background: selectedCmModel === mName ? '#252525' : 'transparent',
                  color: selectedCmModel === mName ? '#00df8f' : '#888',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {mName}
              </button>
            ))}
          </div>
        </div>

        {/* Confusion Matrix Heatmap Grid */}
        {xaiData && xaiData.confusion_matrices && xaiData.classes ? (
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `110px repeat(${xaiData.classes.length}, 1fr)`,
              gap: '4px',
              minWidth: '650px',
              background: '#0d0d0d',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #222'
            }}>
              {/* Header row */}
              <div style={{ fontSize: '0.7rem', color: '#777', fontWeight: 600, padding: '0.4rem' }}>
                Actual \ Pred
              </div>
              {xaiData.classes.map((cls, idx) => (
                <div key={idx} style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: CATEGORY_COLORS[cls] || '#fff',
                  textAlign: 'center',
                  padding: '0.4rem'
                }}>
                  {cls.slice(0, 6)}
                </div>
              ))}

              {/* Rows */}
              {xaiData.classes.map((rowCls, rIdx) => {
                const row = xaiData.confusion_matrices[selectedCmModel]?.[rIdx] || []
                const maxVal = Math.max(...row, 1)
                return (
                  <React.Fragment key={`row-cm-${rIdx}`}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: CATEGORY_COLORS[rowCls] || '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.4rem'
                    }}>
                      {rowCls}
                    </div>
                    {row.map((val, cIdx) => {
                      const isDiag = rIdx === cIdx
                      const intensity = val / maxVal
                      return (
                        <div
                          key={`cell-cm-${rIdx}-${cIdx}`}
                          title={`Actual: ${rowCls}, Predicted: ${xaiData.classes[cIdx]} (${val} samples)`}
                          style={{
                            background: isDiag ? `rgba(0, 223, 143, ${Math.max(intensity, 0.2)})` : (val > 0 ? `rgba(255, 0, 85, ${Math.min(intensity * 0.4, 0.25)})` : '#161616'),
                            color: isDiag ? '#fff' : (val > 0 ? '#ff8099' : '#444'),
                            padding: '0.65rem 0.2rem',
                            textAlign: 'center',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: isDiag ? 700 : 400
                          }}
                        >
                          {val}
                        </div>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.7rem', color: '#888' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', background: '#00df8f', borderRadius: '2px', display: 'inline-block' }} />
                <span>True Positives (Diagonal)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', background: '#ff0055', borderRadius: '2px', display: 'inline-block' }} />
                <span>Misclassifications (Off-diagonal)</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#666', fontSize: '0.85rem', padding: '1rem 0' }}>
            Confusion matrix data loading from ML service...
          </div>
        )}

        {/* Multi-Model Benchmark Comparison Table */}
        {benchmark && benchmark.benchmark && (
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ededed', marginBottom: '0.75rem' }}>
              Algorithm Precision, Recall &amp; F1-Score Breakdown
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Accuracy</th>
                    <th>Precision (Weighted)</th>
                    <th>Recall (Weighted)</th>
                    <th>F1-Score</th>
                    <th>Training / Eval Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmark.benchmark.map((m, idx) => (
                    <tr key={idx} style={{ background: selectedCmModel === m.name ? 'rgba(0, 223, 143, 0.05)' : 'transparent' }}>
                      <td>
                        <strong style={{ color: selectedCmModel === m.name ? '#00df8f' : '#ededed' }}>
                          {m.name}
                        </strong>
                      </td>
                      <td className="font-mono" style={{ color: '#00df8f' }}>{m.accuracy}%</td>
                      <td className="font-mono">{m.precision}%</td>
                      <td className="font-mono">{m.recall}%</td>
                      <td className="font-mono">{m.f1_score}%</td>
                      <td className="font-mono" style={{ color: '#888' }}>{m.latency_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Global Feature Importance Section */}
      {xaiData && xaiData.global_importance && (
        <div style={{
          background: '#111',
          border: '1px solid #282828',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ededed', marginBottom: '0.25rem' }}>
            Global Feature Importance (XAI - Random Forest Gini Impurity)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem' }}>
            Top numerical &amp; sub-word TF-IDF n-grams influencing split decisions
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
            {xaiData.global_importance.slice(0, 10).map((feat, idx) => (
              <div key={idx} style={{
                background: '#161616',
                border: '1px solid #242424',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#ededed', fontFamily: 'monospace' }}>
                  {feat.feature}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#3291ff', fontFamily: 'monospace', fontWeight: 700 }}>
                  {feat.importance}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Visualizations Grid */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ededed' }}>
          Historical Trend Distributions
        </h2>
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
            <BarChart data={data?.trendsByYear?.map(d => ({year: String(d._id), tweets: d.totalTweets})) || []}>
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
