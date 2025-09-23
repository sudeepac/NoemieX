// AI-NOTE: Landing page content updated to focus on study abroad commission billing
// Changed from generic enterprise multi-tenant to specific study abroad agency use case
// Target customers: 1) Study abroad agencies with subagent networks 2) CRM providers needing commission APIs
// Key pain points addressed: manual commission processes, reconciliation complexity, multi-currency, audit compliance
// Content reflects research on industry challenges: 68% use manual processes, subagent transparency needs, clawback disputes

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Globe,
  Lock,
  Zap,
  BarChart3,
  CreditCard,
  Settings
} from 'lucide-react';
import './landing.styles.css';

const LandingPage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Subagent-Ready Commission Engine",
      description: "Tiered rates, overrides, bonuses, caps, minimums, and multi-currency support — all scoped per agency within each account."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "From Offer Letter to Payout",
      description: "Versioned payment schedules flow into traceable transactions with clear states and full history."
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Disputes & Clawbacks, Simplified",
      description: "Track exceptions, partials, deferrals, and clawbacks with an immutable event log and clear audit trail."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Currency Ready",
      description: "Define base currency and convert consistently; ensure payout readiness with transparent status and history."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Multi-Tenant Isolation by Design",
      description: "Strong tenant boundaries and agency-level RBAC across portals keep data clean, compliant, and secure."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "API & Whitelabel Integration",
      description: "Drop-in API and whitelabel UI to embed commission billing into your CRM without rebuilding core primitives."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Operations Director",
      company: "Global Education Partners",
      content: "Before NoemieX, we spent 15 hours per month reconciling subagent commissions. Now it's automated and audit-ready.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Network Manager",
      company: "StudyLink International",
      content: "Our subagents love the transparency. They can see their commission calculations in real-time, reducing disputes by 80%.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Technical Lead",
      company: "EduCRM Solutions",
      content: "The API integration was seamless. Our CRM now handles commission billing natively without any manual intervention.",
      rating: 5
    }
  ];

  const benefits = [
    "Automated commission calculations and splits",
    "Multi-currency support with consistent conversion",
    "Immutable audit trail for disputes and compliance",
    "Subagent portal with performance tracking",
    "API-first architecture for CRM integration",
    "Whitelabel options for seamless branding"
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>NoemieX</h1>
            </div>
            <nav className="nav">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Commission & Billing
                <span className="text-gradient"> Infrastructure </span>
                for Study Abroad Networks
              </h1>
              <p className="hero-description">
                Automate subagent commission splits, reconcile faster, and pay with confidence — 
                tenant-safe, agency-aware, and audit-ready. Built for study abroad agencies 
                and CRM providers who need bulletproof billing.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">22K+</div>
                  <div className="stat-label">Global Agents</div>
                </div>
                <div className="stat">
                  <div className="stat-number">68%</div>
                  <div className="stat-label">Use Manual Processes</div>
                </div>
                <div className="stat">
                  <div className="stat-number">15%</div>
                  <div className="stat-label">Avg Commission Rate</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-header">
                  <div className="card-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="card-title">Dashboard Overview</div>
                </div>
                <div className="card-content">
                  <div className="metric">
                    <div className="metric-label">Total Accounts</div>
                    <div className="metric-value">1,247</div>
                    <div className="metric-change positive">+12%</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Active Users</div>
                    <div className="metric-value">8,932</div>
                    <div className="metric-change positive">+8%</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Revenue</div>
                    <div className="metric-value">$124K</div>
                    <div className="metric-change positive">+15%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Built for Study Abroad Commission Complexity</h2>
            <p>Everything you need to automate subagent commissions, reconcile payments, and scale your agency network.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Why Study Abroad Agencies Choose NoemieX?</h2>
              <p>
                Many agencies still manage commissions with spreadsheets or manual processes, making 
                reconciliation slow and error-prone. Our platform automates the entire commission 
                lifecycle with tenant-safe, agency-aware architecture.
              </p>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div className="benefits-visual">
              <div className="portal-cards">
                <div className="portal-card superadmin">
                  <div className="portal-header">
                    <Shield className="w-6 h-6" />
                    <span>Platform Portal</span>
                  </div>
                  <div className="portal-features">
                    <div>Multi-tenant oversight</div>
                    <div>Commission rule templates</div>
                    <div>Global compliance monitoring</div>
                  </div>
                </div>
                <div className="portal-card account">
                  <div className="portal-header">
                    <Building2 className="w-6 h-6" />
                    <span>Agency HQ Portal</span>
                  </div>
                  <div className="portal-features">
                    <div>Subagent network management</div>
                    <div>Commission reconciliation</div>
                    <div>Payout scheduling & tracking</div>
                  </div>
                </div>
                <div className="portal-card agency">
                  <div className="portal-header">
                    <Users className="w-6 h-6" />
                    <span>Subagent Portal</span>
                  </div>
                  <div className="portal-features">
                    <div>Commission statements</div>
                    <div>Student placement tracking</div>
                    <div>Performance bonuses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Trusted by Study Abroad Professionals</h2>
            <p>Agencies and CRM providers solving commission complexity with NoemieX</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-warning" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                    <div className="author-company">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Automate Your Commission Operations?</h2>
            <p>
              Join study abroad agencies and CRM providers who've eliminated manual commission processes. 
              Start your free trial and see commission automation in action.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>NoemieX</h3>
              <p>Enterprise-grade multi-portal management system.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <Link to="/features">Features</Link>
                <Link to="/pricing">Pricing</Link>
                <Link to="/security">Security</Link>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <Link to="/about">About</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/contact">Contact</Link>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <Link to="/help">Help Center</Link>
                <Link to="/docs">Documentation</Link>
                <Link to="/status">Status</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 NoemieX. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;