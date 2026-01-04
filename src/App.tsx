import './App.css';

interface AppProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'editor' | 'portfolio') => void;
}

function App({ onNavigate }: AppProps) {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <span className="logo-icon">☀️</span>
            <span className="logo-text">MakerPort</span>
          </div>
          <div className="nav-links">
            <button className="btn-login" onClick={() => onNavigate('dashboard')}>Login</button>
            <button className="btn-primary" onClick={() => onNavigate('dashboard')}>Get Started</button>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <h1>Showcase Your Maker Journey</h1>
              <p>Turn your workshop projects into professional portfolios, posters, and presentations with a single click. Documenting your work has never been this joyful.</p>
              <div className="hero-actions">
                <button className="btn-primary btn-large" onClick={() => onNavigate('dashboard')}>Create Your First Project</button>
                <button className="btn-secondary" onClick={() => onNavigate('portfolio')}>View Portfolio</button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card p1">
                <span className="tag">New Project</span>
                <h3>Solar Powered Rover</h3>
                <div className="progress-bar"></div>
              </div>
              <div className="floating-card p2">
                <span className="tag-orange">Poster Ready</span>
                <div className="mini-poster"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2 className="section-title">Everything you need for Makerfest</h2>
            <div className="feature-grid">
              <div className="card feature-card">
                <div className="feature-icon">📝</div>
                <h3>Magic Documentation</h3>
                <p>Auto-saving editor that helps you capture every step of your creation process.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">🖼️</div>
                <h3>Poster Generator</h3>
                <div className="feature-status">A3 / A4 Ready</div>
                <p>Instantly turn your documentation into a beautiful workshop poster.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">📊</div>
                <h3>Slide Deck</h3>
                <p>Export your project data as a professional presentation for the big stage.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 MakerPort. Built for creators.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
