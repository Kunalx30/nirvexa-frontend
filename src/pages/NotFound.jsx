import { Link } from 'react-router-dom'
import { ArrowRight, Shield } from 'lucide-react'
import CursorEffect from '../components/CursorEffect'

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        .nf-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .nf-card {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Logo */
        .nf-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          justify-content: center;
          margin-bottom: 28px;
          text-decoration: none;
        }
        .nf-lsq {
          width: 32px;
          height: 32px;
          background: #0a0a0a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fafafa;
          letter-spacing: -.5px;
        }
        .nf-lname {
          font-size: 18px;
          font-weight: 600;
          color: #0a0a0a;
          letter-spacing: -.4px;
        }

        /* 404 number */
        .nf-code {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(96px, 22vw, 140px);
          font-weight: 400;
          letter-spacing: -6px;
          color: #0a0a0a;
          line-height: 1;
          margin-bottom: 0px;
          text-align: center;
          user-select: none;
        }

        /* Heading */
        .nf-heading {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(26px, 5vw, 34px);
          font-weight: 400;
          letter-spacing: -1.5px;
          color: #0a0a0a;
          text-align: center;
          line-height: 1.15;
          margin-bottom: 10px;
        }
        .nf-heading em {
          font-style: italic;
          color: #6b6b6b;
        }

        .nf-sub {
          font-size: 15px;
          color: #6b6b6b;
          text-align: center;
          margin-bottom: 32px;
          font-weight: 400;
          line-height: 1.6;
          max-width: 360px;
        }

        /* Card wrap */
        .nf-form-wrap {
          background: #ffffff;
          border: 1px solid #e4e4e4;
          border-radius: 20px;
          padding: 28px 28px;
          box-shadow: 0 2px 4px rgba(0,0,0,.03), 0 16px 48px rgba(0,0,0,.06);
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Divider */
        .nf-divider {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .nf-divider-line {
          flex: 1;
          height: 1px;
          background: #e4e4e4;
        }
        .nf-divider-text {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #a3a3a3;
        }

        /* Buttons */
        .nf-btn-primary {
          width: 100%;
          padding: 13px 24px;
          background: #0a0a0a;
          color: #fafafa;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -.3px;
          border: none;
          border-radius: 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
        }
        .nf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,.18);
        }

        .nf-btn-secondary {
          width: 100%;
          padding: 13px 24px;
          background: #fafafa;
          color: #0a0a0a;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -.3px;
          border: 1px solid #e4e4e4;
          border-radius: 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s, border-color .2s;
        }
        .nf-btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,.08);
          border-color: #c4c4c4;
        }

        /* Footer */
        .nf-footer {
          text-align: center;
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .nf-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #a3a3a3;
          text-decoration: none;
          font-weight: 500;
          transition: color .2s;
        }
        .nf-back:hover { color: #0a0a0a; }

        .nf-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 10px;
          font-size: 11px;
          color: #c4c4c4;
        }

        @media (max-width: 500px) {
          .nf-form-wrap { padding: 24px 20px; border-radius: 16px; }
          .nf-code { letter-spacing: -4px; }
        }
      `}</style>

      <div className="nf-page">
        <CursorEffect />

        <div className="nf-card">

          {/* Logo */}
          <Link to="/" className="nf-logo">
            <img src="/logos.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span className="nf-lname">Nyrvexa</span>
          </Link>

          {/* 404 */}
          <div className="nf-code">404</div>

          <h1 className="nf-heading">Page <em>not found.</em></h1>
          <p className="nf-sub">
            This page doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="nf-form-wrap">

            <Link to="/" className="nf-btn-primary">
              <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
              Back to Homepage
            </Link>

            <div className="nf-divider">
              <div className="nf-divider-line" />
              <span className="nf-divider-text">or</span>
              <div className="nf-divider-line" />
            </div>

            <Link to="/chat" className="nf-btn-secondary">
              Go to AI Assistant
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* Bottom */}
          <div className="nf-footer">
            <Link to="/login" className="nf-back">
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Sign in instead
            </Link>
            <div className="nf-secure">
              <Shield size={10} strokeWidth={2} />
              Secure · Encrypted · Built in India
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
