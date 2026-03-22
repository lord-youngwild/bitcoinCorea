import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/store';
import { ThemeToggle } from './ThemeToggle';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useRetroRefresh } from '../hooks/useRetroRefresh';
import { useThemeColor } from '../hooks/useThemeColor';
import { useSSE } from '../hooks/useSSE';
import { EasterEgg } from './EasterEgg';
import { UnderwaterBubbles } from './UnderwaterBubbles';
import { MatrixRain } from './MatrixRain';
import { OfflineIndicator } from './OfflineIndicator';
import { UpdatePrompt } from './UpdatePrompt';
import { InstallPrompt } from './InstallPrompt';

const NAV_LINKS = [
  { to: '/',     label: 'HOME' },
  { to: '/join', label: 'JOIN' },
  { to: '/comm', label: 'COMM' },
];

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  useKeyboardShortcuts();
  useRetroRefresh();
  useThemeColor();
  useSSE();
  const sseConnected = useAppStore((s) => s.sseConnected);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const theme = useAppStore((s) => s.theme);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {theme === 'sea' && <UnderwaterBubbles />}
      {theme === 'matrix' && <MatrixRain />}

      <style>{`
        /* ---- Nav responsive ---- */
        .nav-desktop  { display: flex; }
        .nav-hamburger { display: none; }
        .nav-drawer   { display: none; }
        .nav-overlay  { display: none; }

        /* ---- Pixel nav item ---- */
        .px-nav-item {
          font-family: var(--font-pixel);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0px;
          color: var(--text-dim);
          text-decoration: none;
          padding: 7px 10px;
          border: 2px solid transparent;
          white-space: nowrap;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          position: relative;
          transition: none;
          line-height: 1.4;
        }
        .px-nav-item:hover {
          color: var(--primary);
          border-color: var(--border);
          background: var(--bg-hover);
          text-shadow: 0 0 8px var(--primary-glow);
        }
        .px-nav-item.active {
          color: var(--primary);
          border: 2px solid var(--primary);
          background: var(--bg-hover);
          text-shadow: 0 0 8px var(--primary-glow);
          box-shadow:
            inset 2px 2px 0 0 rgba(255,255,255,0.06),
            2px 2px 0 0 rgba(0,0,0,0.5);
        }
        .px-nav-item.active::before {
          content: '▶ ';
          color: var(--primary);
          font-size: 8px;
        }

        /* ---- Notification dot ---- */
        .notif-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          background: var(--color-error);
          color: #fff;
          font-family: var(--font-pixel);
          font-size: 7px;
          padding: 1px 3px;
          border-radius: 0;
          border: 1px solid rgba(0,0,0,0.5);
          line-height: 1.2;
          min-width: 14px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .nav-desktop   { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-drawer {
            display: flex !important;
            position: fixed;
            top: 0; left: 0;
            width: 240px; height: 100vh;
            background: var(--bg-card);
            border-right: 4px solid var(--primary);
            flex-direction: column;
            padding: 0;
            z-index: 1001;
            transform: translateX(-100%);
            transition: transform 0.2s steps(4);
            box-shadow: 4px 0 0 0 rgba(0,0,0,0.8);
          }
          .nav-drawer.open { transform: translateX(0); }
          .nav-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.15s;
          }
          .nav-overlay.open { opacity: 1; pointer-events: auto; }
          .px-nav-item { width: 100%; font-size: 13px; padding: 12px 16px; }
        }

        nav::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Mobile overlay */}
      <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile drawer */}
      <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        {/* Drawer header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '4px solid var(--border)',
          background: 'var(--bg)',
        }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--primary)',
            textShadow: '2px 2px 0 rgba(0,0,0,0.8), 0 0 10px var(--primary-glow)',
            letterSpacing: '1px',
            lineHeight: '1.8',
          }}>
            🌊 SEA OF<br />COREA
          </div>
        </div>

        {/* Drawer nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '8px 0' }}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `px-nav-item${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Drawer footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '4px solid var(--border)',
          background: 'var(--bg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            {/* Pixel LED indicator */}
            <div style={{
              width: '8px', height: '8px',
              background: sseConnected ? 'var(--color-success)' : 'var(--color-warning)',
              border: '2px solid rgba(0,0,0,0.5)',
              boxShadow: sseConnected ? '0 0 6px var(--color-success)' : 'none',
            }} />
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              lineHeight: 1.4,
            }}>
              {sseConnected ? 'LIVE' : 'WAIT'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '4px solid var(--primary)',
        background: 'var(--bg-card)',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        minHeight: '52px',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 0 0 rgba(0,0,0,0.6), 0 0 20px var(--primary-glow)',
      }}>
        {/* Hamburger pixel button */}
        <button
          className="nav-hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          style={{
            background: 'var(--bg-hover)',
            border: '3px solid var(--border)',
            cursor: 'pointer',
            padding: '5px 8px',
            flexDirection: 'column',
            gap: '3px',
            flexShrink: 0,
            boxShadow: 'inset 2px 2px 0 0 rgba(255,255,255,0.06), 2px 2px 0 0 rgba(0,0,0,0.5)',
          }}
        >
          {[0,1,2].map((i) => (
            <span key={i} style={{
              width: '18px', height: '3px',
              background: 'var(--primary)',
              display: 'block',
              transition: 'none',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translateY(6px)'
                : i === 2 ? 'rotate(-45deg) translateY(-6px)'
                : 'scaleX(0)'
                : 'none',
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>

        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <img
            src="/soc-logo.png"
            alt="Sea of Corea"
            style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255,157,42,0.4))' }}
          />
        </NavLink>

        {/* Pixel divider */}
        <div style={{
          width: '4px', height: '32px',
          background: 'repeating-linear-gradient(to bottom, var(--border) 0, var(--border) 4px, transparent 4px, transparent 8px)',
          flexShrink: 0,
        }} />

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{
          gap: '4px',
          flex: 1,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          minWidth: 0,
          alignItems: 'center',
        }}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `px-nav-item${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
          {/* LED status */}
          <div
            title={sseConnected ? 'Live feed connected' : 'Connecting...'}
            style={{
              width: '10px', height: '10px',
              background: sseConnected ? 'var(--color-success)' : 'var(--color-warning)',
              border: '2px solid rgba(0,0,0,0.5)',
              boxShadow: sseConnected ? '0 0 8px var(--color-success)' : 'none',
              flexShrink: 0,
            }}
          />
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        padding: '16px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '4px solid var(--border)',
        padding: '8px 14px',
        background: 'var(--bg-card)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
        }}>
          SoC v1.0.3
        </span>
        <a
          href="https://x.com/PromenadeCastle"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--primary)',
            textDecoration: 'none',
            textShadow: '1px 1px 0 rgba(0,0,0,0.8), 0 0 6px var(--primary-glow)',
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
          }}
        >
          BITCOIN CASTLE
        </a>
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: sseConnected ? 'var(--color-success)' : 'var(--color-warning)',
          textAlign: 'right',
          letterSpacing: '1px',
        }}>
          {sseConnected ? '■ LIVE' : '□ WAIT'}
        </span>
      </footer>

      <EasterEgg />
      <UpdatePrompt />
      <InstallPrompt />
      <OfflineIndicator />
    </div>
  );
};
