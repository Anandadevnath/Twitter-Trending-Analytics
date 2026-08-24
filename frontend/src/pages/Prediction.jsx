import React, { useState, useEffect } from 'react'
import { predictCategory, getModelBenchmark, getXaiFeatures } from '../api'

const PRESET_SHOWCASE = [
  {
    categoryTitle: 'Sports & Live Events',
    icon: '🏆',
    color: '#00df8f',
    tag: 'WorldCup',
    year: 2026,
    tweets: 45000000,
    rank: 1,
    desc: 'Mega-viral sports tournament with massive multi-million volume.'
  },
  {
    categoryTitle: 'Breaking Politics',
    icon: '🏛️',
    color: '#3291ff',
    tag: 'Election2026',
    year: 2026,
    tweets: 18500000,
    rank: 3,
    desc: 'High-urgency political discourse and voter sentiment signals.'
  },
  {
    categoryTitle: 'Niche Technology',
    icon: '💻',
    color: '#b779ff',
    tag: 'RustLang',
    year: 2026,
    tweets: 145000,
    rank: 78,
    desc: 'Targeted developer ecosystem conversation with sustained half-life.'
  },
  {
    categoryTitle: 'Seasonal Holiday',
    icon: '🎄',
    color: '#f5a623',
    tag: 'Christmas',
    year: 2025,
    tweets: 950000,
    rank: 25,
    desc: 'Annual cyclic celebratory momentum with strong positive sentiment.'
  }
]

const QUICK_SAMPLES = [
  { label: '#ChatGPT', tag: 'ChatGPT', year: 2026, tweets: 4200000, rank: 12, icon: '🤖' },
  { label: '#Bitcoin', tag: 'Bitcoin', year: 2026, tweets: 12500000, rank: 5, icon: '💰' },
  { label: '#TaylorSwift', tag: 'TaylorSwift', year: 2025, tweets: 28000000, rank: 2, icon: '🎬' },
  { label: '#ClimateAction', tag: 'ClimateAction', year: 2026, tweets: 85000, rank: 120, icon: '🌍' },
  { label: '#Messi', tag: 'Messi', year: 2026, tweets: 8500000, rank: 8, icon: '⚽' },
  { label: '#CyberSecurity', tag: 'CyberSecurity', year: 2026, tweets: 180000, rank: 65, icon: '🛡️' }
]

const CATEGORY_COLORS = {
  Politics: '#3291ff',
  Sports: '#00df8f',
  Entertainment: '#f81ce5',
  Technology: '#b779ff',
  Holiday: '#f5a623',
  Social: '#ff0055',
  Other: '#888888',
}

const LEVEL_META = {
  Viral: {
    badge: '🔥 VIRAL PHENOMENON',
    color: '#ff0055',
    progress: 100,
    impact: 'Global Mega-Trend',
    insight: 'Top 1% viral velocity. Dominates global feeds with multi-million reach.'
  },
  High: {
    badge: '🚀 HIGH MOMENTUM',
    color: '#f81ce5',
    progress: 75,
    impact: 'Major Headline Trend',
    insight: 'High engagement across international channels with strong media resonance.'
  },
  Medium: {
    badge: '📈 GROWING TRACTION',
    color: '#f5a623',
    progress: 45,
    impact: 'Regional / Domain Trend',
    insight: 'Consistent topic momentum with dedicated community discussions.'
  },
  Low: {
    badge: '🌿 NICHE / EMERGING',
    color: '#00df8f',
    progress: 20,
    impact: 'Localized Conversation',
    insight: 'Targeted niche discussion. Ideal for early signals and specialized interests.'
  },
}

// Interactive Real-Time What-If Simulator Math
function computeWhatIf(tweets, rank) {
  const t = Number(tweets) || 0
  const r = Number(rank) || 1
  let level = 'Low'
  if (t >= 10000000) level = 'Viral'
  else if (t >= 1000000) level = 'High'
  else if (t >= 100000) level = 'Medium'

  const baseHours = Math.log1p(t) * 3.5 + (200 - Math.min(r, 200)) * 0.15
  const lifespanHours = Math.max(2.0, Math.round(baseHours * 10) / 10)
  const halfLife = Math.round(lifespanHours * 0.46 * 10) / 10

  const decayCurve = [0, 6, 12, 24, 48, 72, 96, 120].map(h => ({
    hour: h,
    retention: Math.max(0, Math.round(100.0 * Math.exp(-1.5 * h / lifespanHours) * 10) / 10)
  }))

  return { level, lifespanHours, halfLife, decayCurve }
}

function Prediction() {
  const [form, setForm] = useState({ tag: 'WorldCup', year: 2026, tweets: 45000000, rank: 1 })
  const [selectedModel, setSelectedModel] = useState('Random Forest')
  const [result, setResult] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)
  const [benchmark, setBenchmark] = useState(null)
  const [xaiData, setXaiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [whatIfActive, setWhatIfActive] = useState(true)

  useEffect(() => {
    getModelBenchmark()
      .then(res => setBenchmark(res.data))
      .catch(() => {})

    getXaiFeatures()
      .then(res => setXaiData(res.data))
      .catch(() => {})

    // Run default showcase prediction on mount
    executePredict('WorldCup', 2026, 45000000, 1, 'Random Forest')
  }, [])

  const executePredict = (tag, year, tweets, rank, modelName = selectedModel) => {
    setLoading(true)
    setError(null)

    predictCategory({
      tag,
      year: Number(year),
      tweets: Number(tweets),
      rank: Number(rank),
      model_name: modelName
    })
      .then(res => {
        setResult(res.data)
        setSubmittedData({ tag, year, tweets: Number(tweets), rank: Number(rank) })
      })
      .catch(err => setError(err.response?.data?.detail || err.message || 'Prediction service offline.'))
      .finally(() => setLoading(false))
  }

  const handlePresetSelect = (preset) => {
    setForm({ tag: preset.tag, year: preset.year, tweets: preset.tweets, rank: preset.rank })
    executePredict(preset.tag, preset.year, preset.tweets, preset.rank, selectedModel)
  }

  const handleModelSwitch = (modelName) => {
    setSelectedModel(modelName)
    if (submittedData) {
      executePredict(submittedData.tag, submittedData.year, submittedData.tweets, submittedData.rank, modelName)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.tag || !form.tweets || !form.rank) {
      setError('Please provide all parameters.')
      return
    }
    executePredict(form.tag, form.year, form.tweets, form.rank, selectedModel)
  }

  // Dynamic what-if recalculation
  const currentTweets = Number(form.tweets) || 0
  const currentRank = Number(form.rank) || 1
  const sim = computeWhatIf(currentTweets, currentRank)
  const simMeta = LEVEL_META[sim.level]

  const activeLevelMeta = result ? (LEVEL_META[result.trending_level] || LEVEL_META.Medium) : simMeta

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">AI Trend Forecaster &amp; Classifier</h1>
        <p className="page-subtitle">
          Multi-Model inference, XAI feature attribution, interactive what-if simulation, and lifespan regression
        </p>
      </div>

      {/* Feature 5: Preset Test-Case Showcase */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00df8f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ Feature 5: Evaluation Showcase Presets
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ededed', margin: '0.2rem 0 0 0' }}>
              Select a Verified Test Scenario
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>Click card to test live</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {PRESET_SHOWCASE.map((p, idx) => {
            const isSelected = form.tag.toLowerCase() === p.tag.toLowerCase()
            return (
              <div
                key={idx}
                onClick={() => handlePresetSelect(p)}
                style={{
                  background: isSelected ? 'rgba(0, 223, 143, 0.08)' : '#111',
                  border: `1px solid ${isSelected ? p.color : '#222'}`,
                  borderRadius: '8px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{p.icon}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: p.color,
                    background: `${p.color}15`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    border: `1px solid ${p.color}30`
                  }}>
                    {p.categoryTitle}
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  #{p.tag}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.6rem' }}>
                  {p.tweets.toLocaleString()} tweets &bull; Rank #{p.rank}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: 1.4, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Quick Sample Chips */}
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem'
        }}>
          <span style={{ color: '#666', fontWeight: 600 }}>Quick tags:</span>
          {QUICK_SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setForm({ tag: s.tag, year: s.year, tweets: s.tweets, rank: s.rank })
                executePredict(s.tag, s.year, s.tweets, s.rank, selectedModel)
              }}
              style={{
                background: '#161616',
                border: '1px solid #282828',
                color: '#ccc',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form + Simulator / Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Left Column: Form & Real-Time "What-If" Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="predict-form" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ededed', margin: 0 }}>
                Hashtag Parameters
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#00df8f', fontFamily: 'monospace' }}>
                Active: {selectedModel}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Hashtag Token</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. WorldCup, Bitcoin, TaylorSwift"
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
                    onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Rank: #{form.rank}</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    max="200"
                    value={form.rank}
                    onChange={e => setForm({ ...form, rank: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Feature 3: Real-Time "What-If" Simulation Sliders */}
              <div style={{
                background: '#161616',
                border: '1px solid #282828',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f5a623', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🎛️ Feature 3: Real-Time "What-If" Sliders
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>Live dynamic re-calc</span>
                </div>

                {/* Tweet Volume Slider */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#aaa' }}>Tweet Volume</span>
                    <span style={{ color: '#00df8f', fontFamily: 'monospace', fontWeight: 600 }}>
                      {Number(form.tweets).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000000"
                    step="50000"
                    value={form.tweets}
                    onChange={e => setForm({ ...form, tweets: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#00df8f', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#555' }}>
                    <span>1K (Niche)</span>
                    <span>1M (High)</span>
                    <span>50M (Viral)</span>
                  </div>
                </div>

                {/* Rank Slider */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#aaa' }}>Peak Rank Position</span>
                    <span style={{ color: '#3291ff', fontFamily: 'monospace', fontWeight: 600 }}>
                      #{form.rank}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    step="1"
                    value={form.rank}
                    onChange={e => setForm({ ...form, rank: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#3291ff', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#555' }}>
                    <span>#1 (Top Trend)</span>
                    <span>#100</span>
                    <span>#200 (Long-tail)</span>
                  </div>
                </div>

                {/* Live What-If Computed Output Preview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #222'
                }}>
                  <div style={{ background: '#1c1c1c', padding: '0.5rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#777' }}>SIMULATED LEVEL</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: simMeta.color, marginTop: '0.15rem' }}>
                      {sim.level}
                    </div>
                  </div>
                  <div style={{ background: '#1c1c1c', padding: '0.5rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#777' }}>SIMULATED LIFESPAN</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f5a623', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                      ~{sim.lifespanHours} hrs
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {loading ? 'Analyzing Neural Patterns...' : '✨ Run Full Model Inference'}
              </button>
            </form>

            {error && <div className="error" style={{ marginTop: '1.25rem' }}>{error}</div>}
          </div>

          {/* Model Architecture Info Card */}
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ededed', marginBottom: '0.75rem' }}>
              ⚙️ Pipeline Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.75rem', color: '#888' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Text Vectorizer:</span>
                <span style={{ color: '#ededed', fontFamily: 'monospace' }}>TF-IDF (1-3 n-grams, 2.5k max)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Feature Scaling:</span>
                <span style={{ color: '#ededed', fontFamily: 'monospace' }}>Log1p + StandardScaler</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Classifier:</span>
                <span style={{ color: '#00df8f', fontWeight: 600 }}>{selectedModel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Lifespan Engine:</span>
                <span style={{ color: '#f5a623', fontFamily: 'monospace' }}>RandomForestRegressor (100 trees)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results */}
        <div>
          {result && activeLevelMeta ? (
            <div style={{
              background: '#111',
              border: '1px solid #282828',
              borderRadius: '8px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>

              {/* Title & Virality Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700, margin: 0 }}>
                    #{submittedData.tag}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {submittedData.tweets?.toLocaleString()} tweets &bull; Rank #{submittedData.rank} &bull; {submittedData.year}
                  </span>
                </div>
                <div style={{
                  background: `${activeLevelMeta.color}15`,
                  color: activeLevelMeta.color,
                  border: `1px solid ${activeLevelMeta.color}40`,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {activeLevelMeta.badge}
                </div>
              </div>

              {/* 1. Category Confidence Breakdown (Probabilities) */}
              <div style={{ background: '#161616', border: '1px solid #242424', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ededed' }}>
                    Predicted Category: <strong style={{ color: CATEGORY_COLORS[result.category] || '#fff' }}>{result.category}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#00df8f', fontFamily: 'monospace', fontWeight: 700 }}>
                    {result.confidence}% Confidence
                  </span>
                </div>

                {/* Probability Distribution bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.probabilities?.slice(0, 4).map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                      <span style={{ width: '90px', color: '#888' }}>{p.category}</span>
                      <div style={{ flex: 1, height: '6px', background: '#252525', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${p.confidence}%`,
                          height: '100%',
                          background: CATEGORY_COLORS[p.category] || '#0070f3',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ width: '40px', textAlign: 'right', color: '#ccc', fontFamily: 'monospace' }}>
                        {p.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature 1: Multi-Model Side-by-Side Comparison Strip */}
              {result.comparisons && (
                <div style={{ background: '#161616', border: '1px solid #242424', borderRadius: '8px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3291ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ⚡ Feature 1: Multi-Model Inference Comparison
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>Cross-model validation</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(result.comparisons).map(([name, cmp], idx) => (
                      <div
                        key={idx}
                        onClick={() => handleModelSwitch(name)}
                        style={{
                          background: selectedModel === name ? 'rgba(50, 145, 255, 0.12)' : '#1f1f1f',
                          border: `1px solid ${selectedModel === name ? '#3291ff' : '#2a2a2a'}`,
                          padding: '0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.2rem' }}>{name}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: CATEGORY_COLORS[cmp.category] || '#fff' }}>
                          {cmp.category}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#00df8f', fontFamily: 'monospace' }}>
                          {cmp.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature 2: Explainable AI (XAI) & Token Attribution */}
              {result.explanation && (
                <div style={{ background: '#161616', border: '1px solid #242424', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b779ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🧠 Feature 2: Explainable AI (XAI) Feature Attribution
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>Sub-token TF-IDF weights</span>
                  </div>
                  {result.explanation.tokens && result.explanation.tokens.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {result.explanation.tokens.map((t, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(183, 121, 255, 0.12)',
                          border: '1px solid rgba(183, 121, 255, 0.3)',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          gap: '0.4rem',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#ededed' }}>"{t.token}"</span>
                          <span style={{ color: '#b779ff', fontFamily: 'monospace', fontWeight: 700 }}>{t.weight}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      Sub-word tokens matched against 2,500 vocabulary features.
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {result.explanation.signals?.map((s, idx) => (
                      <div key={idx} style={{ background: '#1c1c1c', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                        <div style={{ color: '#888' }}>{s.signal}</div>
                        <div style={{ color: '#ededed', fontWeight: 600, marginTop: '0.1rem' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Sentiment & Tone Heuristic */}
              {result.tone && (
                <div style={{
                  background: '#161616',
                  border: '1px solid #242424',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Discourse Tone &amp; Sentiment
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: result.tone.color, marginTop: '0.2rem' }}>
                      {result.tone.sentiment}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: result.tone.color,
                    background: `${result.tone.color}15`,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px'
                  }}>
                    {result.tone.score}
                  </div>
                </div>
              )}

              {/* 4. Nearest Historical Trends */}
              {result.similar_trends && result.similar_trends.length > 0 && (
                <div style={{ background: '#161616', border: '1px solid #242424', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ededed', marginBottom: '0.75rem' }}>
                    🔗 Nearest Historical Trends (TF-IDF Cosine Similarity)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {result.similar_trends.map((st, i) => (
                      <div key={i} style={{
                        background: '#1f1f1f',
                        border: '1px solid #2a2a2a',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 600, color: '#ededed', marginBottom: '0.2rem' }}>#{st.tag}</div>
                        <div style={{ color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{st.category} &bull; {st.year}</span>
                          <span style={{ color: '#00df8f', fontFamily: 'monospace' }}>{st.similarity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Lifespan Regression Forecast */}
              {result.lifespan && (
                <div style={{ background: '#161616', border: '1px solid #242424', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ededed' }}>
                      ⏳ Trend Lifespan &amp; Decay Forecast (RandomForestRegressor)
                    </span>
                    <span style={{ color: '#f5a623', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                      ~{result.lifespan.expected_active_hours} hrs active
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: '40px', marginTop: '0.5rem' }}>
                    {result.lifespan.decay_curve?.map((pt, idx) => (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: '80%',
                          height: `${Math.max(pt.retention, 5)}%`,
                          background: '#f5a623',
                          borderRadius: '2px 2px 0 0',
                          opacity: 0.8
                        }} />
                        <span style={{ fontSize: '0.6rem', color: '#666', marginTop: '0.2rem' }}>{pt.hour}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{
              background: '#111',
              border: '1px dashed #282828',
              borderRadius: '8px',
              padding: '3rem 2rem',
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
                Select a showcase card above or adjust the sliders to simulate trend metrics.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Multi-Model Benchmark Comparison Table */}
      {benchmark && benchmark.benchmark && (
        <div style={{ marginTop: '3rem' }}>
          <div className="page-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ededed' }}>
              🔬 ML Algorithm Benchmarking Comparison
            </h2>
            <p className="page-subtitle">Evaluation metrics across 3 models trained on 12,036 records</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Validation Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1-Score</th>
                  <th>Latency (ms)</th>
                  <th>Live Result</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {benchmark.benchmark.map((m, idx) => (
                  <tr key={idx} style={{ background: selectedModel === m.name ? 'rgba(0, 223, 143, 0.05)' : 'transparent' }}>
                    <td>
                      <strong style={{ color: selectedModel === m.name ? '#00df8f' : '#ededed' }}>
                        {m.name}
                      </strong>
                      {selectedModel === m.name && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.65rem',
                          background: 'rgba(0,223,143,0.15)',
                          color: '#00df8f',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(0,223,143,0.3)'
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ flex: 1, minWidth: '70px', height: '6px', background: '#252525', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${m.accuracy}%`,
                            height: '100%',
                            background: selectedModel === m.name ? '#00df8f' : '#3291ff',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span className="font-mono" style={{ color: '#00df8f', width: '48px' }}>{m.accuracy}%</span>
                      </div>
                    </td>
                    <td className="font-mono">{m.precision}%</td>
                    <td className="font-mono">{m.recall}%</td>
                    <td className="font-mono">{m.f1_score}%</td>
                    <td className="font-mono" style={{ color: '#888' }}>{m.latency_ms}ms</td>
                    <td>
                      {result?.comparisons?.[m.name] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{
                            fontWeight: 600,
                            color: CATEGORY_COLORS[result.comparisons[m.name].category] || '#fff'
                          }}>
                            {result.comparisons[m.name].category}
                          </span>
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: '#888' }}>
                            ({result.comparisons[m.name].confidence}%)
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>Run query</span>
                      )}
                    </td>
                    <td>
                      {result?.active_model === m.name ? (
                        <span style={{ fontSize: '0.75rem', color: '#00df8f', fontWeight: 600 }}>Active</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModelSwitch(m.name)}
                          style={{
                            background: '#222',
                            border: '1px solid #333',
                            color: '#ededed',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          Switch
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Prediction
