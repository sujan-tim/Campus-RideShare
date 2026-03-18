import { useMemo, useState } from 'react';
import { Btn, Sheet, Stars } from '../ui';
import SecureCheckoutSheet from '../payments/SecureCheckoutSheet';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';

function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
      <div style={{ fontSize: '52px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: '800', color: C.gray800, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: C.gray400, fontSize: '14px', margin: '0 0 24px', lineHeight: '1.6' }}>{description}</p>
      {action && <Btn onClick={action} size="lg" style={{ maxWidth: '240px', margin: '0 auto' }}>{actionLabel}</Btn>}
    </div>
  );
}

function SupportSheet({ tickets, onClose, onResolveTicket, onCreateTicket }) {
  return (
    <Sheet title="Support Center" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', background: C.redFaint, border: '1px solid rgba(204,0,51,0.12)', borderRadius: RADIUS.xl, marginBottom: '14px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: C.red }}>Need help with a ride or payment?</p>
          <p style={{ margin: 0, fontSize: '12px', color: C.gray600, lineHeight: '1.6' }}>Track open tickets here or create a new support request for safety, payments, or account access.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <Btn onClick={() => onCreateTicket({ title: 'Payment issue', description: 'Passenger reported a payment or receipt issue.' })} fullWidth={false} style={{ flex: 1 }}>Payment</Btn>
          <Btn onClick={() => onCreateTicket({ title: 'Trip issue', description: 'Passenger reported a ride or route issue.' })} variant="secondary" fullWidth={false} style={{ flex: 1 }}>Trip</Btn>
        </div>
        {tickets.length === 0 ? (
          <EmptyState icon="🛟" title="No support tickets" description="Any ride, safety, or payment issue you log will appear here." />
        ) : tickets.map(ticket => (
          <div key={ticket.id} style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', marginBottom: '10px', boxShadow: SHADOW.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{ticket.title}</p>
              <span style={{ padding: '3px 9px', background: ticket.status === 'resolved' ? '#E8F8F0' : '#FFF8E7', color: ticket.status === 'resolved' ? C.success : '#8A6500', borderRadius: RADIUS.full, fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                {ticket.status}
              </span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: C.gray500, lineHeight: '1.6' }}>{ticket.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: C.gray400 }}>{new Date(ticket.createdAt).toLocaleString()}</span>
              {ticket.status !== 'resolved' && (
                <button onClick={() => onResolveTicket(ticket.id)} style={{ background: 'none', border: 'none', color: C.red, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

export function RidesScreen({ onBook, activeRide, rideHistory }) {
  const [tab, setTab] = useState(activeRide ? 'upcoming' : 'history');

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      <div style={{ background: C.white, padding: '56px 20px 0', borderBottom: `1px solid ${C.gray100}` }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: '900', color: C.gray800, fontFamily: FONTS.body }}>My Rides</h1>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.gray100}` }}>
          {[['history', 'History'], ['upcoming', 'Current']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? C.red : 'transparent'}`, marginBottom: '-1px', color: tab === id ? C.red : C.gray500, fontSize: '14px', fontWeight: tab === id ? '700' : '500', cursor: 'pointer', fontFamily: FONTS.body }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {tab === 'history' && (
          <>
            {rideHistory.length === 0 ? (
              <EmptyState icon="🧾" title="No completed rides yet" description="Once you finish a ride, receipts and reviews will appear here." action={onBook} actionLabel="Book a Ride" />
            ) : rideHistory.map(ride => (
              <div key={ride.id} style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', marginBottom: '10px', boxShadow: SHADOW.sm }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.success }}/>
                      <p style={{ margin: 0, fontSize: '13px', color: C.gray700 }}>{ride.pickupLabel || ride.from}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red }}/>
                      <p style={{ margin: 0, fontSize: '13px', color: C.gray700 }}>{ride.dropoffLabel || ride.to}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>
                      {ride.completedAt ? new Date(ride.completedAt).toLocaleString() : 'Completed'} · {ride.name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '900', color: C.gray800 }}>$5</p>
                    <span style={{ padding: '3px 9px', background: '#E8F8F0', color: C.success, borderRadius: RADIUS.full, fontSize: '10px', fontWeight: '700' }}>Completed</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${C.gray100}` }}>
                  <Stars rating={ride.review?.rating || 5} size={12}/>
                  <button onClick={onBook} style={{ padding: '6px 14px', background: C.redFaint, border: `1px solid rgba(204,0,51,0.15)`, borderRadius: RADIUS.full, color: C.red, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>
                    Book Again
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'upcoming' && (
          activeRide ? (
            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '18px', boxShadow: SHADOW.sm }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Current Trip</p>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>{activeRide.name} is on the way</h3>
                </div>
                <span style={{ padding: '4px 10px', background: '#FFF8E7', color: '#8A6500', borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>Live</span>
              </div>
              {[
                ['Pickup', activeRide.pickupLabel || activeRide.from],
                ['Drop-off', activeRide.dropoffLabel || activeRide.to],
                ['ETA', activeRide.eta || '5 min'],
                ['Trip code', activeRide.rideCode || 'TRIP-01'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', fontSize: '12px', color: C.gray500 }}>
                  <span>{label}</span>
                  <span style={{ color: C.gray800, fontWeight: '700', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🗓️" title="No active ride" description="When a driver accepts your request, live trip details will show up here." action={onBook} actionLabel="Book a Ride" />
          )
        )}
      </div>
    </div>
  );
}

export function ProfileScreen({
  user,
  rideHistory,
  driverTripHistory = [],
  notifications,
  paymentMethod,
  savedPlaces,
  supportTickets,
  driverProfile,
  driverRequests,
  onCreateSupportTicket,
  onResolveSupportTicket,
  onUpdateDriverProfile,
  onUpdateDriverRequest,
  onPaymentMethodSave,
  onUpdateRole,
  onLogout,
}) {
  const [tab, setTab] = useState('info');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showSupportSheet, setShowSupportSheet] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    locationSharing: true,
    smsAlerts: true,
    darkMode: false,
  });
  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'RU';
  const ratingAverage = useMemo(() => {
    const ratings = rideHistory.map(ride => ride.review?.rating).filter(Boolean);
    return ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : '—';
  }, [rideHistory]);
  const driverEarnings = useMemo(() => {
    if (driverTripHistory.length === 0) return driverProfile.earnings;
    return driverTripHistory.reduce((sum, trip) => sum + (trip.payout || 0), 0);
  }, [driverProfile.earnings, driverTripHistory]);
  const statCards = user?.role === 'driver'
    ? [
      [String(driverTripHistory.length), 'Driver Trips', C.gray800],
      [`$${driverEarnings.toFixed(0)}`, 'Earnings', C.success],
      [`${driverProfile.acceptanceRate}%`, 'Acceptance', C.red],
    ]
    : [
      [String(rideHistory.length), 'Total Rides', C.gray800],
      [ratingAverage, 'Rating', '#8A6500'],
      [String(savedPlaces.length), 'Saved Places', C.red],
    ];

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {showPaymentSheet && (
        <SecureCheckoutSheet
          title="Secure Payment Gateway"
          amount={0}
          description="Save a payment method"
          summaryItems={[
            ['Purpose', 'Store a masked payment method'],
            ['Access', 'Used for rides and campus eats'],
            ['Mode', 'Secure demo checkout'],
          ]}
          savedMethod={paymentMethod}
          onSaveMethod={onPaymentMethodSave}
          onClose={() => setShowPaymentSheet(false)}
          onSuccess={() => setShowPaymentSheet(false)}
          submitLabel={paymentMethod ? 'Update Payment Method' : 'Save Payment Method'}
        />
      )}
      {showSupportSheet && (
        <SupportSheet
          tickets={supportTickets}
          onClose={() => setShowSupportSheet(false)}
          onResolveTicket={onResolveSupportTicket}
          onCreateTicket={onCreateSupportTicket}
        />
      )}

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

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.md, padding: '3px' }}>
          {['rider', 'driver'].map(role => (
            <button key={role} onClick={() => onUpdateRole(role)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', fontFamily: FONTS.body, cursor: 'pointer', background: user?.role === role ? C.white : 'transparent', color: user?.role === role ? C.red : 'rgba(255,255,255,0.7)', transition: 'all 0.15s', boxShadow: user?.role === role ? SHADOW.sm : 'none' }}>
              {role === 'rider' ? '🙋 Rider' : '🚗 Driver'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '16px', background: C.white, borderBottom: `1px solid ${C.gray100}` }}>
        {statCards.map(([val, label, color]) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', background: C.gray50, borderRadius: RADIUS.lg }}>
            <p style={{ margin: '0 0 3px', fontSize: '20px', fontWeight: '900', color, fontFamily: FONTS.body }}>{val}</p>
            <p style={{ margin: 0, fontSize: '10px', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, borderBottom: `1px solid ${C.gray100}`, display: 'flex' }}>
        {[['info', 'Info'], ['payment', 'Payment'], ['settings', 'Settings']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? C.red : 'transparent'}`, color: tab === id ? C.red : C.gray500, fontSize: '13px', fontWeight: tab === id ? '700' : '500', cursor: 'pointer', fontFamily: FONTS.body }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {tab === 'info' && (
          <div>
            {user?.role === 'driver' && (
              <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', boxShadow: SHADOW.sm, marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.gray500 }}>Driver Operations</p>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>Availability and requests</h3>
                  </div>
                  <button onClick={() => onUpdateDriverProfile(prev => ({ ...prev, available: !prev.available }))} style={{ padding: '8px 12px', borderRadius: RADIUS.full, border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '11px', color: C.white, background: driverProfile.available ? C.success : C.gray400 }}>
                    {driverProfile.available ? 'Online' : 'Offline'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  {[
                    [`$${driverProfile.earnings}`, 'Earnings'],
                    [String(driverProfile.completedTrips), 'Trips'],
                    [`${driverProfile.acceptanceRate}%`, 'Accept'],
                  ].map(([value, label]) => (
                    <div key={label} style={{ padding: '10px 12px', borderRadius: RADIUS.lg, background: C.gray50 }}>
                      <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '900', color: C.gray800 }}>{value}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p>
                    </div>
                  ))}
                </div>
                {driverRequests.slice(0, 2).map(request => (
                  <div key={request.id} style={{ padding: '13px 14px', border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{request.rider}</p>
                      <span style={{ fontSize: '11px', color: C.gray400 }}>{request.eta}</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: C.gray500 }}>{request.from} → {request.to}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => onUpdateDriverRequest(request.id, 'accepted')} style={{ flex: 1, padding: '9px 12px', background: C.red, border: 'none', borderRadius: RADIUS.md, color: C.white, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>Accept</button>
                      <button onClick={() => onUpdateDriverRequest(request.id, 'declined')} style={{ flex: 1, padding: '9px 12px', background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.md, color: C.gray600, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, overflow: 'hidden', boxShadow: SHADOW.sm, marginBottom: '12px' }}>
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
                </div>
              ))}
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', boxShadow: SHADOW.sm }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: C.gray500 }}>Recent activity</p>
              {notifications.slice(0, 3).map(note => (
                <div key={note.id} style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: `1px solid ${C.gray100}` }}>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{note.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>{note.body}</p>
                </div>
              ))}
              {notifications.length === 0 && <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>No activity yet.</p>}
            </div>
          </div>
        )}

        {tab === 'payment' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #141414 0%, #262626 100%)', borderRadius: RADIUS.xl, padding: '18px', marginBottom: '12px', boxShadow: SHADOW.md, color: C.white }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '22px' }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>RUride Secure Gateway</p>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                    {paymentMethod ? `${paymentMethod.brand} ending in ${paymentMethod.last4}` : 'No payment method saved'}
                  </h3>
                </div>
                <span style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: RADIUS.md, fontSize: '11px', fontWeight: '700' }}>
                  🔐 Encrypted
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Cardholder</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{paymentMethod?.cardholder || (user?.fullName || 'Add a card')}</p>
                </div>
                <div style={{ padding: '12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Transactions</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{rideHistory.length} receipts</p>
                </div>
              </div>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, padding: '16px', marginBottom: '12px', boxShadow: SHADOW.sm }}>
              {[
                ['Gateway status', 'Ready for checkout UI'],
                ['Storage', paymentMethod ? `Masked ${paymentMethod.brand} token` : 'No saved token yet'],
                ['Coverage', 'Ride and food flows'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', marginBottom: '10px', borderBottom: `1px solid ${C.gray100}` }}>
                  <span style={{ fontSize: '12px', color: C.gray500 }}>{label}</span>
                  <span style={{ fontSize: '12px', color: C.gray800, fontWeight: '700', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
              <p style={{ margin: 0, fontSize: '12px', color: C.gray500, lineHeight: '1.6' }}>
                This is a secure client-side gateway demo. To charge real cards, connect a backend processor such as Stripe or Adyen.
              </p>
            </div>
            <Btn onClick={() => setShowPaymentSheet(true)} size="lg">
              {paymentMethod ? 'Update Payment Method' : 'Add Payment Method'}
            </Btn>
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, overflow: 'hidden', boxShadow: SHADOW.sm, marginBottom: '12px' }}>
              {[
                ['pushNotifications', '🔔', 'Push Notifications'],
                ['locationSharing', '📍', 'Location Sharing'],
                ['smsAlerts', '📱', 'SMS Alerts'],
                ['darkMode', '🌙', 'Dark Mode'],
              ].map(([key, icon, label], i, arr) => {
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

            <button onClick={() => setShowSupportSheet(true)} style={{ width: '100%', padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm, marginBottom: '10px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>Support Center</p>
              <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>{supportTickets.filter(ticket => ticket.status !== 'resolved').length} open tickets</p>
            </button>

            <button onClick={onLogout} style={{ width: '100%', padding: '14px 16px', background: C.white, border: `1px solid rgba(204,0,51,0.12)`, borderRadius: RADIUS.xl, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: C.red }}>Sign Out</p>
              <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>End the local session on this device</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
