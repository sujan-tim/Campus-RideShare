import { useState } from 'react';
import { Stars, Avatar, Tag } from '../ui';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';

const MOCK_TRIPS = [
  { id: 1, from: 'Busch Campus', to: 'College Avenue Campus', date: 'Mar 15, 2026', driver: 'Marcus Thompson', rating: 5, status: 'completed' },
  { id: 2, from: 'Livingston Campus', to: 'Busch Campus', date: 'Mar 12, 2026', driver: 'Priya Sharma', rating: 4, status: 'completed' },
  { id: 3, from: 'College Avenue Campus', to: 'George H. Cook Campus', date: 'Mar 8, 2026', driver: 'James Wilson', rating: 5, status: 'completed' },
  { id: 4, from: 'Douglass Campus', to: 'College Avenue Campus', date: 'Mar 2, 2026', driver: 'Sofia Garcia', rating: 5, status: 'completed' },
];

export function RidesScreen({ onBook }) {
  const [tab, setTab] = useState('history');

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      <div style={{ background: C.white, padding: '56px 20px 0', borderBottom: `1px solid ${C.gray100}` }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: '900', color: C.gray800, fontFamily: FONTS.body }}>My Rides</h1>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.gray100}` }}>
          {[['history', 'History'], ['upcoming', 'Upcoming']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? C.red : 'transparent'}`, marginBottom: '-1px', color: tab === id ? C.red : C.gray500, fontSize: '14px', fontWeight: tab === id ? '700' : '500', cursor: 'pointer', fontFamily: FONTS.body }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {tab === 'history' && (
          <>
            {MOCK_TRIPS.map(trip => (
              <div key={trip.id} style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', marginBottom: '10px', boxShadow: SHADOW.sm }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.success }}/>
                      <p style={{ margin: 0, fontSize: '13px', color: C.gray700 }}>{trip.from}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red }}/>
                      <p style={{ margin: 0, fontSize: '13px', color: C.gray700 }}>{trip.to}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>{trip.date} · {trip.driver}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '900', color: C.gray800 }}>$5</p>
                    <span style={{ padding: '3px 9px', background: '#E8F8F0', color: C.success, borderRadius: RADIUS.full, fontSize: '10px', fontWeight: '700' }}>Completed</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${C.gray100}` }}>
                  <Stars rating={trip.rating} size={12}/>
                  <button style={{ padding: '6px 14px', background: C.redFaint, border: `1px solid rgba(204,0,51,0.15)`, borderRadius: RADIUS.full, color: C.red, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>Book Again</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'upcoming' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '14px' }}>🗓️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: C.gray800, margin: '0 0 6px' }}>No Upcoming Rides</h3>
            <p style={{ color: C.gray400, fontSize: '14px', margin: '0 0 24px' }}>Schedule a ride to see it here</p>
            <button onClick={onBook} style={{ padding: '13px 28px', background: C.red, border: 'none', borderRadius: RADIUS.md, color: C.white, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body, boxShadow: SHADOW.red }}>Book a Ride</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfileScreen({ user, onUpdateRole }) {
  const [tab, setTab] = useState('info');
  const [settings, setSettings] = useState({
    pushNotifications: true,
    locationSharing: true,
    smsAlerts: true,
    darkMode: false,
  });
  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'RU';
  const settingItems = [
    ['pushNotifications', '🔔', 'Push Notifications'],
    ['locationSharing', '📍', 'Location Sharing'],
    ['smsAlerts', '📱', 'SMS Alerts'],
    ['darkMode', '🌙', 'Dark Mode'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {/* Profile header */}
      <div style={{ background: C.red, padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: C.white, fontFamily: FONTS.body, border: '2px solid rgba(255,255,255,0.3)' }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 3px', fontSize: '20px', fontWeight: '800', color: C.white, fontFamily: FONTS.body }}>{user?.fullName || 'Rutgers Student'}</h2>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>{user?.email || 'netid@rutgers.edu'}</p>
            <span style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700', color: C.white, border: '1px solid rgba(255,255,255,0.3)' }}>✅ Verified Student</span>
          </div>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.md, padding: '3px' }}>
          {['rider', 'driver'].map(role => (
            <button key={role} onClick={() => onUpdateRole(role)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', fontFamily: FONTS.body, cursor: 'pointer', background: user?.role === role ? C.white : 'transparent', color: user?.role === role ? C.red : 'rgba(255,255,255,0.7)', transition: 'all 0.15s', boxShadow: user?.role === role ? SHADOW.sm : 'none' }}>
              {role === 'rider' ? '🙋 Rider' : '🚗 Driver'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '10px', padding: '16px', background: C.white, borderBottom: `1px solid ${C.gray100}` }}>
        {[['15', 'Total Rides', C.gray800], ['4.9', 'Rating ⭐', '#8A6500'], ['$75', 'Spent', C.red]].map(([val, label, color]) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', background: C.gray50, borderRadius: RADIUS.lg }}>
            <p style={{ margin: '0 0 3px', fontSize: '20px', fontWeight: '900', color, fontFamily: FONTS.body }}>{val}</p>
            <p style={{ margin: 0, fontSize: '10px', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.gray100}`, display: 'flex' }}>
        {[['info', 'Info'], ['payment', 'Payment'], ['settings', 'Settings']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? C.red : 'transparent'}`, color: tab === id ? C.red : C.gray500, fontSize: '13px', fontWeight: tab === id ? '700' : '500', cursor: 'pointer', fontFamily: FONTS.body }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {tab === 'info' && (
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, overflow: 'hidden', boxShadow: SHADOW.sm }}>
            {[
              ['👤', 'Full Name', user?.fullName || '—'],
              ['📧', 'Email', user?.email || '—'],
              ['📱', 'Phone', user?.phone || '—'],
              ['🎓', 'School', user?.school || '—'],
              ['🏠', 'Address', user?.address || '—'],
              ['🆔', 'NetID', user?.netid ? `${user.netid}@rutgers.edu` : '—'],
            ].map(([icon, label, val], i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
                <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '10px', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: '14px', color: C.gray700, wordBreak: 'break-word' }}>{val}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gray300} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        )}

        {tab === 'payment' && (
          <div>
            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', marginBottom: '12px', boxShadow: SHADOW.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '52px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #1a3a5c, #0d2035)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💳</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: '700', color: C.gray800, fontFamily: FONTS.mono, fontSize: '13px' }}>•••• •••• •••• 4242</p>
                  <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>Expires 08/27</p>
                </div>
                <span style={{ padding: '3px 9px', background: '#E8F8F0', color: C.success, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>Default</span>
              </div>
            </div>
            <button style={{ width: '100%', padding: '13px', background: C.white, border: `1.5px dashed ${C.gray300}`, borderRadius: RADIUS.md, color: C.gray500, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: FONTS.body }}>+ Add Payment Method</button>
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, overflow: 'hidden', boxShadow: SHADOW.sm }}>
            {settingItems.map(([key, icon, label], i, arr) => {
              const on = settings[key];
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <p style={{ margin: 0, flex: 1, fontSize: '14px', color: C.gray700 }}>{label}</p>
                  <div onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))} style={{ width: '44px', height: '26px', borderRadius: '13px', background: on ? C.red : C.gray200, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: C.white, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
