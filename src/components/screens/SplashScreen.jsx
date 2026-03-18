import { useState, useEffect } from 'react';
import { C, FONTS } from '../../constants/theme';

export default function SplashScreen({ onDone }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const ts = [
      setTimeout(() => setP(1), 200),
      setTimeout(() => setP(2), 900),
      setTimeout(() => setP(3), 1700),
      setTimeout(() => setP(4), 2500),
      setTimeout(() => { setP(5); setTimeout(onDone, 400); }, 2900),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.red,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, opacity: p >= 5 ? 0 : 1, transition: 'opacity 0.4s ease',
    }}>
      {/* Ripple rings */}
      {[160, 240, 320, 400].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: s, height: s, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          transform: `scale(${p >= 1 ? 1 : 0.2})`,
          opacity: p >= 1 ? 1 : 0,
          transition: `all ${0.6 + i * 0.12}s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`,
        }}/>
      ))}

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        transform: `translateY(${p >= 1 ? 0 : 30}px)`,
        opacity: p >= 1 ? 1 : 0,
        transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          fontSize: '64px', lineHeight: 1, marginBottom: '16px',
          filter: p >= 2 ? 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' : 'none',
          transition: 'filter 0.6s ease',
        }}>🚗</div>

        <h1 style={{
          fontFamily: FONTS.display, fontSize: '60px', fontWeight: '900',
          color: C.white, letterSpacing: '-2px', lineHeight: 1, margin: '0 0 4px',
        }}>
          RU<span style={{ fontStyle: 'italic' }}>Ride</span>
        </h1>

        <div style={{
          height: '2px', background: 'rgba(255,255,255,0.4)', borderRadius: '1px',
          width: p >= 2 ? '100%' : '0%', transition: 'width 0.6s ease 0.3s', margin: '0 auto',
        }}/>

        <p style={{
          fontFamily: FONTS.mono, fontSize: '11px', color: 'rgba(255,255,255,0.7)',
          letterSpacing: '4px', textTransform: 'uppercase', marginTop: '16px',
          opacity: p >= 3 ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>Rutgers Verified · Campus Only</p>
      </div>

      <div style={{
        position: 'absolute', bottom: '56px',
        display: 'flex', gap: '8px',
        opacity: p >= 3 ? 1 : 0, transition: 'opacity 0.4s ease',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)',
            animation: `pulseDot 1.2s ease infinite ${i * 0.2}s`,
          }}/>
        ))}
      </div>
    </div>
  );
}
