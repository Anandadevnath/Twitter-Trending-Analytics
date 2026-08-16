import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Hashtags from './pages/Hashtags'
import Prediction from './pages/Prediction'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo-icon">▲</span>
          <span>Twitter Trend Analytics</span>
        </div>
        <div className="navbar-links">
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? 'active' : ''}>Analytics</NavLink>
          <NavLink to="/hashtags" className={({isActive}) => isActive ? 'active' : ''}>Hashtags</NavLink>
          <NavLink to="/prediction" className={({isActive}) => isActive ? 'active' : ''}>ML Predict</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>Docs</NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/hashtags" element={<Hashtags />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
