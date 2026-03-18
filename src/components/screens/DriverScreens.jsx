import { useEffect, useMemo, useState } from 'react';
import { Avatar, BackBtn, Btn, Sheet, Tag } from '../ui';
import { LiveMap } from '../map/LiveMap';
import { CAMPUSES } from '../../constants/data';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { fetchShortestStreetRoute, getNavigationSnapshot, getRoutePointAtProgress, resolveCampusSpot, splitRouteGeometry } from '../../utils/navigation';
import { formatStamp, makeId } from '../../utils/persistence';

const TRIP_META = {
  heading_pickup: { label: 'Heading to Pickup', icon: '🧭', color: '#F0B429' },
  at_pickup: { label: 'At Pickup', icon: '📍', color: '#0A84FF' },
  on_trip: { label: 'Trip In Progress', icon: '🚗', color: C.success },
  complete: { label: 'Trip Complete', icon: '✅', color: C.gray400 },
};

function resolveCampus(campusId) {
  return CAMPUSES.find(campus => campus.id === campusId) || null;
}

function parseFare(fare) {
  const value = Number(String(fare || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : 5;
}

function NotificationSheet({ notifications, onClose }) {
  return (
    <Sheet title="Driver Updates" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 10px' }}>
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>📬</div>
            <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>No updates yet</p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500, lineHeight: '1.6' }}>Trip alerts, support actions, and request changes will appear here.</p>
          </div>
        ) : notifications.map(note => (
          <div key={note.id} style={{ padding: '14px 16px', background: note.read ? C.white : C.redFaint, border: `1px solid ${note.read ? C.gray100 : 'rgba(204,0,51,0.12)'}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{note.title}</p>
              <span style={{ fontSize: '10px', color: C.gray400 }}>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500, lineHeight: '1.5' }}>{note.body}</p>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function RequestDetailsSheet({ request, busy, canAccept, onClose, onAccept, onDecline }) {
  return (
    <Sheet title="Ride Request" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: C.gray50, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '14px' }}>
          <Avatar initials={request.initials} size={58}/>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: C.gray800 }}>{request.rider}</h3>
            <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>{request.pickupSpot} → {request.dropoffSpot}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tag color={C.success}>{request.eta}</Tag>
              <Tag>{request.fare} payout</Tag>
              <Tag color="#8A6500">{request.distance}</Tag>
            </div>
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, overflow: 'hidden', marginBottom: '16px' }}>
          {[
            ['Pickup', request.pickupSpot],
            ['Drop-off', request.dropoffSpot],
            ['Phone', request.riderPhone || 'Not provided'],
            ['Rider note', request.note || 'No special instructions'],
          ].map(([label, value], index, items) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 16px', borderBottom: index < items.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <span style={{ fontSize: '12px', color: C.gray500 }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: C.gray800, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        {!canAccept && (
          <div style={{ padding: '12px 14px', background: '#FFF8E7', border: '1px solid rgba(240,180,41,0.24)', borderRadius: RADIUS.lg, marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#8A6500', lineHeight: '1.5' }}>Finish the current trip or go online before accepting another request.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Btn onClick={() => onDecline(request.id)} variant="secondary" fullWidth={false} style={{ flex: 1 }} disabled={busy}>Decline</Btn>
          <Btn onClick={() => onAccept(request.id)} fullWidth={false} style={{ flex: 1.4 }} disabled={!canAccept || busy}>Accept Request</Btn>
        </div>
      </div>
    </Sheet>
  );
}

function ChatSheet({ messages, draft, onDraftChange, onSend, onClose }) {
  return (
    <Sheet title="Rider Chat" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {messages.map(message => (
            <div key={message.id} style={{ alignSelf: message.author === 'driver' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <div style={{ padding: '11px 14px', borderRadius: '16px', background: message.author === 'driver' ? C.red : C.gray50, color: message.author === 'driver' ? C.white : C.gray700, boxShadow: SHADOW.sm }}>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{message.text}</p>
              </div>
              <p style={{ margin: '4px 2px 0', fontSize: '10px', color: C.gray400, textAlign: message.author === 'driver' ? 'right' : 'left' }}>{message.time}</p>
            </div>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={e => onDraftChange(e.target.value)}
          placeholder="Send a quick note to the rider..."
          rows={3}
          style={{ width: '100%', padding: '12px 14px', background: C.white, border: `1.5px solid ${C.gray200}`, borderRadius: RADIUS.lg, color: C.gray800, fontSize: '14px', resize: 'none', outline: 'none', fontFamily: FONTS.body, lineHeight: '1.5', boxSizing: 'border-box', marginBottom: '12px' }}
        />
        <Btn onClick={onSend} disabled={!draft.trim()} size="lg">Send Message</Btn>
      </div>
    </Sheet>
  );
}

function IssueSheet({ trip, onClose, onCreateSupportTicket }) {
  return (
    <Sheet title="Trip Support" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', background: C.redFaint, borderRadius: RADIUS.xl, border: '1px solid rgba(204,0,51,0.12)', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: C.red }}>Need help on this trip?</p>
          <p style={{ margin: 0, fontSize: '12px', color: C.gray600, lineHeight: '1.6' }}>Log an issue with pickup, safety, or the rider. The ticket is tied to this trip for follow-up.</p>
        </div>
        {[
          ['Rider no-show', 'Passenger is not at the pickup point.'],
          ['Safety concern', 'Unsafe behavior or urgent safety issue.'],
          ['Route problem', 'Pickup or drop-off details need review.'],
        ].map(([title, description]) => (
          <button
            key={title}
            onClick={() => {
              onCreateSupportTicket?.({
                title,
                description,
                severity: title === 'Safety concern' ? 'high' : 'standard',
                rideId: trip.id,
              });
              onClose();
            }}
            style={{ width: '100%', padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, textAlign: 'left', cursor: 'pointer', boxShadow: SHADOW.sm, marginBottom: '10px' }}
          >
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{title}</p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500, lineHeight: '1.5' }}>{description}</p>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function DriverHomeScreen({
  user,
  driverProfile,
  driverRequests,
  driverActiveTrip,
  driverTripHistory,
  notifications,
  onMarkNotificationsRead,
  onAcceptRequest,
  onDeclineRequest,
  onUpdateDriverProfile,
  onCreateSupportTicket,
  onOpenTrips,
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const pendingRequests = useMemo(() => driverRequests.filter(request => request.status === 'pending'), [driverRequests]);
  const unreadCount = notifications.filter(note => !note.read).length;
  const firstName = user?.fullName?.split(' ')[0] || 'Driver';

  useEffect(() => {
    if (showNotifications) onMarkNotificationsRead?.();
  }, [onMarkNotificationsRead, showNotifications]);

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {showNotifications && <NotificationSheet notifications={notifications} onClose={() => setShowNotifications(false)}/>}
      {selectedRequest && (
        <RequestDetailsSheet
          request={selectedRequest}
          busy={false}
          canAccept={driverProfile.available && !driverActiveTrip}
          onClose={() => setSelectedRequest(null)}
          onAccept={requestId => {
            onAcceptRequest?.(requestId);
            setSelectedRequest(null);
          }}
          onDecline={requestId => {
            onDeclineRequest?.(requestId);
            setSelectedRequest(null);
          }}
        />
      )}

      <div style={{ background: C.white, padding: '56px 20px 20px', borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '13px', color: C.gray400 }}>Driver dashboard</p>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>{firstName}, let’s drive</h1>
          </div>
          <button onClick={() => setShowNotifications(true)} style={{ width: '42px', height: '42px', borderRadius: '12px', border: `1px solid ${C.gray200}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW.sm, position: 'relative' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-3px', right: '-3px', minWidth: '18px', height: '18px', borderRadius: '9px', background: C.red, color: C.white, fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ padding: '18px', borderRadius: RADIUS.xl, background: 'linear-gradient(135deg, #141414 0%, #262626 100%)', color: C.white, boxShadow: SHADOW.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Vehicle and shift</p>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{driverProfile.vehicle}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.68)' }}>{driverProfile.plate}</p>
            </div>
            <button onClick={() => onUpdateDriverProfile?.(prev => ({ ...prev, available: !prev.available }))} style={{ padding: '9px 14px', borderRadius: RADIUS.full, border: 'none', background: driverProfile.available ? C.success : 'rgba(255,255,255,0.18)', color: C.white, fontSize: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: FONTS.body }}>
              {driverProfile.available ? 'Online' : 'Go Online'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              [`$${driverProfile.earnings}`, 'Earnings'],
              [String(driverProfile.completedTrips), 'Trips'],
              [`${driverProfile.acceptanceRate}%`, 'Acceptance'],
            ].map(([value, label]) => (
              <div key={label} style={{ padding: '11px 12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{ marginBottom: '16px' }}>
          <LiveMap
            height={260}
            showDrivers={false}
            showCampuses
            showMyLocation
            interactive
            fromCampus={driverActiveTrip ? resolveCampus(driverActiveTrip.fromCampusId) : null}
            toCampus={driverActiveTrip ? resolveCampus(driverActiveTrip.toCampusId) : null}
          />
          <p style={{ fontSize: '11px', color: C.gray400, textAlign: 'center', marginTop: '6px' }}>
            {driverActiveTrip ? 'Active route loaded for your current trip.' : 'Campus map is live. Go online to accept new rider requests.'}
          </p>
        </div>

        {driverActiveTrip && (
          <div style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Active trip</p>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>{driverActiveTrip.rider}</h3>
              </div>
              <Tag color={C.success}>{driverActiveTrip.fare} payout</Tag>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: C.gray600, lineHeight: '1.6' }}>{driverActiveTrip.pickupSpot} → {driverActiveTrip.dropoffSpot}</p>
            <Btn onClick={onOpenTrips} size="lg">Manage Active Trip</Btn>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          <button onClick={() => onCreateSupportTicket?.({ title: 'Driver support request', description: 'Driver requested help from the dashboard.' })} style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>🛟</div>
            <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>Support</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.gray500 }}>Open a driver support ticket</p>
          </button>
          <div style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, boxShadow: SHADOW.sm }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>📈</div>
            <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>Recent trips</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.gray500 }}>{driverTripHistory.length} completed rides saved locally</p>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: C.gray800 }}>Request Queue</h3>
            <span style={{ padding: '4px 10px', background: driverProfile.available ? '#E8F8F0' : C.gray50, color: driverProfile.available ? C.success : C.gray500, borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>
              {driverProfile.available ? `${pendingRequests.length} pending` : 'Offline'}
            </span>
          </div>

          {!driverProfile.available && (
            <div style={{ padding: '14px 16px', background: '#FFF8E7', border: '1px solid rgba(240,180,41,0.24)', borderRadius: RADIUS.xl, marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#8A6500', lineHeight: '1.6' }}>Go online to start accepting requests. The queue stays visible so you can review demand before your shift.</p>
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div style={{ padding: '30px 18px', textAlign: 'center', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm }}>
              <div style={{ fontSize: '42px', marginBottom: '8px' }}>🧘</div>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>No pending requests</p>
              <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>Accept a trip and new rider requests will show up here as they arrive.</p>
            </div>
          ) : pendingRequests.map(request => (
            <button key={request.id} onClick={() => setSelectedRequest(request)} style={{ width: '100%', padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, cursor: 'pointer', textAlign: 'left', boxShadow: SHADOW.sm, marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Avatar initials={request.initials} size={46}/>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{request.rider}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>{request.pickupSpot} → {request.dropoffSpot}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: '900', color: C.red }}>{request.fare}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>{request.eta}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: C.gray400 }}>{request.note}</span>
                <span style={{ fontSize: '12px', color: C.red, fontWeight: '700' }}>View →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DriverTripsScreen({ driverActiveTrip, driverTripHistory }) {
  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      <div style={{ background: C.white, padding: '56px 20px 18px', borderBottom: `1px solid ${C.gray100}` }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '900', color: C.gray800 }}>Driver Trips</h1>
        <p style={{ margin: 0, fontSize: '13px', color: C.gray500 }}>Current run status and your completed trip ledger.</p>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {driverActiveTrip ? (
          <div style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '14px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.gray500 }}>Current rider</p>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: C.gray800 }}>{driverActiveTrip.rider}</h3>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: C.gray600 }}>{driverActiveTrip.pickupSpot} → {driverActiveTrip.dropoffSpot}</p>
            <Tag color={C.success}>{driverActiveTrip.fare} live payout</Tag>
          </div>
        ) : (
          <div style={{ padding: '30px 18px', textAlign: 'center', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '14px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🅿️</div>
            <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>No active trip</p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>Accept a request from the driver dashboard to start your next campus run.</p>
          </div>
        )}

        {driverTripHistory.length === 0 ? (
          <div style={{ padding: '30px 18px', textAlign: 'center', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧾</div>
            <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>No completed driver trips yet</p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>Once you finish runs, payouts and rider details will show here.</p>
          </div>
        ) : driverTripHistory.map(trip => (
          <div key={trip.id} style={{ padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{trip.rider}</p>
                <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>{trip.pickupSpot} → {trip.dropoffSpot}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 3px', fontSize: '18px', fontWeight: '900', color: C.success }}>${trip.payout.toFixed(2)}</p>
                <p style={{ margin: 0, fontSize: '11px', color: C.gray400 }}>{new Date(trip.completedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', borderTop: `1px solid ${C.gray100}` }}>
              <span style={{ fontSize: '11px', color: C.gray400 }}>Trip time {Math.round((trip.elapsed || 0) / 60)} min</span>
              <span style={{ fontSize: '11px', color: C.gray400 }}>{trip.distance || 'Campus route'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DriverEarningsScreen({ driverProfile, driverTripHistory, driverRequests }) {
  const todayKey = new Date().toDateString();
  const todayTrips = useMemo(() => driverTripHistory.filter(trip => new Date(trip.completedAt).toDateString() === todayKey), [driverTripHistory, todayKey]);
  const todayEarnings = todayTrips.reduce((sum, trip) => sum + trip.payout, 0);
  const totalEarnings = driverTripHistory.reduce((sum, trip) => sum + trip.payout, 0);
  const avgPayout = driverTripHistory.length ? totalEarnings / driverTripHistory.length : 0;
  const acceptedCount = driverRequests.filter(request => request.status === 'accepted').length;

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      <div style={{ background: C.white, padding: '56px 20px 18px', borderBottom: `1px solid ${C.gray100}` }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '900', color: C.gray800 }}>Earnings</h1>
        <p style={{ margin: 0, fontSize: '13px', color: C.gray500 }}>Local driver payout summary for this demo account.</p>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{ padding: '18px', borderRadius: RADIUS.xl, background: 'linear-gradient(135deg, #CC0033 0%, #7A1024 100%)', color: C.white, boxShadow: SHADOW.red, marginBottom: '14px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Total demo earnings</p>
          <h2 style={{ margin: '0 0 16px', fontSize: '32px', fontWeight: '900' }}>${(totalEarnings || driverProfile.earnings).toFixed(2)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.08)' }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Today</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>${todayEarnings.toFixed(2)}</p>
            </div>
            <div style={{ padding: '12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.08)' }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Average</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>${avgPayout.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          {[
            [String(todayTrips.length), 'Trips today'],
            [String(acceptedCount), 'Accepted'],
            [`${driverProfile.acceptanceRate}%`, 'Acceptance'],
          ].map(([value, label]) => (
            <div key={label} style={{ padding: '14px 12px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.lg, boxShadow: SHADOW.sm }}>
              <p style={{ margin: '0 0 3px', fontSize: '18px', fontWeight: '900', color: C.gray800 }}>{value}</p>
              <p style={{ margin: 0, fontSize: '10px', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, overflow: 'hidden' }}>
          {driverTripHistory.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>No payout data yet</p>
              <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>Complete a driver trip to start building your earnings ledger.</p>
            </div>
          ) : driverTripHistory.slice(0, 6).map((trip, index) => (
            <div key={trip.id} style={{ padding: '14px 16px', borderBottom: index < Math.min(driverTripHistory.length, 6) - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{trip.rider}</p>
                <span style={{ fontSize: '13px', fontWeight: '800', color: C.success }}>${trip.payout.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: C.gray500 }}>{trip.pickupSpot} → {trip.dropoffSpot}</p>
                <span style={{ fontSize: '11px', color: C.gray400 }}>{new Date(trip.completedAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActiveDriverTripScreen({ trip, onComplete, onCreateSupportTicket, onNotify, onBack }) {
  const [status, setStatus] = useState(trip.liveStatus || 'heading_pickup');
  const [elapsed, setElapsed] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);
  const fromCampus = resolveCampus(trip.fromCampusId);
  const toCampus = resolveCampus(trip.toCampusId);
  const pickupPoint = useMemo(() => (
    trip.pickupLocation || resolveCampusSpot({
      campus: fromCampus,
      label: trip.pickupSpot || trip.from,
    })
  ), [fromCampus, trip.from, trip.pickupLocation, trip.pickupSpot]);
  const dropoffPoint = useMemo(() => (
    trip.dropoffLocation || resolveCampusSpot({
      campus: toCampus,
      label: trip.dropoffSpot || trip.to,
    })
  ), [toCampus, trip.dropoffLocation, trip.dropoffSpot, trip.to]);
  const driverStart = useMemo(() => (
    trip.driverStartLocation || {
      lat: (pickupPoint?.lat || fromCampus?.lat || 40.5008) + 0.012,
      lng: (pickupPoint?.lng || fromCampus?.lng || -74.4474) - 0.01,
      label: 'Driver current location',
    }
  ), [fromCampus?.lat, fromCampus?.lng, pickupPoint?.lat, pickupPoint?.lng, trip.driverStartLocation]);
  const [pickupRoute, setPickupRoute] = useState(null);
  const [tripRoute, setTripRoute] = useState(null);
  const [routeMode, setRouteMode] = useState('loading');
  const [routeProgress, setRouteProgress] = useState(0);
  const [driverLoc, setDriverLoc] = useState(() => ({ lat: driverStart.lat, lng: driverStart.lng }));
  const [showChat, setShowChat] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    { id: 'msg1', author: 'rider', text: `Hi! I’m at ${trip.pickupSpot}.`, time: 'Just now' },
  ]);
  const meta = TRIP_META[status];
  const currentRoute = status === 'on_trip' ? tripRoute : pickupRoute;
  const currentProgress = status === 'at_pickup' ? 1 : routeProgress;
  const currentSplit = splitRouteGeometry(currentRoute, currentProgress);
  const navigation = getNavigationSnapshot(currentRoute, currentProgress);
  const routeStats = status === 'on_trip' ? tripRoute : pickupRoute;

  useEffect(() => {
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadRoutes() {
      if (!pickupPoint || !dropoffPoint) return;
      setRouteMode('loading');
      const [pickupResult, tripResult] = await Promise.all([
        fetchShortestStreetRoute({ origin: driverStart, destination: pickupPoint, signal: controller.signal }),
        fetchShortestStreetRoute({ origin: pickupPoint, destination: dropoffPoint, signal: controller.signal }),
      ]);

      if (cancelled) return;

      setPickupRoute(pickupResult);
      setTripRoute(tripResult);
      setDriverLoc({ lat: driverStart.lat, lng: driverStart.lng });
      setRouteMode(pickupResult?.source === 'osrm' && tripResult?.source === 'osrm' ? 'street' : 'fallback');
    }

    loadRoutes();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [driverStart, dropoffPoint, pickupPoint]);

  useEffect(() => {
    if (status !== 'heading_pickup' || !pickupRoute?.geometry?.length) return undefined;
    const steps = Math.max(18, Math.min(48, Math.round((pickupRoute.distanceMeters || 1400) / 70)));
    let frame = 0;
    setRouteProgress(0);
    setDriverLoc(getRoutePointAtProgress(pickupRoute, 0) || { lat: driverStart.lat, lng: driverStart.lng });

    const timer = setInterval(() => {
      frame += 1;
      const nextProgress = Math.min(1, frame / steps);
      const nextPoint = getRoutePointAtProgress(pickupRoute, nextProgress);
      setRouteProgress(nextProgress);
      if (nextPoint) setDriverLoc(nextPoint);
      if (nextProgress >= 1) clearInterval(timer);
    }, 900);

    return () => clearInterval(timer);
  }, [driverStart.lat, driverStart.lng, pickupRoute, status]);

  useEffect(() => {
    if (status !== 'on_trip' || !tripRoute?.geometry?.length) return undefined;
    const steps = Math.max(20, Math.min(58, Math.round((tripRoute.distanceMeters || 1500) / 80)));
    let frame = 0;
    setRouteProgress(0);
    setDriverLoc(getRoutePointAtProgress(tripRoute, 0) || pickupPoint || { lat: driverStart.lat, lng: driverStart.lng });

    const timer = setInterval(() => {
      frame += 1;
      const nextProgress = Math.min(1, frame / steps);
      const nextPoint = getRoutePointAtProgress(tripRoute, nextProgress);
      setRouteProgress(nextProgress);
      if (nextPoint) setDriverLoc(nextPoint);
      if (nextProgress >= 1) clearInterval(timer);
    }, 900);

    return () => clearInterval(timer);
  }, [driverStart.lat, driverStart.lng, pickupPoint, status, tripRoute]);

  const handleCall = () => {
    onNotify?.('Calling rider', `Attempting to call ${trip.rider}.`, 'info');
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${trip.riderPhone || ''}`;
    }
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { id: makeId('msg'), author: 'driver', text: draft.trim(), time: 'Now' }]);
    setDraft('');

    setTimeout(() => {
      setMessages(prev => [...prev, { id: makeId('msg'), author: 'rider', text: 'Thanks, I see you.', time: 'Now' }]);
    }, 1200);
  };

  const nextAction = {
    heading_pickup: {
      label: 'Mark Arrived at Pickup',
      onClick: () => {
        setRouteProgress(1);
        if (pickupPoint) setDriverLoc({ lat: pickupPoint.lat, lng: pickupPoint.lng });
        setStatus('at_pickup');
        onNotify?.('Pickup reached', `You arrived for ${trip.rider}.`, 'success');
      },
    },
    at_pickup: {
      label: 'Start Trip',
      onClick: () => {
        setRouteProgress(0);
        if (pickupPoint) setDriverLoc({ lat: pickupPoint.lat, lng: pickupPoint.lng });
        setStatus('on_trip');
        onNotify?.('Trip started', `${trip.rider} is on board.`, 'success');
      },
    },
    on_trip: {
      label: 'Complete Trip',
      onClick: () => {
        setStatus('complete');
        setTimeout(() => onComplete?.({
          ...trip,
          completedAt: formatStamp(),
          payout: parseFare(trip.fare),
          elapsed,
          liveStatus: 'complete',
          pickupLocation: pickupPoint,
          dropoffLocation: dropoffPoint,
          routedDistance: tripRoute?.distanceLabel || routeStats?.distanceLabel || trip.distance,
          routedDuration: tripRoute?.durationLabel || routeStats?.durationLabel || trip.eta,
        }), 400);
      },
    },
  }[status];

  return (
    <div style={{ minHeight: '100vh', background: C.white, paddingBottom: '40px' }}>
      {showChat && (
        <ChatSheet
          messages={messages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}
      {showIssues && (
        <IssueSheet
          trip={trip}
          onClose={() => setShowIssues(false)}
          onCreateSupportTicket={onCreateSupportTicket}
        />
      )}

      <div style={{ position: 'relative' }}>
        <LiveMap
          fromCampus={fromCampus}
          toCampus={toCampus}
          routePath={currentSplit.remaining}
          traveledRoutePath={currentSplit.traveled}
          activeDriverLocation={driverLoc}
          activeRiderLocation={status === 'heading_pickup' || status === 'at_pickup' ? pickupPoint : driverLoc}
          showCampuses
          showDrivers={false}
          showMyLocation={false}
          interactive={false}
          height={mapExpanded ? '62vh' : 280}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BackBtn onClick={onBack}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setMapExpanded(prev => !prev)}
              style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, border: `1px solid ${C.gray200}`, fontSize: '11px', fontWeight: '700', color: C.gray700, cursor: 'pointer', fontFamily: FONTS.body }}
            >
              {mapExpanded ? 'Minimize Map' : 'Maximize Map'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, border: `1px solid ${meta.color}30` }}>
              <span style={{ fontSize: '13px' }}>{meta.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: meta.color }}>{meta.label}</span>
            </div>
            <div style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, fontSize: '12px', fontWeight: '700', color: C.gray700, fontFamily: FONTS.mono }}>
              {`${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '12px', boxShadow: SHADOW.sm }}>
          <Avatar initials={trip.initials} size={56}/>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: '800', color: C.gray800 }}>{trip.rider}</p>
            <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>{trip.pickupSpot} → {trip.dropoffSpot}</p>
            <Tag color={C.success}>{trip.fare} payout</Tag>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCall} style={{ width: '38px', height: '38px', borderRadius: '11px', background: C.gray50, border: `1px solid ${C.gray100}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '15px' }}>📞</span>
            </button>
            <button onClick={() => setShowChat(true)} style={{ width: '38px', height: '38px', borderRadius: '11px', background: C.gray50, border: `1px solid ${C.gray100}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '15px' }}>💬</span>
            </button>
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: '12px', boxShadow: SHADOW.sm }}>
          {[
            ['Pickup', trip.pickupSpot],
            ['Drop-off', trip.dropoffSpot],
            ['Street route', routeStats ? `${routeStats.distanceLabel} · ${routeStats.durationLabel}` : 'Loading route…'],
            ['Rider note', trip.note || 'No special instructions'],
          ].map(([label, value], index, items) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 16px', borderBottom: index < items.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <span style={{ fontSize: '12px', color: C.gray500 }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: C.gray800, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <button onClick={() => setShowIssues(true)} style={{ padding: '12px', background: C.redFaint, border: `1px solid rgba(204,0,51,0.15)`, borderRadius: RADIUS.md, color: C.red, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>🛟 Trip Support</button>
          <button onClick={() => onNotify?.('Keep communication clear', 'Call or message the rider if pickup details change.', 'info')} style={{ padding: '12px', background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.md, color: C.gray600, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>📋 Driver Tips</button>
        </div>

        <div style={{ padding: '14px 16px', background: C.gray50, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '16px' }}>
          <p style={{ margin: '0 0 5px', fontSize: '12px', color: C.gray500 }}>Live trip guidance</p>
          <p style={{ margin: 0, fontSize: '13px', color: C.gray700, lineHeight: '1.6' }}>
            {status === 'heading_pickup' && `Navigate to ${trip.pickupSpot} on the ${routeMode === 'street' ? 'shortest street route' : 'fallback route'}. Next: ${navigation.instruction}.`}
            {status === 'at_pickup' && `You are at pickup. Confirm the rider and begin the trip when everyone is ready.`}
            {status === 'on_trip' && `Head to ${trip.dropoffSpot}. Next: ${navigation.instruction}.`}
            {status === 'complete' && 'Finalizing payout and saving the trip to your driver history.'}
          </p>
          {status !== 'complete' && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.gray500 }}>
              Remaining {navigation.remainingDistance} · {navigation.remainingDuration}
            </p>
          )}
        </div>

        <Btn onClick={nextAction?.onClick} disabled={!nextAction} size="lg">
          {nextAction?.label || 'Trip complete'}
        </Btn>
      </div>
    </div>
  );
}
