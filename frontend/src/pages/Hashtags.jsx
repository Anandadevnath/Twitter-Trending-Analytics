import { useState, useEffect } from 'react'
import { getTrends, searchTrends, getAnalytics } from '../api'

function getBadgeClass(category) {
  return `badge badge-${category.toLowerCase()}`
}

function getLevelBadge(level) {
  return `badge badge-${level.toLowerCase()}`
}

function Hashtags() {
  const [trends, setTrends] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)

  // Filters
  const [yearFilter, setYearFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [years, setYears] = useState([])

  useEffect(() => {
    getAnalytics().then(res => setYears(res.data.years)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (yearFilter) params.year = yearFilter
    if (categoryFilter) params.category = categoryFilter
    if (levelFilter) params.trending_level = levelFilter

    getTrends(params)
      .then(res => {
        setTrends(res.data.trends)
        setTotal(res.data.total)
        setPages(res.data.pages)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, yearFilter, categoryFilter, levelFilter])

  const handleSearch = () => {
    if (!search.trim()) return
    setLoading(true)
    searchTrends(search.trim())
      .then(res => {
        setSearchResult(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  const clearSearch = () => {
    setSearch('')
    setSearchResult(null)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const displayData = searchResult || trends

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Hashtags Explorer</h1>
        <p className="page-subtitle">Search, filter, and inspect granular trending records</p>
      </div>

      {/* Search Input Bar */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by keyword (e.g. Trump, Messi, Christmas)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        {searchResult && <button className="btn btn-secondary" onClick={clearSearch}>Reset</button>}
      </div>

      {/* Search Result Card */}
      {searchResult && searchResult.length > 0 && (
        <div className="hashtag-detail" style={{marginBottom: '1.5rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
            <h3 style={{fontSize:'0.9rem', color:'#ededed'}}>Match Found</h3>
            <span style={{fontSize:'0.75rem', color:'#888', fontFamily:'monospace'}}>{searchResult.length} matches</span>
          </div>
          {searchResult.slice(0, 1).map(t => (
            <div key={t._id}>
              <div className="detail-row"><span className="detail-label">Hashtag</span><span className="detail-value font-mono">#{t.tag}</span></div>
              <div className="detail-row"><span className="detail-label">Recorded Year</span><span className="detail-value">{t.year}</span></div>
              <div className="detail-row"><span className="detail-label">Peak Date</span><span className="detail-value">{formatDate(t.peak_date)}</span></div>
              <div className="detail-row"><span className="detail-label">Volume</span><span className="detail-value font-mono">{t.tweets.toLocaleString()} tweets</span></div>
              <div className="detail-row"><span className="detail-label">Rank</span><span className="detail-value font-mono">#{t.rank}</span></div>
              <div className="detail-row"><span className="detail-label">Category</span><span className="detail-value"><span className={getBadgeClass(t.category)}>{t.category}</span></span></div>
              <div className="detail-row"><span className="detail-label">Virality</span><span className="detail-value"><span className={getLevelBadge(t.trending_level)}>{t.trending_level}</span></span></div>
            </div>
          ))}
        </div>
      )}

      {searchResult && searchResult.length === 0 && (
        <div className="error">No trending records found matching "{search}"</div>
      )}

      {/* Multi-Criteria Filters */}
      {!searchResult && (
        <div className="filters">
          <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1) }}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            {['Politics','Sports','Entertainment','Technology','Holiday','Social','Other'].map(c =>
              <option key={c} value={c}>{c}</option>
            )}
          </select>
          <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1) }}>
            <option value="">All Virality Levels</option>
            {['Low','Medium','High','Viral'].map(l =>
              <option key={l} value={l}>{l}</option>
            )}
          </select>
        </div>
      )}

      {error && <div className="error">Error: {error}</div>}
      {loading && <div className="loading">&gt; Fetching telemetry data...</div>}

      {/* Vercel Clean Data Table */}
      {!loading && (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hashtag</th>
                  <th>Year</th>
                  <th>Peak Date</th>
                  <th>Volume</th>
                  <th>Rank</th>
                  <th>Category</th>
                  <th>Virality</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map(t => (
                  <tr key={t._id}>
                    <td><span className="font-mono" style={{fontWeight:600}}>#{t.tag}</span></td>
                    <td style={{color:'#888'}}>{t.year}</td>
                    <td style={{color:'#888'}}>{formatDate(t.peak_date)}</td>
                    <td className="font-mono">{t.tweets.toLocaleString()}</td>
                    <td className="font-mono" style={{color:'#888'}}>#{t.rank}</td>
                    <td><span className={getBadgeClass(t.category)}>{t.category}</span></td>
                    <td><span className={getLevelBadge(t.trending_level)}>{t.trending_level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!searchResult && (
            <div className="pagination">
              <span className="pagination-info">
                Showing page <strong style={{color:'#ededed'}}>{page}</strong> of <strong style={{color:'#ededed'}}>{pages}</strong> ({total.toLocaleString()} records)
              </span>
              <div className="pagination-btns">
                <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  Previous
                </button>
                <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page >= pages}>
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Hashtags
