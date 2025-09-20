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
  Zap
} from 'lucide-react';
import './landing.styles.css';

const LandingPage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with role-based access control and data encryption."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Portal System",
      description: "Dedicated portals for superadmins, accounts, and agencies with tailored experiences."
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Account Management",
      description: "Comprehensive tenant management with detailed analytics and reporting."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Support for multiple regions and languages with localized experiences."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Data Protection",
      description: "GDPR compliant with advanced data protection and privacy controls."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "High Performance",
      description: "Lightning-fast performance with optimized infrastructure and caching."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "IT Director",
      company: "TechCorp Inc.",
      content: "NoemieX has transformed how we manage our multi-tenant operations. The security features are top-notch.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      company: "Global Solutions",
      content: "The portal system is intuitive and powerful. Our team productivity has increased by 40%.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Security Lead",
      company: "SecureData Ltd.",
      content: "Outstanding security features and compliance tools. Exactly what we needed for our enterprise.",
      rating: 5
    }
  ];

  const benefits = [
    "Role-based access control",
    "Real-time analytics dashboard",
    "Automated compliance reporting",
    "24/7 technical support",
    "API integration capabilities",
    "Custom branding options"
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
                Enterprise-Grade
                <span className="text-gradient"> Multi-Portal </span>
                Management System
              </h1>
              <p className="hero-description">
                Streamline your operations with our secure, scalable platform designed for 
                superadmins, account managers, and agencies. Experience the future of 
                enterprise management today.
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
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">Uptime</div>
                </div>
                <div className="stat">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Companies</div>
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
            <h2>Powerful Features for Modern Enterprises</h2>
            <p>Everything you need to manage your multi-tenant operations efficiently and securely.</p>
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
              <h2>Why Choose NoemieX?</h2>
              <p>
                Our platform is built with enterprise needs in mind, offering unparalleled 
                security, scalability, and user experience across all portal types.
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
                    <span>Superadmin Portal</span>
                  </div>
                  <div className="portal-features">
                    <div>Global oversight</div>
                    <div>System configuration</div>
                    <div>User management</div>
                  </div>
                </div>
                <div className="portal-card account">
                  <div className="portal-header">
                    <Building2 className="w-6 h-6" />
                    <span>Account Portal</span>
                  </div>
                  <div className="portal-features">
                    <div>Tenant management</div>
                    <div>Analytics dashboard</div>
                    <div>Billing & reports</div>
                  </div>
                </div>
                <div className="portal-card agency">
                  <div className="portal-header">
                    <Users className="w-6 h-6" />
                    <span>Agency Portal</span>
                  </div>
                  <div className="portal-features">
                    <div>Client management</div>
                    <div>Project tracking</div>
                    <div>Team collaboration</div>
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
            <h2>Trusted by Industry Leaders</h2>
            <p>See what our customers have to say about their experience with NoemieX.</p>
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
            <h2>Ready to Transform Your Operations?</h2>
            <p>
              Join thousands of companies already using NoemieX to streamline their 
              multi-tenant operations and boost productivity.
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