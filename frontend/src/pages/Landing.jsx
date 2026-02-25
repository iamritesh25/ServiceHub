import { Link } from "react-router-dom";
import "../App.css";

const Landing = () => {
  return (
    <>
      <header className="header">
  <div className="logo">ServiceHub</div>

  <nav>
    <Link to="/login" className="nav-btn">
      Login
    </Link>

    <Link to="/register" className="nav-btn primary">
      Register
    </Link>
  </nav>
</header>

      {/* HERO */}
      <section className="hero">
        <h1>Book Trusted Professionals with Confidence</h1>
        <p>
          ServiceHub connects customers with verified service providers 
          for seamless and secure bookings.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn primary">Get Started</Link>
          <Link to="/login" className="btn secondary">Login</Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2>How ServiceHub Works</h2>

        <div className="steps-grid">
          <div className="step-card">
            <h3>1️⃣ Register</h3>
            <p>Create your account as a Customer or Service Provider.</p>
          </div>

          <div className="step-card">
            <h3>2️⃣ Book a Service</h3>
            <p>Browse services, choose a provider, and schedule your booking.</p>
          </div>

          <div className="step-card">
            <h3>3️⃣ Secure Payment & Rating</h3>
            <p>Pay securely, complete service, and leave feedback.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why Choose ServiceHub?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Verified Providers</h3>
            <p>All professionals are verified and reviewed.</p>
          </div>

          <div className="feature-card">
            <h3>Secure Payments</h3>
            <p>Safe and reliable payment processing.</p>
          </div>

          <div className="feature-card">
            <h3>Real-Time Booking</h3>
            <p>Manage bookings with full transparency.</p>
          </div>

          <div className="feature-card">
            <h3>Role-Based Access</h3>
            <p>Separate dashboards for customers, providers, and admins.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>Join ServiceHub today and experience seamless service booking.</p>
        <Link to="/register" className="btn primary large">
          Create Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            <h3>ServiceHub</h3>
            <p>
              A secure marketplace connecting customers with trusted professionals.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>
  <Link 
    to="/" 
    onClick={() => window.scrollTo(0, 0)}
  >
    Home
  </Link>
</li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <p>Email: support@servicehub.com</p>
            <p>Phone: +91 76665 51412</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 ServiceHub. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Landing;