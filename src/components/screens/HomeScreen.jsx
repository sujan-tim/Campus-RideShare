import { useState, useCallback } from 'react';
import { Btn, Stars, Tag, Avatar, Sheet, BackBtn } from '../ui';
import { LiveMap, FallbackMap } from '../map/LiveMap';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { CAMPUSES, MOCK_DRIVERS, FARE } from '../../constants/data';

// ─── CAMPUS PILL ─────────────────────────────────────────────────────────────
function CampusPill({ campus, selected, role, onClick }) {
  const isActive = selected;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', border: `1.5px solid ${isActive ? C.red : C.gray200}`,
      borderRadius: RADIUS.full, cursor: 'pointer', fontFamily: FONTS.body,
      background: isActive ? C.redFaint : C.white,
      transition: 'all 0.15s', whiteSpace: 'nowrap', position: 'relative',
    }}>
      <span style={{ fontSize: '14px' }}>{campus.icon}</span>
      <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? C.red : C.gray600 }}>{campus.name}</span>
      {isActive && (
        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: role === 'from' ? C.success : C.red, color: C.white, fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '2px' }}>
          {role === 'from' ? 'A' : 'B'}
        </span>
      )}
    </button>
  );
}

// ─── DRIVER CARD ─────────────────────────────────────────────────────────────
function DriverCard({ driver, onBook, compact }) {
  if (compact) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, marginBottom: '8px', boxShadow: SHADOW.sm }}>
      <Avatar initials={driver.initials} size={44}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: C.gray800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{driver.name}</p>
          {driver.verified && <span style={{ fontSize: '12px' }}>✅</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <Stars rating={driver.rating} size={11}/>
          <span style={{ fontSize: '11px', color: C.gray400 }}>·</span>
          <span style={{ fontSize: '11px', color: C.gray500 }}>{driver.seats} seats</span>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.gray400 }}>{driver.car}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: '0 0 1px', fontSize: '16px', fontWeight: '900', color: C.red }}>$5</p>
        <p style={{ margin: '0 0 6px', fontSize: '11px', color: C.gray400 }}>ETA {driver.eta}</p>
        <Btn onClick={() => onBook(driver)} size="sm" fullWidth={false}>Book</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '10px', boxShadow: SHADOW.sm, cursor: 'pointer' }}
      onClick={() => onBook(driver)}>
      <Avatar initials={driver.initials} size={52}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: C.gray800 }}>{driver.name}</p>
          {driver.verified && <span>✅</span>}
        </div>
        <Stars rating={driver.rating} size={12}/>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray400 }}>{driver.car} · {driver.plate}</p>
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          <Tag>{driver.seats} seat{driver.seats !== 1 ? 's' : ''} available</Tag>
          <Tag>{driver.trips} trips</Tag>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '900', color: C.red }}>$5</p>
        <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>ETA {driver.eta}</p>
        <div style={{ marginTop: '8px', padding: '6px 14px', background: C.red, borderRadius: RADIUS.md, fontSize: '12px', fontWeight: '700', color: C.white, textAlign: 'center' }}>Book Ride</div>
      </div>
    </div>
  );
}

// ─── BOOK RIDE SHEET ─────────────────────────────────────────────────────────
function BookRideSheet({ onClose, onConfirm }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [phase, setPhase] = useState('select'); // select | searching | found

  const search = () => {
    if (!from || !to) return;
    setPhase('searching');
    setTimeout(() => setPhase('found'), 2200);
  };

  return (
    <Sheet title="Book a Ride" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        {phase === 'select' && (
          <>
            {/* Map preview */}
            <div style={{ marginBottom: '20px' }}>
              <FallbackMap fromCampus={from} toCampus={to} showDrivers={false} height={160}/>
            </div>

            {/* From */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                📍 Pickup — From
              </label>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '6px' }}>
                {CAMPUSES.map(c => (
                  <CampusPill key={c.id} campus={c} selected={from?.id === c.id} role="from" onClick={() => setFrom(from?.id === c.id ? null : c)}/>
                ))}
              </div>
            </div>

            {/* To */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                🏁 Drop-off — To
              </label>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '6px' }}>
                {CAMPUSES.filter(c => c.id !== from?.id).map(c => (
                  <CampusPill key={c.id} campus={c} selected={to?.id === c.id} role="to" onClick={() => setTo(to?.id === c.id ? null : c)}/>
                ))}
              </div>
            </div>

            {/* Fare preview */}
            {from && to && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.lg, marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', color: C.gray400 }}>Estimated Fare</p>
                  <p style={{ margin: 0, fontSize: '13px', color: C.gray600, fontWeight: '500' }}>{from.name} → {to.name}</p>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: C.red }}>$5.00</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn onClick={onClose} variant="secondary" fullWidth={false} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={search} disabled={!from || !to} fullWidth={false} style={{ flex: 2 }}>Find Drivers →</Btn>
            </div>
          </>
        )}

        {phase === 'searching' && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: C.redFaint, border: `2px solid rgba(204,0,51,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 18px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: C.gray800, margin: '0 0 6px', fontFamily: FONTS.body }}>Finding Drivers Nearby</h3>
            <p style={{ fontSize: '13px', color: C.gray400, margin: '0 0 24px' }}>Matching verified Rutgers students near you</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, animation: `pulseDot 1.2s ease infinite ${i * 0.25}s` }}/>)}
            </div>
          </div>
        )}

        {phase === 'found' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>Drivers Found!</h3>
                <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>{from?.name} → {to?.name}</p>
              </div>
              <span style={{ padding: '4px 10px', background: '#E8F8F0', color: C.success, border: `1px solid ${C.success}30`, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>● {MOCK_DRIVERS.length} Online</span>
            </div>
            {MOCK_DRIVERS.map(d => (
              <DriverCard key={d.id} driver={d} compact onBook={driver => onConfirm({ ...driver, from: from?.name, to: to?.name, fromCampus: from, toCampus: to })}/>
            ))}
          </>
        )}
      </div>
    </Sheet>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen({ user, onStartRide }) {
  const [showBook, setShowBook] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.fullName?.split(' ')[0] || 'Scarlet Knight';

  const handleDriverClick = useCallback(driver => setSelectedDriver(driver), []);
  const handleLocationUpdate = useCallback(loc => setUserLocation(loc), []);

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {showBook && (
        <BookRideSheet
          onClose={() => setShowBook(false)}
          onConfirm={ride => { setShowBook(false); onStartRide(ride); }}
        />
      )}

      {/* Driver detail sheet */}
      {selectedDriver && (
        <Sheet title="Driver Details" onClose={() => setSelectedDriver(null)}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: C.gray50, borderRadius: RADIUS.xl, marginBottom: '20px' }}>
              <Avatar initials={selectedDriver.initials} size={64}/>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>{selectedDriver.name}</h3>
                  {selectedDriver.verified && <span>✅</span>}
                </div>
                <Stars rating={selectedDriver.rating} size={13}/>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray400 }}>{selectedDriver.car} · {selectedDriver.plate}</p>
              </div>
            </div>
            {[['Trips Completed', selectedDriver.trips], ['Seats Available', selectedDriver.seats], ['ETA', selectedDriver.eta], ['Fare', '$5.00 flat']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.gray100}` }}>
                <span style={{ fontSize: '13px', color: C.gray500 }}>{l}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{v}</span>
              </div>
            ))}
            <Btn onClick={() => { setSelectedDriver(null); onStartRide({ ...selectedDriver, from: 'Your Location', to: 'Select Destination', fromCampus: null, toCampus: null }); }} size="lg" style={{ marginTop: '16px' }}>Book {selectedDriver.name} →</Btn>
          </div>
        </Sheet>
      )}

      {/* Header */}
      <div style={{ background: C.white, padding: '56px 20px 20px', borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '13px', color: C.gray400 }}>{greeting},</p>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body, lineHeight: 1.2 }}>{firstName} 👋</h1>
          </div>
          <span style={{ padding: '5px 12px', background: '#E8F8F0', color: C.success, border: `1px solid ${C.success}25`, borderRadius: RADIUS.full, fontSize: '12px', fontWeight: '700' }}>✅ Verified</span>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* LIVE MAP with real GPS + driver pins */}
        <div style={{ marginBottom: '16px' }}>
          <LiveMap
            height={280}
            showDrivers={true}
            showCampuses={true}
            showMyLocation={true}
            interactive={true}
            onDriverClick={handleDriverClick}
            onLocationUpdate={handleLocationUpdate}
          />
          <p style={{ fontSize: '11px', color: C.gray400, textAlign: 'center', marginTop: '6px' }}>
            📍 Your location • 🔴 Drivers nearby • Tap a driver pin to view details
          </p>
        </div>

        {/* Book Ride CTA */}
        <button onClick={() => setShowBook(true)} style={{
          width: '100%', padding: '0', background: C.red, border: 'none', borderRadius: RADIUS.xl,
          cursor: 'pointer', boxShadow: SHADOW.red, marginBottom: '16px', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '15px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>🚗</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '18px', fontWeight: '800', color: C.white }}>Book a Ride</p>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>Flat $5 · All 5 Rutgers campuses</p>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </button>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setShowBook(true)} style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>🚙</div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>Offer a Ride</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>Earn $5 per ride</p>
          </button>
          <button style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>📍</div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>Schedule Ride</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>Plan ahead</p>
          </button>
        </div>

        {/* Campus destinations */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.gray800 }}>Campus Destinations</h3>
            <span style={{ fontSize: '12px', color: C.red, fontWeight: '600' }}>$5 flat fare</span>
          </div>
          <div style={{ overflowX: 'auto', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
              {CAMPUSES.map(c => (
                <button key={c.id} onClick={() => setShowBook(true)} style={{ width: '140px', padding: '14px 12px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'center', boxShadow: SHADOW.sm, flexShrink: 0 }}>
                  <div style={{ fontSize: '24px', marginBottom: '7px' }}>{c.icon}</div>
                  <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: '700', color: C.gray800, lineHeight: '1.3' }}>{c.name}</p>
                  <p style={{ margin: '0 0 8px', fontSize: '10px', color: C.gray400 }}>{c.desc}</p>
                  <span style={{ background: C.redFaint, color: C.red, borderRadius: RADIUS.full, padding: '2px 8px', fontSize: '10px', fontWeight: '800' }}>$5</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nearby drivers */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.gray800 }}>Drivers Nearby</h3>
            <span style={{ padding: '3px 10px', background: '#E8F8F0', color: C.success, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>● {MOCK_DRIVERS.length} Online</span>
          </div>
          {MOCK_DRIVERS.slice(0, 3).map(d => (
            <DriverCard key={d.id} driver={d} compact onBook={driver => onStartRide({ ...driver, from: 'Your Location', to: 'Select Destination', fromCampus: null, toCampus: null })}/>
          ))}
          <button onClick={() => setShowBook(true)} style={{ width: '100%', padding: '12px', background: C.white, border: `1.5px solid ${C.gray200}`, borderRadius: RADIUS.lg, cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: C.gray600, fontFamily: FONTS.body }}>
            View All {MOCK_DRIVERS.length} Drivers →
          </button>
        </div>
      </div>
    </div>
  );
}
