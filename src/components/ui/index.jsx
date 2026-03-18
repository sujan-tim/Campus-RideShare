import { useState } from 'react';
import { C, FONTS, SHADOW, RADIUS } from '../../constants/theme';

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style: ex, fullWidth = true }) {
  const [press, setPress] = useState(false);
  const pad = { sm: '9px 18px', md: '13px 22px', lg: '16px 28px' };
  const fz  = { sm: '13px',     md: '14px',      lg: '16px'      };
  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: fullWidth ? '100%' : 'auto', border: 'none', borderRadius: RADIUS.md,
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: FONTS.body,
    fontWeight: '600', fontSize: fz[size], padding: pad[size],
    transition: 'all 0.15s ease', opacity: disabled ? 0.45 : 1,
    transform: press ? 'scale(0.97)' : 'scale(1)',
  };
  const styles = {
    primary:   { background: C.red,    color: C.white,  boxShadow: press ? 'none' : SHADOW.red },
    secondary: { background: C.white,  color: C.gray700, border: `1.5px solid ${C.gray200}`, boxShadow: SHADOW.sm },
    ghost:     { background: 'transparent', color: C.red, border: `1.5px solid ${C.red}` },
    danger:    { background: C.redFaint, color: C.red, border: `1.5px solid rgba(204,0,51,0.2)` },
    outline:   { background: 'transparent', color: C.gray700, border: `1.5px solid ${C.gray200}` },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)} onMouseLeave={() => setPress(false)}
      style={{ ...base, ...styles[variant], ...ex }}
    >{children}</button>
  );
}

export function Input({ label, type = 'text', value, onChange, placeholder, icon, hint, error, autoFocus }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none', color: C.gray400 }}>{icon}</span>}
        <input
          type={type} value={value} autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: '100%', padding: icon ? '12px 12px 12px 40px' : '12px 14px',
            background: C.white, border: `1.5px solid ${error ? C.red : focus ? C.gray700 : C.gray200}`,
            borderRadius: RADIUS.md, color: C.gray800, fontSize: '14px', outline: 'none',
            fontFamily: FONTS.body, boxSizing: 'border-box', transition: 'border-color 0.15s',
          }}
        />
      </div>
      {hint  && !error && <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.gray400 }}>{hint}</p>}
      {error && <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.red }}>{error}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, placeholder }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ width: '100%', padding: '12px 36px 12px 14px', background: C.white, border: `1.5px solid ${focus ? C.gray700 : C.gray200}`, borderRadius: RADIUS.md, color: value ? C.gray800 : C.gray400, fontSize: '14px', outline: 'none', appearance: 'none', cursor: 'pointer', fontFamily: FONTS.body }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}
        </select>
        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: C.gray400, pointerEvents: 'none', fontSize: '11px' }}>▼</span>
      </div>
    </div>
  );
}

export function Check({ checked, onChange, label, sublabel, onSublabelClick }) {
  return (
    <div onClick={onChange} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', background: checked ? C.redFaint : C.white, border: `1.5px solid ${checked ? 'rgba(204,0,51,0.25)' : C.gray200}`, borderRadius: RADIUS.md, cursor: 'pointer', marginBottom: '10px', transition: 'all 0.15s' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px', background: checked ? C.red : C.white, border: `2px solid ${checked ? C.red : C.gray300}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
        {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: C.gray800 }}>{label}</p>
        {sublabel && <p onClick={e => { e.stopPropagation(); onSublabelClick?.(); }} style={{ margin: 0, fontSize: '12px', color: onSublabelClick ? C.red : C.gray400, textDecoration: onSublabelClick ? 'underline' : 'none', cursor: onSublabelClick ? 'pointer' : 'default' }}>{sublabel}</p>}
      </div>
    </div>
  );
}

export function Stars({ rating, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F0B429' : C.gray200}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: size - 1, color: C.gray500, fontWeight: '600', marginLeft: '2px' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export function Tag({ children, color = C.red }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', background: `${color}10`, color, border: `1px solid ${color}28`, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>
      {children}
    </span>
  );
}

export function Divider({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
      <div style={{ flex: 1, height: '1px', background: C.gray100 }}/>
      {text && <span style={{ fontSize: '11px', color: C.gray400, letterSpacing: '1px', textTransform: 'uppercase' }}>{text}</span>}
      <div style={{ flex: 1, height: '1px', background: C.gray100 }}/>
    </div>
  );
}

export function Avatar({ initials, size = 44, color = C.red }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: `${color}15`, border: `2px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700', color, fontFamily: FONTS.body, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width: '38px', height: '38px', borderRadius: '11px', background: C.white, border: `1.5px solid ${C.gray200}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: SHADOW.sm }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gray700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>
  );
}

export function Sheet({ children, onClose, title }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-end', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ width: '100%', background: C.white, borderRadius: '20px 20px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s ease' }}>
        <div style={{ padding: '14px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.gray100}` }}>
          <span style={{ width: '40px' }}/>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: C.gray200, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '8px' }}/>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.gray800, fontFamily: FONTS.body, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.gray100, border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray600 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? C.red : 'none'} stroke={on ? C.red : C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    )},
    { id: 'food', label: 'Eats', icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? C.red : C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    )},
    { id: 'rides', label: 'My Rides', icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? C.red : C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    )},
    { id: 'profile', label: 'Profile', icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? C.red : C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: C.white, borderTop: `1px solid ${C.gray100}`, display: 'flex', padding: '8px 4px 20px', zIndex: 100, boxShadow: '0 -2px 16px rgba(0,0,0,0.06)' }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 0' }}>
            <div style={{ width: '42px', height: '32px', borderRadius: '10px', background: on ? C.redFaint : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
              {t.icon(on)}
            </div>
            <span style={{ fontSize: '10px', fontWeight: on ? '700' : '500', color: on ? C.red : C.gray400, fontFamily: FONTS.body }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
