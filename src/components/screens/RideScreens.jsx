import { useState, useEffect } from 'react';
import { Btn, Stars, Avatar } from '../ui';
import { LiveMap, FallbackMap } from '../map/LiveMap';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { CAMPUSES } from '../../constants/data';

const FLOW = ['en_route', 'arrived', 'in_progress', 'complete'];
const META = {
  en_route:    { label: 'Driver En Route',    color: '#F0B429', bg: '#FFF8E7', icon: '🚗' },
  arrived:     { label: 'Driver Arrived',      color: '#0A84FF', bg: '#E8F2FF', icon: '📍' },
  in_progress: { label: 'Ride In Progress',    color: C.success, bg: C.successFaint, icon: '⚡' },
  complete:    { label: 'Completing…',          color: C.gray400, bg: C.gray50, icon: '✅' },
};

const REVIEW_TAGS = ['Clean Car', 'Friendly', 'On Time', 'Safe Driver', 'Great Route', 'Professional', 'Smooth Ride'];

// ─── ACTIVE RIDE ─────────────────────────────────────────────────────────────
export function ActiveRideScreen({ ride, onComplete }) {
  const [status, setStatus] = useState('en_route');
  const [elapsed, setElapsed] = useState(0);
  const [driverLoc, setDriverLoc] = useState({ lat: ride.lat || 40.5050, lng: ride.lng || -74.4510 });
  const meta = META[status];
  const from = ride.fromCampus;
  const to = ride.toCampus;

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate driver moving toward user
  useEffect(() => {
    if (status !== 'en_route') return;
    const t = setInterval(() => {
      setDriverLoc(prev => ({
        lat: prev.lat + (40.5008 - prev.lat) * 0.05,
        lng: prev.lng + (-74.4474 - prev.lng) * 0.05,
      }));
    }, 2000);
    return () => clearInterval(t);
  }, [status]);

  const advance = () => {
    const idx = FLOW.indexOf(status);
    if (idx < FLOW.length - 2) setStatus(FLOW[idx + 1]);
    else if (status === 'in_progress') { setStatus('complete'); setTimeout(() => onComplete(ride), 600); }
  };

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      {/* Map — full width */}
      <div style={{ position: 'relative' }}>
        <FallbackMap fromCampus={from} toCampus={to} showDrivers={false} height={280}/>
        {/* Status overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, border: `1px solid ${meta.color}30` }}>
            <span style={{ fontSize: '13px' }}>{meta.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: meta.color }}>{meta.label}</span>
          </div>
          <div style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, fontSize: '12px', fontWeight: '700', color: C.gray700, fontFamily: FONTS.mono }}>{fmt(elapsed)}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px 20px 40px', overflowY: 'auto' }}>
        {/* Driver card */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '12px', boxShadow: SHADOW.sm }}>
          <Avatar initials={ride.initials || 'DR'} size={56}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '16px', color: C.gray800 }}>{ride.name}</p>
              {ride.verified && <span>✅</span>}
            </div>
            <Stars rating={ride.rating || 4.9} size={12}/>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.gray400 }}>{ride.car} · {ride.plate}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gray600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.98 2.18 2 2 0 012.96 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg> },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gray600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            ].map((b, i) => (
              <button key={i} style={{ width: '38px', height: '38px', borderRadius: '11px', background: C.gray50, border: `1px solid ${C.gray100}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b.icon}</button>
            ))}
          </div>
        </div>

        {/* Trip info */}
        <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: '12px', boxShadow: SHADOW.sm }}>
          {[
            { dot: C.success, label: 'Pickup', val: from?.name || ride.from || 'Your Location' },
            { dot: C.red,     label: 'Drop-off', val: to?.name   || ride.to   || 'Destination'   },
            { dot: null,      label: 'Fare',    val: '$5.00 flat' },
            { dot: null,      label: 'ETA',     val: ride.eta || '8 min' },
          ].map(({ dot, label, val }, i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {dot ? <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot }}/> : <div style={{ width: '8px' }}/>}
                <span style={{ fontSize: '13px', color: C.gray500 }}>{label}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Safety */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <button style={{ flex: 1, padding: '12px', background: C.redFaint, border: `1px solid rgba(204,0,51,0.15)`, borderRadius: RADIUS.md, color: C.red, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>🆘 Emergency</button>
          <button style={{ flex: 1, padding: '12px', background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.md, color: C.gray600, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>📤 Share Trip</button>
        </div>

        <Btn onClick={advance} variant={status === 'in_progress' ? 'ghost' : 'primary'} size="lg"
          style={status === 'in_progress' ? { border: `2px solid ${C.success}`, color: C.success, background: C.successFaint } : {}}>
          {status === 'en_route'    ? '✓ Driver Has Arrived'
          : status === 'arrived'   ? '▶ Start Ride'
          : status === 'in_progress' ? '✅ Complete Ride'
          : 'Processing…'}
        </Btn>
        <p style={{ textAlign: 'center', fontSize: '11px', color: C.gray300, marginTop: '7px' }}>[Demo: tap to advance ride status]</p>
      </div>
    </div>
  );
}

// ─── REVIEW SCREEN ────────────────────────────────────────────────────────────
export function ReviewScreen({ ride, onDone }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const labels = ['', 'Poor 😕', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent! 🤩'];

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '56px', marginBottom: '10px' }}>⭐</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: C.gray800, margin: '0 0 4px', fontFamily: FONTS.body }}>How was your ride?</h2>
          <p style={{ fontSize: '13px', color: C.gray400, margin: 0 }}>with {ride.name}</p>
        </div>

        {/* Stars */}
        <div style={{ padding: '24px', background: C.gray50, borderRadius: RADIUS.xl, marginBottom: '14px', textAlign: 'center', border: `1px solid ${C.gray100}` }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transform: i <= (hover || rating) ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill={i <= (hover || rating) ? '#F0B429' : C.gray200}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#8A6500' }}>{labels[rating]}</p>}
        </div>

        {/* Tags */}
        <div style={{ padding: '18px', background: C.gray50, borderRadius: RADIUS.xl, marginBottom: '14px', border: `1px solid ${C.gray100}` }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: C.gray400, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 12px' }}>What stood out?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {REVIEW_TAGS.map(t => (
              <button key={t} onClick={() => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} style={{ padding: '7px 13px', borderRadius: RADIUS.full, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: FONTS.body, border: `1.5px solid ${tags.includes(t) ? C.red : C.gray200}`, background: tags.includes(t) ? C.redFaint : C.white, color: tags.includes(t) ? C.red : C.gray500, transition: 'all 0.15s' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment (optional)…" rows={3} style={{ width: '100%', padding: '12px 14px', background: C.white, border: `1.5px solid ${C.gray200}`, borderRadius: RADIUS.lg, color: C.gray800, fontSize: '14px', resize: 'none', outline: 'none', fontFamily: FONTS.body, lineHeight: '1.5', marginBottom: '16px', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = C.gray700} onBlur={e => e.target.style.borderColor = C.gray200}/>

        <Btn onClick={onDone} disabled={rating === 0} size="lg">
          {rating === 0 ? 'Select a rating to submit' : 'Submit Review →'}
        </Btn>
      </div>
    </div>
  );
}
