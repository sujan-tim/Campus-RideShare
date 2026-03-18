import { useCallback, useEffect, useMemo, useState } from 'react';
import { Btn, Check, Select, Stars, Tag, Avatar, Sheet } from '../ui';
import { LiveMap, FallbackMap } from '../map/LiveMap';
import SecureCheckoutSheet from '../payments/SecureCheckoutSheet';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { CAMPUSES, MOCK_DRIVERS } from '../../constants/data';
import { formatStamp, makeId } from '../../utils/persistence';

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

function DriverCard({ driver, onBook, compact }) {
  if (compact) {
    return (
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
          <Btn onClick={() => onBook(driver)} size="sm" fullWidth={false}>View</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '10px', boxShadow: SHADOW.sm, cursor: 'pointer' }} onClick={() => onBook(driver)}>
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
        <div style={{ marginTop: '8px', padding: '6px 14px', background: C.red, borderRadius: RADIUS.md, fontSize: '12px', fontWeight: '700', color: C.white, textAlign: 'center' }}>Choose Driver</div>
      </div>
    </div>
  );
}

function NotificationSheet({ notifications, onClose }) {
  return (
    <Sheet title="Notifications" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px' }}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>🔔</div>
            <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>No notifications yet</p>
            <p style={{ margin: 0, fontSize: '13px', color: C.gray500 }}>Ride updates, support messages, and payment receipts will appear here.</p>
          </div>
        ) : notifications.map(note => (
          <div key={note.id} style={{ padding: '14px 16px', background: note.read ? C.white : C.redFaint, border: `1px solid ${note.read ? C.gray100 : 'rgba(204,0,51,0.12)'}`, borderRadius: RADIUS.xl, marginBottom: '10px', boxShadow: SHADOW.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{note.title}</p>
              <span style={{ fontSize: '10px', color: C.gray400, flexShrink: 0 }}>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500, lineHeight: '1.5' }}>{note.body}</p>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function RideRequestSheet({ ride, onClose, onTrack }) {
  return (
    <Sheet title="Ride Request" onClose={ride.requestStatus === 'matching' ? onClose : undefined}>
      <div style={{ padding: '20px' }}>
        {ride.requestStatus === 'matching' && (
          <div style={{ textAlign: 'center', padding: '38px 10px 20px' }}>
            <div style={{ width: '82px', height: '82px', borderRadius: '26px', background: C.redFaint, border: '2px solid rgba(204,0,51,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 18px' }}>🔎</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '800', color: C.gray800 }}>Matching your ride</h3>
            <p style={{ margin: '0 0 22px', fontSize: '13px', color: C.gray500, lineHeight: '1.6' }}>Looking for the best verified Rutgers driver for {ride.pickupLabel} to {ride.dropoffLabel}.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, animation: `pulseDot 1.2s ease infinite ${i * 0.25}s` }}/>)}
            </div>
          </div>
        )}

        {ride.requestStatus === 'driver_assigned' && (
          <>
            <div style={{ padding: '16px', background: C.gray50, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                <Avatar initials={ride.initials} size={56}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: C.gray800 }}>{ride.name}</p>
                    {ride.verified && <span>✅</span>}
                  </div>
                  <Stars rating={ride.rating} size={12}/>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray500 }}>{ride.car} · {ride.plate}</p>
                </div>
                <span style={{ padding: '5px 10px', background: '#E8F8F0', color: C.success, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>Confirmed</span>
              </div>
              {[
                ['Pickup', ride.pickupLabel],
                ['Drop-off', ride.dropoffLabel],
                ['ETA', ride.eta || '5 min'],
                ['Trip code', ride.rideCode],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '9px', fontSize: '12px', color: C.gray500 }}>
                  <span>{label}</span>
                  <span style={{ color: C.gray800, fontWeight: '700', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
            <Btn onClick={onTrack} size="lg">Track Driver →</Btn>
          </>
        )}
      </div>
    </Sheet>
  );
}

function buildLocationOptions(campus, savedPlaces, userLocation, kind) {
  if (!campus) return [];

  const campusOptions = [
    { value: `${campus.id}:main`, label: `${campus.name} Main Gate` },
    ...campus.landmarks.map(landmark => ({
      value: `${campus.id}:${landmark}`,
      label: landmark,
    })),
  ];

  const savedOptions = savedPlaces.map(place => ({
    value: `saved:${place.label}`,
    label: `${place.label} · ${place.value}`,
  }));

  if (kind === 'pickup' && userLocation) {
    return [
      { value: 'current_location', label: 'Current GPS Location' },
      ...savedOptions,
      ...campusOptions,
    ];
  }

  return [...savedOptions, ...campusOptions];
}

function resolveLocationLabel(value, options, fallback) {
  return options.find(option => option.value === value)?.label || fallback;
}

function BookRideSheet({ onClose, onConfirm, preferredDriver, savedPlaces, userLocation, onAddSavedPlace }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');
  const [saveFavorite, setSaveFavorite] = useState(false);
  const [phase, setPhase] = useState('select');

  const pickupOptions = useMemo(() => buildLocationOptions(from, savedPlaces, userLocation, 'pickup'), [from, savedPlaces, userLocation]);
  const dropoffOptions = useMemo(() => buildLocationOptions(to, savedPlaces, userLocation, 'dropoff'), [to, savedPlaces, userLocation]);
  const matchingDrivers = useMemo(() => {
    if (!preferredDriver) return MOCK_DRIVERS;
    return [preferredDriver, ...MOCK_DRIVERS.filter(driver => driver.id !== preferredDriver.id)];
  }, [preferredDriver]);

  useEffect(() => {
    setPickupPoint('');
  }, [from]);

  useEffect(() => {
    setDropoffPoint('');
  }, [to]);

  const search = () => {
    if (!from || !to || !pickupPoint || !dropoffPoint) return;
    setPhase('searching');
    setTimeout(() => setPhase('found'), 1800);
  };

  const handleDriverConfirm = (driver) => {
    const pickupLabel = resolveLocationLabel(pickupPoint, pickupOptions, from?.name || 'Pickup');
    const dropoffLabel = resolveLocationLabel(dropoffPoint, dropoffOptions, to?.name || 'Destination');

    if (saveFavorite) {
      onAddSavedPlace({
        label: to?.name || 'Campus Destination',
        value: dropoffLabel,
        type: 'destination',
      });
    }

    onConfirm({
      ...driver,
      id: makeId('ride'),
      requestedAt: formatStamp(),
      from: from?.name,
      to: to?.name,
      fromCampus: from,
      toCampus: to,
      pickupLabel,
      dropoffLabel,
      rideCode: makeId('trip').slice(-6).toUpperCase(),
      requestStatus: 'matching',
    });
  };

  return (
    <Sheet title="Book a Ride" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        {phase === 'select' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <FallbackMap fromCampus={from} toCampus={to} showDrivers={false} height={160}/>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Pickup Campus
              </label>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '6px' }}>
                {CAMPUSES.map(campus => (
                  <CampusPill key={campus.id} campus={campus} selected={from?.id === campus.id} role="from" onClick={() => setFrom(from?.id === campus.id ? null : campus)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <Select
                label="Pickup Spot"
                value={pickupPoint}
                onChange={setPickupPoint}
                options={pickupOptions}
                placeholder={from ? 'Choose exact pickup point' : 'Select a pickup campus first'}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Destination Campus
              </label>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '6px' }}>
                {CAMPUSES.filter(campus => campus.id !== from?.id).map(campus => (
                  <CampusPill key={campus.id} campus={campus} selected={to?.id === campus.id} role="to" onClick={() => setTo(to?.id === campus.id ? null : campus)}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <Select
                label="Drop-off Spot"
                value={dropoffPoint}
                onChange={setDropoffPoint}
                options={dropoffOptions}
                placeholder={to ? 'Choose exact destination' : 'Select a destination campus first'}
              />
            </div>

            {(from && to && pickupPoint && dropoffPoint) && (
              <div style={{ padding: '14px 16px', background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.lg, marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: C.gray400 }}>Ride Summary</p>
                    <p style={{ margin: 0, fontSize: '13px', color: C.gray700, fontWeight: '600' }}>{resolveLocationLabel(pickupPoint, pickupOptions, from.name)} → {resolveLocationLabel(dropoffPoint, dropoffOptions, to.name)}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: C.red }}>$5.00</p>
                </div>
                <Check
                  checked={saveFavorite}
                  onChange={() => setSaveFavorite(prev => !prev)}
                  label="Save destination for next time"
                  sublabel="Keeps your most-used campus drop-off handy"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn onClick={onClose} variant="secondary" fullWidth={false} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={search} disabled={!from || !to || !pickupPoint || !dropoffPoint} fullWidth={false} style={{ flex: 2 }}>Find Drivers →</Btn>
            </div>
          </>
        )}

        {phase === 'searching' && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: C.redFaint, border: `2px solid rgba(204,0,51,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 18px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: C.gray800, margin: '0 0 6px', fontFamily: FONTS.body }}>Finding Drivers Nearby</h3>
            <p style={{ fontSize: '13px', color: C.gray400, margin: '0 0 24px' }}>Matching verified Rutgers students near your exact pickup point</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, animation: `pulseDot 1.2s ease infinite ${i * 0.25}s` }}/>)}
            </div>
          </div>
        )}

        {phase === 'found' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>Drivers Found</h3>
                <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>{from?.name} → {to?.name}</p>
              </div>
              <span style={{ padding: '4px 10px', background: '#E8F8F0', color: C.success, border: `1px solid ${C.success}30`, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>● {matchingDrivers.length} Online</span>
            </div>
            {matchingDrivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} compact onBook={handleDriverConfirm}/>
            ))}
          </>
        )}
      </div>
    </Sheet>
  );
}

export default function HomeScreen({
  user,
  paymentMethod,
  notifications,
  savedPlaces,
  onAddSavedPlace,
  onCreateSupportTicket,
  onMarkNotificationsRead,
  onPaymentMethodSave,
  onStartRide,
}) {
  const [showBook, setShowBook] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [preferredDriver, setPreferredDriver] = useState(null);
  const [pendingRide, setPendingRide] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.fullName?.split(' ')[0] || 'Scarlet Knight';
  const unreadCount = notifications.filter(note => !note.read).length;
  const locationLabel = userLocation ? 'GPS active' : 'Waiting for GPS';

  const handleDriverClick = useCallback(driver => setSelectedDriver(driver), []);
  const handleLocationUpdate = useCallback(loc => setUserLocation(loc), []);

  useEffect(() => {
    if (showNotifications) onMarkNotificationsRead?.();
  }, [onMarkNotificationsRead, showNotifications]);

  useEffect(() => {
    if (!rideRequest || rideRequest.requestStatus !== 'matching') return undefined;
    const timer = setTimeout(() => {
      setRideRequest(prev => prev ? { ...prev, requestStatus: 'driver_assigned', matchedAt: formatStamp() } : prev);
    }, 2000);
    return () => clearTimeout(timer);
  }, [rideRequest]);

  const startCheckout = useCallback((ride) => {
    setPendingRide(ride);
    setShowBook(false);
    setSelectedDriver(null);
    setPreferredDriver(null);
  }, []);

  const trackDriver = () => {
    if (!rideRequest) return;
    onStartRide({ ...rideRequest, status: 'en_route' });
    setRideRequest(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {showNotifications && <NotificationSheet notifications={notifications} onClose={() => setShowNotifications(false)}/>}

      {rideRequest && (
        <RideRequestSheet
          ride={rideRequest}
          onClose={() => setRideRequest(null)}
          onTrack={trackDriver}
        />
      )}

      {pendingRide && (
        <SecureCheckoutSheet
          title="Secure Ride Checkout"
          amount={5}
          description={`${pendingRide.pickupLabel || pendingRide.from || 'Your Location'} to ${pendingRide.dropoffLabel || pendingRide.to || 'Campus destination'}`}
          summaryItems={[
            ['Driver', pendingRide.name],
            ['ETA', pendingRide.eta || '5 min'],
            ['Vehicle', `${pendingRide.car} · ${pendingRide.plate}`],
            ['Trip code', pendingRide.rideCode],
          ]}
          savedMethod={paymentMethod}
          onSaveMethod={onPaymentMethodSave}
          onClose={() => setPendingRide(null)}
          onSuccess={(payment) => {
            setPendingRide(null);
            setRideRequest({
              ...pendingRide,
              paymentReference: payment.reference,
              paymentMethod: payment.method,
            });
          }}
          submitLabel="Authorize Ride"
        />
      )}

      {showBook && (
        <BookRideSheet
          preferredDriver={preferredDriver}
          savedPlaces={savedPlaces}
          userLocation={userLocation}
          onAddSavedPlace={onAddSavedPlace}
          onClose={() => {
            setShowBook(false);
            setPreferredDriver(null);
          }}
          onConfirm={ride => startCheckout(ride)}
        />
      )}

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
            {[['Trips Completed', selectedDriver.trips], ['Seats Available', selectedDriver.seats], ['ETA', selectedDriver.eta], ['Fare', '$5.00 flat']].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.gray100}` }}>
                <span style={{ fontSize: '13px', color: C.gray500 }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <Btn onClick={() => setSelectedDriver(null)} variant="secondary" fullWidth={false} style={{ flex: 1 }}>Close</Btn>
              <Btn
                onClick={() => {
                  setPreferredDriver(selectedDriver);
                  setSelectedDriver(null);
                  setShowBook(true);
                }}
                fullWidth={false}
                style={{ flex: 2 }}
              >
                Choose Route & Checkout →
              </Btn>
            </div>
          </div>
        </Sheet>
      )}

      <div style={{ background: C.white, padding: '56px 20px 20px', borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '13px', color: C.gray400 }}>{greeting},</p>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body, lineHeight: 1.2 }}>{firstName} 👋</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowNotifications(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', border: `1px solid ${C.gray200}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW.sm, position: 'relative' }}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-3px', right: '-3px', minWidth: '18px', height: '18px', borderRadius: '9px', background: C.red, color: C.white, fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <span style={{ padding: '5px 12px', background: '#E8F8F0', color: C.success, border: `1px solid ${C.success}25`, borderRadius: RADIUS.full, fontSize: '12px', fontWeight: '700' }}>✅ Verified</span>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: RADIUS.xl, background: 'linear-gradient(135deg, #151515 0%, #2a2a2a 100%)', color: C.white, boxShadow: SHADOW.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Ready to move across campus</p>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', fontFamily: FONTS.body }}>Pickup, match, pay, track</h2>
            </div>
            <div style={{ padding: '7px 10px', height: 'fit-content', borderRadius: RADIUS.md, background: 'rgba(255,255,255,0.08)', fontSize: '11px', fontWeight: '700' }}>
              {locationLabel}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              ['Online', String(MOCK_DRIVERS.length)],
              ['Fare', '$5'],
              ['Payment', paymentMethod ? `${paymentMethod.brand} •${paymentMethod.last4}` : 'Add card'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
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
            📍 Your location • 🔴 Drivers nearby • Tap a driver pin to inspect and book
          </p>
        </div>

        <button onClick={() => setShowBook(true)} style={{ width: '100%', padding: '0', background: C.red, border: 'none', borderRadius: RADIUS.xl, cursor: 'pointer', boxShadow: SHADOW.red, marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '15px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>🚗</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '18px', fontWeight: '800', color: C.white }}>Book a Ride</p>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>Choose exact pickup, destination, and driver before you pay</p>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setShowBook(true)} style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>🚙</div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>New Request</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>Campus-to-campus ride with exact stop selection</p>
          </button>
          <button
            onClick={() => onCreateSupportTicket({ title: 'General rider support', description: 'Rider requested support from the home dashboard.' })}
            style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm }}
          >
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>🛟</div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>Support</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>Create a support ticket if anything feels off</p>
          </button>
        </div>

        {savedPlaces.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.gray800 }}>Saved Places</h3>
              <span style={{ fontSize: '12px', color: C.gray500 }}>{savedPlaces.length} saved</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {savedPlaces.slice(0, 4).map(place => (
                <div key={`${place.label}-${place.value}`} style={{ padding: '14px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, boxShadow: SHADOW.sm }}>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{place.label}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: C.gray500, lineHeight: '1.5' }}>{place.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.gray800 }}>Campus Destinations</h3>
            <span style={{ fontSize: '12px', color: C.red, fontWeight: '600' }}>$5 flat fare</span>
          </div>
          <div style={{ overflowX: 'auto', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
              {CAMPUSES.map(campus => (
                <button key={campus.id} onClick={() => setShowBook(true)} style={{ width: '140px', padding: '14px 12px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'center', boxShadow: SHADOW.sm, flexShrink: 0 }}>
                  <div style={{ fontSize: '24px', marginBottom: '7px' }}>{campus.icon}</div>
                  <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: '700', color: C.gray800, lineHeight: '1.3' }}>{campus.name}</p>
                  <p style={{ margin: '0 0 8px', fontSize: '10px', color: C.gray400 }}>{campus.desc}</p>
                  <span style={{ background: C.redFaint, color: C.red, borderRadius: RADIUS.full, padding: '2px 8px', fontSize: '10px', fontWeight: '800' }}>$5</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.gray800 }}>Drivers Nearby</h3>
            <span style={{ padding: '3px 10px', background: '#E8F8F0', color: C.success, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>● {MOCK_DRIVERS.length} Online</span>
          </div>
          {MOCK_DRIVERS.slice(0, 3).map(driver => (
            <DriverCard key={driver.id} driver={driver} compact onBook={handleDriverClick}/>
          ))}
          <button onClick={() => setShowBook(true)} style={{ width: '100%', padding: '12px', background: C.white, border: `1.5px solid ${C.gray200}`, borderRadius: RADIUS.lg, cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: C.gray600, fontFamily: FONTS.body }}>
            View All {MOCK_DRIVERS.length} Drivers →
          </button>
        </div>
      </div>
    </div>
  );
}
