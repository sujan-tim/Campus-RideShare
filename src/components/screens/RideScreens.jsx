import { useEffect, useMemo, useState } from 'react';
import { Btn, Sheet, Stars, Avatar, BackBtn } from '../ui';
import { LiveMap } from '../map/LiveMap';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { fetchShortestStreetRoute, getNavigationSnapshot, getRoutePointAtProgress, resolveCampusSpot, splitRouteGeometry } from '../../utils/navigation';
import { formatStamp, makeId } from '../../utils/persistence';

const FLOW = ['en_route', 'arrived', 'in_progress', 'complete'];
const META = {
  en_route: { label: 'Driver En Route', color: '#F0B429', icon: '🚗' },
  arrived: { label: 'Driver Arrived', color: '#0A84FF', icon: '📍' },
  in_progress: { label: 'Ride In Progress', color: C.success, icon: '⚡' },
  complete: { label: 'Trip Complete', color: C.gray400, icon: '✅' },
};

const REVIEW_TAGS = ['Clean Car', 'Friendly', 'On Time', 'Safe Driver', 'Great Route', 'Professional', 'Smooth Ride'];

function ChatSheet({ messages, draft, onDraftChange, onSend, onClose }) {
  return (
    <Sheet title="Driver Chat" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {messages.map(message => (
            <div key={message.id} style={{ alignSelf: message.author === 'me' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <div style={{ padding: '11px 14px', borderRadius: '16px', background: message.author === 'me' ? C.red : C.gray50, color: message.author === 'me' ? C.white : C.gray700, boxShadow: SHADOW.sm }}>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{message.text}</p>
              </div>
              <p style={{ margin: '4px 2px 0', fontSize: '10px', color: C.gray400, textAlign: message.author === 'me' ? 'right' : 'left' }}>{message.time}</p>
            </div>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={e => onDraftChange(e.target.value)}
          placeholder="Send a quick update to your driver…"
          rows={3}
          style={{ width: '100%', padding: '12px 14px', background: C.white, border: `1.5px solid ${C.gray200}`, borderRadius: RADIUS.lg, color: C.gray800, fontSize: '14px', resize: 'none', outline: 'none', fontFamily: FONTS.body, lineHeight: '1.5', boxSizing: 'border-box', marginBottom: '12px' }}
        />
        <Btn onClick={onSend} disabled={!draft.trim()} size="lg">Send Message</Btn>
      </div>
    </Sheet>
  );
}

function SafetySheet({ ride, onClose, onCreateSupportTicket }) {
  return (
    <Sheet title="Safety Center" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', background: C.redFaint, borderRadius: RADIUS.xl, border: '1px solid rgba(204,0,51,0.12)', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: C.red }}>Need help right now?</p>
          <p style={{ margin: 0, fontSize: '12px', color: C.gray600, lineHeight: '1.6' }}>If you feel unsafe, call emergency services immediately. This in-app tool logs your issue and stores trip details for follow-up.</p>
        </div>
        {[
          ['Report unsafe driving', 'Flag this trip for manual follow-up after ride completion.'],
          ['Wrong pickup/drop-off', 'Create a support ticket tied to this trip.'],
          ['Lost item', 'Record an item issue for support review.'],
        ].map(([title, description]) => (
          <button
            key={title}
            onClick={() => {
              onCreateSupportTicket?.({
                title,
                description,
                severity: title === 'Report unsafe driving' ? 'high' : 'standard',
                rideId: ride.id,
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

export function ActiveRideScreen({ ride, onComplete, onCreateSupportTicket, onNotify, onBack }) {
  const [status, setStatus] = useState('en_route');
  const [elapsed, setElapsed] = useState(0);
  const from = ride.fromCampus;
  const to = ride.toCampus;
  const pickupPoint = useMemo(() => (
    ride.pickupLocation || resolveCampusSpot({
      campus: from,
      selectionValue: ride.pickupValue,
      label: ride.pickupLabel || ride.from,
      fallbackLocation: ride.riderLocation,
    })
  ), [from, ride.from, ride.pickupLabel, ride.pickupLocation, ride.pickupValue, ride.riderLocation]);
  const dropoffPoint = useMemo(() => (
    ride.dropoffLocation || resolveCampusSpot({
      campus: to,
      selectionValue: ride.dropoffValue,
      label: ride.dropoffLabel || ride.to,
    })
  ), [ride.dropoffLabel, ride.dropoffLocation, ride.dropoffValue, ride.to, to]);
  const driverStart = useMemo(() => (
    ride.driverStartLocation || { lat: ride.lat || 40.5050, lng: ride.lng || -74.4510, label: `${ride.name} current location` }
  ), [ride.driverStartLocation, ride.lat, ride.lng, ride.name]);
  const [pickupRoute, setPickupRoute] = useState(null);
  const [tripRoute, setTripRoute] = useState(null);
  const [routeMode, setRouteMode] = useState('loading');
  const [routeProgress, setRouteProgress] = useState(0);
  const [driverLoc, setDriverLoc] = useState({ lat: driverStart.lat, lng: driverStart.lng });
  const [showChat, setShowChat] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [messages, setMessages] = useState([
    { id: 'm1', author: 'driver', text: `Hey, this is ${ride.name}. I’m heading to ${ride.pickupLabel || ride.from}.`, time: 'Just now' },
  ]);
  const meta = META[status];
  const currentRoute = status === 'in_progress' ? tripRoute : pickupRoute;
  const currentProgress = status === 'arrived' ? 1 : routeProgress;
  const currentSplit = splitRouteGeometry(currentRoute, currentProgress);
  const navigation = getNavigationSnapshot(currentRoute, currentProgress);
  const routeStats = status === 'in_progress' ? tripRoute : pickupRoute;

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
    if (status !== 'arrived') return undefined;
    const timer = setTimeout(() => {
      setRouteProgress(0);
      setStatus('in_progress');
      if (pickupPoint) setDriverLoc({ lat: pickupPoint.lat, lng: pickupPoint.lng });
    }, 3500);
    return () => clearTimeout(timer);
  }, [pickupPoint, status]);

  useEffect(() => {
    if (status !== 'en_route' || !pickupRoute?.geometry?.length) return undefined;
    const steps = Math.max(18, Math.min(46, Math.round((pickupRoute.distanceMeters || 1200) / 70)));
    let frame = 0;
    setRouteProgress(0);
    setDriverLoc(getRoutePointAtProgress(pickupRoute, 0) || { lat: driverStart.lat, lng: driverStart.lng });

    const timer = setInterval(() => {
      frame += 1;
      const nextProgress = Math.min(1, frame / steps);
      const nextPoint = getRoutePointAtProgress(pickupRoute, nextProgress);
      setRouteProgress(nextProgress);
      if (nextPoint) setDriverLoc(nextPoint);

      if (nextProgress >= 1) {
        clearInterval(timer);
        setStatus('arrived');
        onNotify?.('Driver arrived', `${ride.name} reached ${ride.pickupLabel || ride.from}.`, 'success');
      }
    }, 900);

    return () => clearInterval(timer);
  }, [driverStart.lat, driverStart.lng, onNotify, pickupRoute, ride.from, ride.name, ride.pickupLabel, status]);

  useEffect(() => {
    if (status !== 'in_progress' || !tripRoute?.geometry?.length) return undefined;
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

  const fmt = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const handleCall = () => {
    onNotify?.('Calling driver', `Attempting to call ${ride.name}.`, 'info');
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${ride.phone || ''}`;
    }
  };

  const handleShare = async () => {
    const shareText = `Tracking my RUride with ${ride.name}. Pickup: ${ride.pickupLabel || ride.from}. Drop-off: ${ride.dropoffLabel || ride.to}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'RUride trip status', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      onNotify?.('Trip shared', 'Your trip details are ready to send to a friend.', 'success');
    } catch {
      onNotify?.('Trip share unavailable', 'Sharing was cancelled or unavailable on this device.', 'info');
    }
  };

  const sendMessage = () => {
    if (!chatDraft.trim()) return;
    const nextMessage = {
      id: makeId('chat'),
      author: 'me',
      text: chatDraft.trim(),
      time: 'Now',
    };
    setMessages(prev => [...prev, nextMessage]);
    setChatDraft('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: makeId('chat'),
        author: 'driver',
        text: 'Got it. I’ll keep you posted.',
        time: 'Now',
      }]);
    }, 1400);
  };

  const finishRide = () => {
    setStatus('complete');
    setTimeout(() => onComplete({
      ...ride,
      elapsed,
      finalStatus: 'completed',
      driverLocation: driverLoc,
      pickupLocation: pickupPoint,
      dropoffLocation: dropoffPoint,
      routedDistance: tripRoute?.distanceLabel || routeStats?.distanceLabel || ride.distance,
      routedDuration: tripRoute?.durationLabel || routeStats?.durationLabel || ride.eta,
    }), 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      {showChat && (
        <ChatSheet
          messages={messages}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onSend={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}
      {showSafety && (
        <SafetySheet
          ride={ride}
          onClose={() => setShowSafety(false)}
          onCreateSupportTicket={onCreateSupportTicket}
        />
      )}

      <div style={{ position: 'relative' }}>
        <LiveMap
          fromCampus={from}
          toCampus={to}
          routePath={currentSplit.remaining}
          traveledRoutePath={currentSplit.traveled}
          activeDriverLocation={status !== 'complete' ? driverLoc : null}
          activeRiderLocation={status === 'in_progress' ? driverLoc : pickupPoint}
          showCampuses
          showDrivers={false}
          showMyLocation
          interactive={false}
          height={280}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BackBtn onClick={onBack}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, border: `1px solid ${meta.color}30` }}>
              <span style={{ fontSize: '13px' }}>{meta.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: meta.color }}>{meta.label}</span>
            </div>
            <div style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: RADIUS.full, boxShadow: SHADOW.md, fontSize: '12px', fontWeight: '700', color: C.gray700, fontFamily: FONTS.mono }}>{fmt(elapsed)}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 20px 40px', overflowY: 'auto' }}>
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
            { dot: C.success, label: 'Pickup', val: ride.pickupLabel || from?.name || ride.from || 'Your Location' },
            { dot: C.red, label: 'Drop-off', val: ride.dropoffLabel || to?.name || ride.to || 'Destination' },
            { dot: null, label: 'Street route', val: routeStats ? `${routeStats.distanceLabel} · ${routeStats.durationLabel}` : 'Loading route…' },
            { dot: null, label: 'Ride code', val: ride.rideCode || 'TRIP-01' },
          ].map(({ dot, label, val }, index, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: index < arr.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {dot ? <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot }}/> : <div style={{ width: '8px' }}/>}
                <span style={{ fontSize: '13px', color: C.gray500 }}>{label}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: C.gray800, textAlign: 'right' }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <button onClick={() => setShowSafety(true)} style={{ padding: '12px', background: C.redFaint, border: `1px solid rgba(204,0,51,0.15)`, borderRadius: RADIUS.md, color: C.red, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>🆘 Safety Center</button>
          <button onClick={handleShare} style={{ padding: '12px', background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.md, color: C.gray600, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONTS.body }}>📤 Share Trip</button>
        </div>

        <div style={{ padding: '14px 16px', background: C.gray50, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '16px' }}>
          <p style={{ margin: '0 0 5px', fontSize: '12px', color: C.gray500 }}>Live ride updates</p>
          <p style={{ margin: 0, fontSize: '13px', color: C.gray700, lineHeight: '1.6' }}>
            {status === 'en_route' && `${ride.name} is following the ${routeMode === 'street' ? 'shortest street route' : 'fallback route'} to your pickup. Next: ${navigation.instruction}.`}
            {status === 'arrived' && `${ride.name} has arrived at ${ride.pickupLabel || ride.from}. Boarding will start automatically.`}
            {status === 'in_progress' && `You’re on the way to ${ride.dropoffLabel || ride.to}. Next: ${navigation.instruction}.`}
            {status === 'complete' && 'Finalizing your ride and preparing the review screen.'}
          </p>
          {status !== 'complete' && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.gray500 }}>
              Remaining {navigation.remainingDistance} · {navigation.remainingDuration}
            </p>
          )}
        </div>

        {status !== 'in_progress' && (
          <p style={{ textAlign: 'center', fontSize: '11px', color: C.gray400, marginBottom: '12px' }}>
            Status changes automatically while the trip is live.
          </p>
        )}

        <Btn
          onClick={finishRide}
          variant={status === 'in_progress' ? 'primary' : 'secondary'}
          disabled={status !== 'in_progress'}
          size="lg"
        >
          {status === 'in_progress' ? 'Complete Ride →' : 'Waiting for trip to start'}
        </Btn>
      </div>
    </div>
  );
}

export function ReviewScreen({ ride, onDone, onBack }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const labels = ['', 'Poor 😕', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent! 🤩'];

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <BackBtn onClick={onBack}/>
      </div>
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '56px', marginBottom: '10px' }}>⭐</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: C.gray800, margin: '0 0 4px', fontFamily: FONTS.body }}>How was your ride?</h2>
          <p style={{ fontSize: '13px', color: C.gray400, margin: 0 }}>with {ride.name}</p>
        </div>

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

        <div style={{ padding: '18px', background: C.gray50, borderRadius: RADIUS.xl, marginBottom: '14px', border: `1px solid ${C.gray100}` }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: C.gray400, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 12px' }}>What stood out?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {REVIEW_TAGS.map(tag => (
              <button key={tag} onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(entry => entry !== tag) : [...prev, tag])} style={{ padding: '7px 13px', borderRadius: RADIUS.full, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: FONTS.body, border: `1.5px solid ${tags.includes(tag) ? C.red : C.gray200}`, background: tags.includes(tag) ? C.redFaint : C.white, color: tags.includes(tag) ? C.red : C.gray500, transition: 'all 0.15s' }}>{tag}</button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment (optional)…"
          rows={3}
          style={{ width: '100%', padding: '12px 14px', background: C.white, border: `1.5px solid ${C.gray200}`, borderRadius: RADIUS.lg, color: C.gray800, fontSize: '14px', resize: 'none', outline: 'none', fontFamily: FONTS.body, lineHeight: '1.5', marginBottom: '16px', boxSizing: 'border-box' }}
        />

        <Btn
          onClick={() => onDone({
            rating,
            tags,
            comment,
            submittedAt: formatStamp(),
          })}
          disabled={rating === 0}
          size="lg"
        >
          {rating === 0 ? 'Select a rating to submit' : 'Submit Review →'}
        </Btn>
      </div>
    </div>
  );
}
