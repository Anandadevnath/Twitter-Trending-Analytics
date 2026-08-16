import { useState } from 'react'
import { predictCategory } from '../api'

const SAMPLES = [
  { label: '#Trump', tag: 'Trump', year: 2025, tweets: 35000000, rank: 2, icon: '🏛️' },
  { label: '#Messi', tag: 'Messi', year: 2026, tweets: 8500000, rank: 8, icon: '⚽' },
  { label: '#ChatGPT', tag: 'ChatGPT', year: 2026, tweets: 4200000, rank: 12, icon: '💻' },
  { label: '#TaylorSwift', tag: 'Taylor Swift', year: 2025, tweets: 28000000, rank: 3, icon: '🎬' },
  { label: '#Christmas', tag: 'Christmas', year: 2025, tweets: 950000, rank: 25, icon: '🎄' },
  { label: '#ClimateAction', tag: 'Climate', year: 2026, tweets: 45000, rank: 180, icon: '🌍' },
]

const CATEGORY_META = {
  Politics: { icon: '🏛️', color: '#3291ff', desc: 'Government, policy, elections, and global political discourse' },
  Sports: { icon: '⚽', color: '#00df8f', desc: 'Athletics, league tournaments, matches, and player transfers' },
  Entertainment: { icon: '🎬', color: '#f81ce5', desc: 'Music releases, cinema, celebrity news, and streaming shows' },
  Technology: { icon: '💻', color: '#b779ff', desc: 'Software, artificial intelligence, hardware, and digital innovation' },
  Holiday: { icon: '🎄', color: '#f5a623', desc: 'Seasonal celebrations, festivals, and cultural holiday events' },
  Social: { icon: '🌍', color: '#ff0055', desc: 'Public interest, awareness campaigns, health, and social causes' },
  Other: { icon: '🏷️', color: '#888888', desc: 'General lifestyle, trending memes, and organic community topics' },
}

const LEVEL_META = {
  Viral: {
    badge: '🔥 VIRAL PHENOMENON',
    color: '#ff0055',
    progress: 100,
    impact: 'Global Mega-Trend',
    reach: '10M+ Tweets',
    insight: 'Top 1% viral velocity. Dominates national and international feeds with massive cross-platform engagement.'
  },
  High: {
    badge: '🚀 HIGH MOMENTUM',
    color: '#f81ce5',
    progress: 75,
    impact: 'Major Headline Trend',
    reach: '1M – 10M Tweets',
    insight: 'Significant worldwide traction. Drives mainstream media coverage and high comment velocity.'
  },
  Medium: {
    badge: '📈 GROWING TRACTION',
    color: '#f5a623',
    progress: 45,
    impact: 'Regional / Category Trend',
    reach: '100K – 1M Tweets',
    insight: 'Strong topical interest among core audiences and active community discussions.'
  },
  Low: {
    badge: '🌿 NICHE / EMERGING',
    color: '#00df8f',
    progress: 20,
    impact: 'Localized Conversation',
    reach: '< 100K Tweets',
    insight: 'Targeted niche discussion. Ideal for specialized interest groups and early trend discovery.'
  },
}

function Prediction() {
  const [form, setForm] = useState({ tag: '', year: 2026, tweets: '', rank: '' })
  const [result, setResult] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSampleClick = (s) => {
    setForm({ tag: s.tag, year: s.year, tweets: s.tweets, rank: s.rank })
    executePredict(s.tag, s.year, s.tweets, s.rank)
  }

  const executePredict = (tag, year, tweets, rank) => {
    setLoading(true)
    setError(null)
    setResult(null)

    predictCategory({
      tag,
      year: Number(year),
      tweets: Number(tweets),
      rank: Number(rank)
    })
      .then(res => {
        setResult(res.data)
        setSubmittedData({ tag, year, tweets: Number(tweets), rank: Number(rank) })
      })
      .catch(err => setError(err.response?.data?.detail || err.message || 'Prediction service offline.'))
      .finally(() => setLoading(false))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.tag || !form.tweets || !form.rank) {
      setError('Please fill out all fields before predicting.')
      return
    }
    executePredict(form.tag, form.year, form.tweets, form.rank)
  }

  const catMeta = result ? (CATEGORY_META[result.category] || CATEGORY_META.Other) : null
  const lvlMeta = result ? (LEVEL_META[result.trending_level] || LEVEL_META.Medium) : null

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Trend Forecaster &amp; Classifier</h1>
        <p className="page-subtitle">Predict topic category and forecast global virality impact for any hashtag</p>
      </div>

      {/* Preset Quick-Test Bar */}
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚡ Quick Try:
        </span>
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSampleClick(s)}
            style={{
              background: '#181818',
              border: '1px solid #2a2a2a',
              color: '#ededed',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#444'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>

        {/* Input Form */}
        <div className="predict-form" style={{ maxWidth: '100%' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ededed', marginBottom: '1.25rem' }}>
            Hashtag Parameters
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hashtag or Keyword</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. WorldCup, Bitcoin, Oscar, Marvel"
                value={form.tag}
                onChange={e => setForm({ ...form, tag: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Year</label>
                <input
                  className="input-field"
                  type="number"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Expected Rank (1–3000)</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="e.g. 5"
                  value={form.rank}
                  onChange={e => setForm({ ...form, rank: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Estimated Tweet Volume</label>
              <input
                className="input-field"
                type="number"
                placeholder="e.g. 5000000"
                value={form.tweets}
                onChange={e => setForm({ ...form, tweets: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Analyzing Trend Patterns...' : '✨ Forecast Trend Impact'}
            </button>
          </form>

          {error && <div className="error" style={{ marginTop: '1.25rem' }}>{error}</div>}
        </div>

        {/* Prediction Results & User-Friendly Story */}
        <div>
          {result && catMeta && lvlMeta ? (
            <div style={{
              background: '#111',
              border: '1px solid #282828',
              borderRadius: '8px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              animation: 'fadeIn 0.3s ease'
            }}>

              {/* Header result */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #222', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Forecast Report
                  </span>
                  <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 700, margin: '0.25rem 0' }}>
                    #{submittedData.tag}
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>
                    {submittedData.tweets?.toLocaleString()} tweets &bull; Rank #{submittedData.rank} &bull; {submittedData.year}
                  </span>
                </div>
                <div style={{
                  background: `${lvlMeta.color}15`,
                  color: lvlMeta.color,
                  border: `1px solid ${lvlMeta.color}40`,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}>
                  {lvlMeta.badge}
                </div>
              </div>

              {/* Topic Category Card */}
              <div style={{
                background: '#161616',
                border: '1px solid #262626',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  background: '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {catMeta.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Topic</span>
                    <strong style={{ color: catMeta.color, fontSize: '0.95rem' }}>{result.category}</strong>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#aaa', margin: 0 }}>
                    {catMeta.desc}
                  </p>
                </div>
              </div>

              {/* Virality Meter */}
              <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ededed' }}>Virality Velocity</span>
                  <span style={{ fontSize: '0.8rem', color: lvlMeta.color, fontWeight: 700 }}>{lvlMeta.impact}</span>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#252525', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: `${lvlMeta.progress}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, #0070f3, ${lvlMeta.color})`,
                    borderRadius: '4px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
                  <span>Niche (&lt;100K)</span>
                  <span>Moderate (100K-1M)</span>
                  <span>High (1M-10M)</span>
                  <span>Viral (10M+)</span>
                </div>
              </div>

              {/* Engagement Insight */}
              <div style={{
                background: '#141414',
                borderLeft: `3px solid ${lvlMeta.color}`,
                padding: '1rem 1.25rem',
                borderRadius: '0 8px 8px 0'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  💡 Projected Audience Dynamics
                </div>
                <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: 1.5, margin: 0 }}>
                  {lvlMeta.insight}
                </p>
              </div>

            </div>
          ) : (
            <div style={{
              background: '#111',
              border: '1px dashed #282828',
              borderRadius: '8px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              color: '#666',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔮</div>
              <h3 style={{ fontSize: '1.1rem', color: '#ededed', marginBottom: '0.5rem', fontWeight: 600 }}>
                Ready to Forecast
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#888', maxWidth: '320px', lineHeight: 1.5 }}>
                Enter any hashtag name or click one of the quick test presets above to generate a full virality report.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Prediction
