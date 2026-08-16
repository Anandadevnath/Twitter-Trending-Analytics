import { useState } from 'react'
import { predictCategory } from '../api'

function Prediction() {
  const [form, setForm] = useState({ tag: '', year: 2026, tweets: '', rank: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.tag || !form.tweets || !form.rank) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    predictCategory({
      tag: form.tag,
      year: Number(form.year),
      tweets: Number(form.tweets),
      rank: Number(form.rank)
    })
      .then(res => setResult(res.data))
      .catch(err => setError(err.response?.data?.detail || err.message || 'FastAPI service may not be running'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="page">
      <h1 className="page-title">ML Prediction</h1>
      <p style={{marginBottom: '1.5rem', color: '#666'}}>
        Enter a hashtag and its details to predict its category using the trained Random Forest model.
      </p>

      <div className="predict-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hashtag</label>
            <input
              type="text"
              placeholder="e.g. Messi, Trump, Christmas"
              value={form.tag}
              onChange={e => setForm({...form, tag: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={form.year}
              onChange={e => setForm({...form, year: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Expected Tweets</label>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={form.tweets}
              onChange={e => setForm({...form, tweets: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Rank</label>
            <input
              type="number"
              placeholder="e.g. 15"
              value={form.rank}
              onChange={e => setForm({...form, rank: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Predicting...' : 'PREDICT'}
          </button>
        </form>

        {error && <div className="error" style={{marginTop:'1rem'}}>{error}</div>}

        {result && (
          <div className="prediction-result">
            <h3>Prediction Result</h3>
            <p><strong>Predicted Category:</strong> {result.category}</p>
            <p><strong>Trending Level:</strong> {result.trending_level}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Prediction
