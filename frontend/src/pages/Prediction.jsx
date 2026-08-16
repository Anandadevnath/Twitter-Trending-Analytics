import { useState, useEffect } from 'react'
import { predictCategory, getModelBenchmark } from '../api'

const SAMPLES = [
  { label: '#Trump', tag: 'Trump', year: 2025, tweets: 35000000, rank: 2, icon: '🏛️' },
  { label: '#Messi', tag: 'Messi', year: 2026, tweets: 8500000, rank: 8, icon: '⚽' },
  { label: '#ChatGPT', tag: 'ChatGPT', year: 2026, tweets: 4200000, rank: 12, icon: '💻' },
  { label: '#TaylorSwift', tag: 'Taylor Swift', year: 2025, tweets: 28000000, rank: 3, icon: '🎬' },
  { label: '#Christmas', tag: 'Christmas', year: 2025, tweets: 950000, rank: 25, icon: '🎄' },
  { label: '#ClimateAction', tag: 'Climate', year: 2026, tweets: 45000, rank: 180, icon: '🌍' },
  { label: '#Bitcoin', tag: 'Bitcoin', year: 2026, tweets: 12500000, rank: 5, icon: '💰' },
  { label: '#WorldCup', tag: 'WorldCup', year: 2026, tweets: 45000000, rank: 1, icon: '🏆' },
  { label: '#CyberSecurity', tag: 'CyberSecurity', year: 2026, tweets: 180000, rank: 65, icon: '🛡️' },
  { label: '#Halloween', tag: 'Halloween', year: 2025, tweets: 1200000, rank: 18, icon: '🎃' },
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
    insight: 'Top 1% viral velocity. Dominates global feeds with multi-million audience reach.'
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

function Prediction() {
  const [form, setForm] = useState({ tag: '', year: 2026, tweets: '', rank: '' })
  const [selectedModel, setSelectedModel] = useState('Random Forest')
  const [result, setResult] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)
  const [benchmark, setBenchmark] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getModelBenchmark()
      .then(res => setBenchmark(res.data))
      .catch(() => {})
  }, [])

  const handleSampleClick = (s) => {
    setForm({ tag: s.tag, year: s.year, tweets: s.tweets, rank: s.rank })
    executePredict(s.tag, s.year, s.tweets, s.rank, selectedModel)
  }

  const executePredict = (tag, year, tweets, rank, modelName = selectedModel) => {
    setLoading(true)
    setError(null)
    setResult(null)

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

  const lvlMeta = result ? (LEVEL_META[result.trending_level] || LEVEL_META.Medium) : null

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">AI Trend Forecaster &amp; Classifier</h1>
        <p className="page-subtitle">Multi-class classification, probabilistic distribution, sentiment tone &amp; cosine similarity</p>
      </div>

      {/* Preset Quick-Test Bar */}
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚡ Sample Queries:
        </span>
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSampleClick(s)}
            style={{
              background: '#181818',
              border: '1px solid #2a2a2a',
              color: '#ededed',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>

        {/* Input Parameters Form */}
        <div className="predict-form" style={{ maxWidth: '100%' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ededed', marginBottom: '1.25rem' }}>
            Hashtag Inputs
          </h3>

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
                  onChange={e => setForm({ ...form, year: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Rank Position</label>
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
              <label>Estimated Tweets</label>
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
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Analyzing Neural Patterns...' : '✨ Run AI Prediction'}
            </button>
          </form>

          {error && <div className="error" style={{ marginTop: '1.25rem' }}>{error}</div>}
        </div>

        {/* Main Forecast Result Card */}
        <div>
          {result && lvlMeta ? (
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
                  background: `${lvlMeta.color}15`,
                  color: lvlMeta.color,
                  border: `1px solid ${lvlMeta.color}40`,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {lvlMeta.badge}
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

              {/* 2. Sentiment & Tone Heuristic */}
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
                      Tone &amp; Discourse Sentiment
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

              {/* 3. Cosine Similarity Matches */}
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
                Enter any hashtag name or click one of the quick test presets above to generate a full ML report.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Multi-Model Benchmark Section */}
      {benchmark && benchmark.benchmark && (
        <div style={{ marginTop: '3rem' }}>
          <div className="page-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ededed' }}>
              🔬 ML Algorithm Benchmarking Comparison
            </h2>
            <p className="page-subtitle">Evaluation metrics across 4 classification models trained on 12,036 records</p>
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
                  <th>Live Query Result</th>
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
                          ACTIVE MODEL
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
                            borderRadius: '3px',
                            transition: 'width 0.8s ease'
                          }} />
                        </div>
                        <span className="font-mono" style={{ color: '#00df8f', width: '48px' }}>{m.accuracy}%</span>
                      </div>
                    </td>
                    <td className="font-mono">{m.precision}%</td>
                    <td className="font-mono">{m.recall}%</td>
                    <td className="font-mono">{m.f1_score}%</td>
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
                      {selectedModel === m.name ? (
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
