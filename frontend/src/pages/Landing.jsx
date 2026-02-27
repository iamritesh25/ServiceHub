import { Link } from "react-router-dom";
import "../App.css";
import "../landing.css";

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
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by Multiple customers &amp; Service Providers across India
          </div>
          <h1>Book Trusted Professionals<br />with Confidence</h1>
          <p>
            ServiceHub connects customers with verified service providers for
            seamless, secure, and transparent bookings — all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn primary">Get Started Free</Link>
            <Link to="/login" className="btn secondary">Sign In →</Link>
          </div>
          <div className="hero-social-proof">
            <div className="hero-avatars">
              {["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"].map((c, i) => (
                <div key={i} className="hero-avatar" style={{ background: c, zIndex: 5 - i }} />
              ))}
            </div>
            <span>Join thousands of happy customers</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-float hero-card-1">
            <div className="hcf-icon">✅</div>
            <div>
              <div className="hcf-label">Booking Confirmed</div>
              <div className="hcf-sub">AC Repair · ₹799</div>
            </div>
          </div>
          <div className="hero-card-float hero-card-2">
            <div className="hcf-icon">⭐</div>
            <div>
              <div className="hcf-label">5.0 Rating</div>
              <div className="hcf-sub">Verified Provider</div>
            </div>
          </div>
          <div className="hero-card-float hero-card-3">
            <div className="hcf-icon">🔒</div>
            <div>
              <div className="hcf-label">Secure Payment</div>
              <div className="hcf-sub">Razorpay Protected</div>
            </div>
          </div>
          <div className="hero-bg-circle hero-circle-1" />
          <div className="hero-bg-circle hero-circle-2" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-container">
          <div className="section-label-tag">Simple Process</div>
          <h2>How ServiceHub Works</h2>
          <p className="section-sub">Get your service done in three simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3>1. Create Account</h3>
              <p>Sign up in seconds as a Customer or Service Provider. No hidden fees, no commitments.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h3>2. Discover &amp; Book</h3>
              <p>Search verified providers by service type, view ratings, and send a booking request instantly.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <h3>3. Pay Securely &amp; Review</h3>
              <p>Pay via Stripe after confirmation, then leave a review to help the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="section-container">
          <div className="section-label-tag">Platform Benefits</div>
          <h2>Why Choose ServiceHub?</h2>
          <p className="section-sub">Everything you need in one platform</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Verified Providers</h3>
              <p>All professionals are vetted, reviewed, and rated by real customers.</p>
              <div className="feature-card-arrow">→</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Secure Payments</h3>
              <p>Powered by Stripe — the world's most trusted payment infrastructure.</p>
              <div className="feature-card-arrow">→</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-orange">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3>Location-Aware</h3>
              <p>GPS-enabled routing so you always know how far your provider is.</p>
              <div className="feature-card-arrow">→</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3>Real-Time Alerts</h3>
              <p>Instant email notifications for every booking update and payment.</p>
              <div className="feature-card-arrow">→</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <div className="cta-badge">Start Today — It's Free</div>
          <h2>Ready to Get Started?</h2>
          <p>Join ServiceHub today and experience seamless, professional service booking.</p>
          <Link to="/register" className="btn primary large">Create Free Account →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
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