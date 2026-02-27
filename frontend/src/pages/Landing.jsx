import { Link } from "react-router-dom";
import "../App.css";

const Landing = () => {
  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="logo">ServiceHub</div>
        <nav>
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/register" className="nav-btn primary">Get Started Free</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">Trusted by Multiple customers & Service Providers across India</div>
        <h1>Book Trusted Professionals<br />with Confidence</h1>
        <p>
          ServiceHub connects customers with verified service providers for
          seamless, secure, and transparent bookings — all in one place.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn primary">Get Started Free</Link>
          <Link to="/login" className="btn secondary">Sign In →</Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2>How ServiceHub Works</h2>
        <p className="section-sub">Get your service done in three simple steps</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">🔐</div>
            <h3>1. Create Account</h3>
            <p>Sign up in seconds as a Customer or Service Provider. No hidden fees, no commitments.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🔍</div>
            <h3>2. Discover & Book</h3>
            <p>Search verified providers by service type, view ratings, and send a booking request instantly.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">💳</div>
            <h3>3. Pay Securely & Review</h3>
            <p>Pay via Stripe after confirmation, then leave a review to help the community.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why Choose ServiceHub?</h2>
        <p className="section-sub">Everything you need in one platform</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Verified Providers</h3>
            <p>All professionals are vetted, reviewed, and rated by real customers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>Powered by Stripe — the world's most trusted payment infrastructure.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location-Aware</h3>
            <p>GPS-enabled routing so you always know how far your provider is.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📧</div>
            <h3>Real-Time Alerts</h3>
            <p>Instant email notifications for every booking update and payment.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>Join ServiceHub today and experience seamless, professional service booking.</p>
        <Link to="/register" className="btn primary large">Create Free Account →</Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            <h3>ServiceHub</h3>
            <p>A secure marketplace connecting customers with trusted professionals across India.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <p>Email: support@servicehub.com</p>
            <p style={{ marginTop: "8px" }}>Phone: +91 76665 51412</p>
          </div>
        </div>
        <div className="footer-bottom">© 2025 ServiceHub. All rights reserved.</div>
      </footer>
    </>
  );
};

export default Landing;
