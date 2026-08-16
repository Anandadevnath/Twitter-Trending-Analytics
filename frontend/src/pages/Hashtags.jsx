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
      <h1 className="page-title">Hashtags</h1>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search hashtag (e.g. Trump, Messi, Christmas)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        {searchResult && <button className="btn" style={{background:'#e0e0e0'}} onClick={clearSearch}>Clear</button>}
      </div>

      {/* Search result detail */}
      {searchResult && searchResult.length > 0 && (
        <div className="hashtag-detail" style={{marginBottom: '1.5rem'}}>
          <h3 style={{marginBottom: '1rem', color: '#1da1f2'}}>Search Results ({searchResult.length})</h3>
          {searchResult.slice(0, 1).map(t => (
            <div key={t._id}>
              <div className="detail-row"><span className="detail-label">Hashtag</span><span className="detail-value">{t.tag}</span></div>
              <div className="detail-row"><span className="detail-label">Year</span><span className="detail-value">{t.year}</span></div>
              <div className="detail-row"><span className="detail-label">Peak Date</span><span className="detail-value">{formatDate(t.peak_date)}</span></div>
              <div className="detail-row"><span className="detail-label">Tweets</span><span className="detail-value">{t.tweets.toLocaleString()}</span></div>
              <div className="detail-row"><span className="detail-label">Rank</span><span className="detail-value">{t.rank}</span></div>
              <div className="detail-row"><span className="detail-label">Category</span><span className="detail-value"><span className={getBadgeClass(t.category)}>{t.category}</span></span></div>
              <div className="detail-row"><span className="detail-label">Trending Level</span><span className="detail-value"><span className={getLevelBadge(t.trending_level)}>{t.trending_level}</span></span></div>
            </div>
          ))}
        </div>
      )}

      {searchResult && searchResult.length === 0 && (
        <div className="error">No results found for "{search}"</div>
      )}

      {/* Filters */}
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
            <option value="">All Levels</option>
            {['Low','Medium','High','Viral'].map(l =>
              <option key={l} value={l}>{l}</option>
            )}
          </select>
        </div>
      )}

      {error && <div className="error">Error: {error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Table */}
      {!loading && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Year</th>
                <th>Peak Date</th>
                <th>Tweets</th>
                <th>Rank</th>
                <th>Category</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.tag}</strong></td>
                  <td>{t.year}</td>
                  <td>{formatDate(t.peak_date)}</td>
                  <td>{t.tweets.toLocaleString()}</td>
                  <td>{t.rank}</td>
                  <td><span className={getBadgeClass(t.category)}>{t.category}</span></td>
                  <td><span className={getLevelBadge(t.trending_level)}>{t.trending_level}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination (only when not searching) */}
          {!searchResult && (
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>← Prev</button>
              <span>Page {page} of {pages} ({total} results)</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Hashtags
