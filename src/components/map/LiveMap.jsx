import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { C, RADIUS, SHADOW } from '../../constants/theme';
import { CAMPUSES, MOCK_DRIVERS } from '../../constants/data';

const RU_CENTER = [40.5008, -74.4474];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

function makeDriverMarkerHtml(initials) {
  return `
    <div style="position:relative;width:48px;height:56px;display:flex;align-items:flex-start;justify-content:center;">
      <div style="width:40px;height:40px;border-radius:20px;background:#CC0033;color:#fff;display:flex;align-items:center;justify-content:center;font:700 14px system-ui;box-shadow:0 4px 12px rgba(0,0,0,0.22);">
        ${initials}
      </div>
      <div style="position:absolute;bottom:2px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #CC0033;"></div>
    </div>
  `;
}

function makeCampusMarkerHtml(icon, activeColor = '#FFFFFF', textColor = '#CC0033', outline = '#CC0033') {
  return `
    <div style="position:relative;width:44px;height:52px;display:flex;align-items:flex-start;justify-content:center;">
      <div style="width:34px;height:34px;border-radius:17px;background:${activeColor};border:2px solid ${outline};display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,0.16);color:${textColor};">
        ${icon}
      </div>
      <div style="position:absolute;bottom:2px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${outline};"></div>
    </div>
  `;
}

function createDivIcon(html, size, anchor, className) {
  return L.divIcon({
    html,
    className,
    iconSize: size,
    iconAnchor: anchor,
  });
}

function campusIcon(campus, { isFrom, isTo }) {
  if (isFrom) {
    return createDivIcon(
      makeCampusMarkerHtml(campus.icon, '#1A8A4A', '#FFFFFF', '#1A8A4A'),
      [44, 52],
      [22, 50],
      'ruride-campus-marker'
    );
  }
  if (isTo) {
    return createDivIcon(
      makeCampusMarkerHtml(campus.icon, '#CC0033', '#FFFFFF', '#CC0033'),
      [44, 52],
      [22, 50],
      'ruride-campus-marker'
    );
  }
  return createDivIcon(
    makeCampusMarkerHtml(campus.icon),
    [44, 52],
    [22, 50],
    'ruride-campus-marker'
  );
}

function driverIcon(initials) {
  return createDivIcon(makeDriverMarkerHtml(initials), [48, 56], [24, 54], 'ruride-driver-marker');
}

function userIcon() {
  return createDivIcon(
    `
      <div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:48px;height:48px;border-radius:24px;background:rgba(204,0,51,0.14);"></div>
        <div style="position:absolute;width:24px;height:24px;border-radius:12px;background:#CC0033;box-shadow:0 0 0 4px rgba(255,255,255,0.92), 0 4px 12px rgba(0,0,0,0.18);"></div>
        <div style="position:absolute;width:8px;height:8px;border-radius:4px;background:#FFFFFF;"></div>
      </div>
    `,
    [56, 56],
    [28, 28],
    'ruride-user-marker'
  );
}

function addCampusMarkers(map, markersRef, fromCampus, toCampus) {
  CAMPUSES.forEach(campus => {
    const isFrom = fromCampus?.id === campus.id;
    const isTo = toCampus?.id === campus.id;
    const marker = L.marker([campus.lat, campus.lng], {
      icon: campusIcon(campus, { isFrom, isTo }),
      zIndexOffset: isFrom || isTo ? 500 : 0,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:DM Sans,sans-serif;padding:4px 2px;min-width:150px">
        <b style="font-size:13px;color:#0A0A0A">${campus.name}</b>
        <p style="font-size:11px;color:#888;margin:3px 0 5px">${campus.desc}</p>
        <span style="background:#FFF0F3;color:#CC0033;border:1px solid rgba(204,0,51,0.2);border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;">$5 Flat Fare</span>
      </div>
    `);
    markersRef.current.push(marker);
  });
}

function addDriverMarkers(map, markersRef, onDriverClick) {
  MOCK_DRIVERS.forEach(driver => {
    const marker = L.marker([driver.lat, driver.lng], {
      icon: driverIcon(driver.initials),
      zIndexOffset: 300,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:DM Sans,sans-serif;padding:4px 2px;min-width:160px">
        <b style="font-size:13px;color:#0A0A0A">${driver.name}</b>
        <p style="font-size:11px;color:#888;margin:2px 0">${driver.car}</p>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
          <span style="font-size:11px;color:#555">⭐ ${driver.rating}</span>
          <span style="font-size:11px;color:#CC0033">ETA ${driver.eta}</span>
          <span style="font-size:11px;color:#555">${driver.seats} seats</span>
        </div>
      </div>
    `);

    marker.on('click', () => onDriverClick?.(driver));
    markersRef.current.push(marker);
  });
}

export function LiveMap({
  height = 300,
  showDrivers = true,
  showCampuses = true,
  fromCampus = null,
  toCampus = null,
  activeDriverLocation = null,
  onDriverClick = null,
  onLocationUpdate = null,
  showMyLocation = true,
  interactive = true,
}) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const watchRef = useRef(null);
  const centeredOnUserRef = useRef(false);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [locationStatus, setLocationStatus] = useState(showMyLocation ? 'requesting' : 'disabled');
  const [userPos, setUserPos] = useState(null);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  const clearRoute = useCallback(() => {
    routeRef.current?.remove();
    routeRef.current = null;
  }, []);

  const clearUserOverlays = useCallback(() => {
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    userCircleRef.current?.remove();
    userCircleRef.current = null;
  }, []);

  const stopWatchingLocation = useCallback(() => {
    if (watchRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  const cleanupMap = useCallback(() => {
    stopWatchingLocation();
    clearMarkers();
    clearRoute();
    clearUserOverlays();
    tileLayerRef.current?.remove();
    tileLayerRef.current = null;
    mapRef.current?.remove();
    mapRef.current = null;
  }, [clearMarkers, clearRoute, clearUserOverlays, stopWatchingLocation]);

  const initMap = useCallback(() => {
    if (!ref.current) return;

    cleanupMap();
    centeredOnUserRef.current = false;
    setStatus('loading');
    setLocationStatus(showMyLocation ? 'requesting' : 'disabled');

    try {
      const map = L.map(ref.current, {
        center: RU_CENTER,
        zoom: 14,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        tap: interactive,
      });
      mapRef.current = map;

      tileLayerRef.current = L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      if (showCampuses) addCampusMarkers(map, markersRef, fromCampus, toCampus);
      if (showDrivers) addDriverMarkers(map, markersRef, onDriverClick);

      if (activeDriverLocation) {
        const marker = L.marker([activeDriverLocation.lat, activeDriverLocation.lng], {
          icon: driverIcon('DR'),
          zIndexOffset: 600,
        }).addTo(map);
        markersRef.current.push(marker);
      }

      if (fromCampus && toCampus) {
        routeRef.current = L.polyline(
          [
            [fromCampus.lat, fromCampus.lng],
            [toCampus.lat, toCampus.lng],
          ],
          {
            color: C.red,
            weight: 4,
            opacity: 0.8,
            dashArray: '10 8',
          }
        ).addTo(map);

        map.fitBounds(routeRef.current.getBounds(), {
          padding: [36, 36],
        });
        centeredOnUserRef.current = true;
      }

      if (showMyLocation && navigator.geolocation) {
        watchRef.current = navigator.geolocation.watchPosition(
          position => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            setUserPos(loc);
            setLocationStatus('ready');
            onLocationUpdate?.(loc);

            if (!userMarkerRef.current) {
              userMarkerRef.current = L.marker([loc.lat, loc.lng], {
                icon: userIcon(),
                zIndexOffset: 700,
              }).addTo(map);
            } else {
              userMarkerRef.current.setLatLng([loc.lat, loc.lng]);
            }

            if (!userCircleRef.current) {
              userCircleRef.current = L.circle([loc.lat, loc.lng], {
                radius: Math.max(position.coords.accuracy || 0, 20),
                color: 'transparent',
                fillColor: C.red,
                fillOpacity: 0.08,
                interactive: false,
              }).addTo(map);
            } else {
              userCircleRef.current.setLatLng([loc.lat, loc.lng]);
              userCircleRef.current.setRadius(Math.max(position.coords.accuracy || 0, 20));
            }

            if (!centeredOnUserRef.current && !fromCampus && !toCampus) {
              map.setView([loc.lat, loc.lng], 15);
              centeredOnUserRef.current = true;
            }
          },
          error => {
            if (error.code === error.PERMISSION_DENIED) setLocationStatus('denied');
            else setLocationStatus('unavailable');
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      } else if (showMyLocation) {
        setLocationStatus('unsupported');
      }

      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, [
    activeDriverLocation,
    cleanupMap,
    fromCampus,
    onDriverClick,
    onLocationUpdate,
    showCampuses,
    showDrivers,
    showMyLocation,
    toCampus,
    interactive,
  ]);

  useEffect(() => {
    initMap();
    return cleanupMap;
  }, [cleanupMap, initMap]);

  const liveMapLabel =
    status === 'error' ? 'OSM map failed to load'
    : locationStatus === 'ready' ? 'Live GPS connected'
    : locationStatus === 'requesting' ? 'Requesting GPS access'
    : locationStatus === 'denied' ? 'Location permission denied'
    : locationStatus === 'unsupported' ? 'GPS unsupported in this browser'
    : locationStatus === 'unavailable' ? 'Waiting for a GPS fix'
    : 'OpenStreetMap live';

  return (
    <div style={{ position: 'relative', height, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${C.gray200}`, boxShadow: SHADOW.sm }}>
      <div ref={ref} style={{ width: '100%', height: '100%', background: C.gray50 }}/>

      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, background: C.gray50 }}>
          <FallbackMap fromCampus={fromCampus} toCampus={toCampus} showDrivers={showDrivers} height={height}/>
        </div>
      )}

      {status === 'error' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <FallbackMap fromCampus={fromCampus} toCampus={toCampus} showDrivers={showDrivers} height={height}/>
        </div>
      )}

      <div style={{ position: 'absolute', top: '12px', right: '12px', maxWidth: '220px', padding: '7px 10px', borderRadius: RADIUS.full, background: 'rgba(255,255,255,0.94)', border: `1px solid ${C.gray200}`, boxShadow: SHADOW.sm, fontSize: '11px', fontWeight: '700', color: status === 'ready' && locationStatus === 'ready' ? C.success : C.gray600, zIndex: 500 }}>
        {status === 'ready' && locationStatus === 'ready' ? '● ' : ''}{liveMapLabel}
      </div>

      {status === 'ready' && userPos && (
        <button
          onClick={() => {
            mapRef.current?.setView([userPos.lat, userPos.lng], 15);
          }}
          style={{ position: 'absolute', bottom: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '9px', background: C.white, border: `1px solid ${C.gray200}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.md, zIndex: 500 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
        </button>
      )}

      {(fromCampus || toCampus) && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '180px', zIndex: 500 }}>
          {fromCampus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: RADIUS.full, boxShadow: SHADOW.sm, border: `1px solid ${C.gray200}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.success, flexShrink: 0 }}/>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.gray700 }}>{fromCampus.name}</span>
            </div>
          )}
          {toCampus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: RADIUS.full, boxShadow: SHADOW.sm, border: `1px solid ${C.gray200}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, flexShrink: 0 }}/>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.gray700 }}>{toCampus.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SVG FALLBACK MAP ─────────────────────────────────────────────────────────
export function FallbackMap({ fromCampus, toCampus, showDrivers = true, height = 300 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 700); return () => clearInterval(t); }, []);

  const pos = {
    busch:       { x: 85,  y: 70  },
    college_ave: { x: 200, y: 130 },
    douglass:    { x: 195, y: 180 },
    cook:        { x: 270, y: 175 },
    livingston:  { x: 305, y: 80  },
  };

  const driverPos = [
    { x: 155, y: 105, initials: 'MT', eta: '4m' },
    { x: 235, y: 155, initials: 'PS', eta: '7m' },
    { x: 310, y: 100, initials: 'JW', eta: '11m' },
    { x: 180, y: 190, initials: 'SG', eta: '9m' },
    { x: 120, y: 115, initials: 'DC', eta: '5m' },
  ];

  const fp = fromCampus ? pos[fromCampus.id] : null;
  const tp = toCampus ? pos[toCampus.id] : null;
  const progress = (tick % 14) / 14;

  return (
    <div style={{ width: '100%', height, overflow: 'hidden', borderRadius: RADIUS.lg, position: 'relative', background: '#f5f5f5', border: `1px solid ${C.gray200}` }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="#f5f5f5"/>
        <ellipse cx="350" cy="230" rx="80" ry="40" fill="#dce8f0" opacity="0.6"/>
        <ellipse cx="190" cy="155" rx="50" ry="30" fill="#e8f0e8" opacity="0.8"/>
        <ellipse cx="90" cy="90" rx="40" ry="25" fill="#e8f0e8" opacity="0.7"/>
        <path d="M0 130 Q80 122 160 130 Q240 138 320 130 Q370 125 400 130" fill="none" stroke="white" strokeWidth="10" opacity="0.9"/>
        <path d="M0 130 Q80 122 160 130 Q240 138 320 130 Q370 125 400 130" fill="none" stroke="#e8e8e8" strokeWidth="1"/>
        <path d="M160 0 Q168 80 200 130 Q215 160 220 260" fill="none" stroke="white" strokeWidth="8" opacity="0.9"/>
        <path d="M160 0 Q168 80 200 130 Q215 160 220 260" fill="none" stroke="#e8e8e8" strokeWidth="1"/>
        <path d="M0 55 Q140 50 280 75 Q350 88 400 78" fill="none" stroke="white" strokeWidth="7" opacity="0.8"/>
        <path d="M55 260 Q110 200 200 130" fill="none" stroke="white" strokeWidth="7" opacity="0.8"/>
        <path d="M200 130 Q255 105 305 80" fill="none" stroke="white" strokeWidth="6" opacity="0.8"/>
        <path d="M280 75 L305 80 L310 120 Q290 150 270 175" fill="none" stroke="white" strokeWidth="6" opacity="0.8"/>

        {fp && tp && (
          <>
            <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} stroke={C.red} strokeWidth="3" strokeDasharray="8,5" opacity="0.7"/>
            <circle cx={fp.x + (tp.x - fp.x) * progress} cy={fp.y + (tp.y - fp.y) * progress} r="5" fill={C.red} style={{ filter: 'drop-shadow(0 0 4px rgba(204,0,51,0.5))' }}/>
          </>
        )}

        {CAMPUSES.map(campus => {
          const position = pos[campus.id];
          const isFrom = fromCampus?.id === campus.id;
          const isTo = toCampus?.id === campus.id;
          const active = isFrom || isTo;
          return (
            <g key={campus.id}>
              {active && <circle cx={position.x} cy={position.y} r="22" fill={isFrom ? 'rgba(26,138,74,0.12)' : 'rgba(204,0,51,0.1)'}/>}
              <ellipse cx={position.x} cy={position.y + 20} rx="5" ry="2" fill="rgba(0,0,0,0.12)"/>
              <path
                d={`M${position.x} ${position.y + 14} Q${position.x - 4} ${position.y + 8} ${position.x - 8} ${position.y} A8 8 0 1 1 ${position.x + 8} ${position.y} Q${position.x + 4} ${position.y + 8} ${position.x} ${position.y + 14}Z`}
                fill={active ? (isFrom ? C.success : C.red) : C.white}
                stroke={active ? 'none' : C.gray300}
                strokeWidth="1"
              />
              <text x={position.x} y={position.y + 4} textAnchor="middle" fontSize="9">{campus.icon}</text>
              {!active && <text x={position.x} y={position.y + 26} textAnchor="middle" fontSize="8" fill={C.gray500} fontFamily="system-ui" fontWeight="600">{campus.name.split(' ')[0]}</text>}
            </g>
          );
        })}

        {showDrivers && driverPos.map((driver, index) => (
          <g key={index}>
            <circle cx={driver.x} cy={driver.y} r="16" fill={C.red} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}/>
            <text x={driver.x} y={driver.y + 4} textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui" fontWeight="700">{driver.initials}</text>
            <rect x={driver.x - 12} y={driver.y - 28} width="24" height="14" rx="4" fill="white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}/>
            <text x={driver.x} y={driver.y - 19} textAnchor="middle" fontSize="8" fill={C.red} fontFamily="system-ui" fontWeight="700">{driver.eta}</text>
          </g>
        ))}

        {!fromCampus && !toCampus && (
          <>
            <circle cx="200" cy="128" r="20" fill="rgba(204,0,51,0.1)"/>
            <circle cx="200" cy="128" r="10" fill={C.red} opacity="0.85"/>
            <circle cx="200" cy="128" r="4" fill="white"/>
          </>
        )}

        <text x="6" y="254" fontSize="8" fill={C.gray400} fontFamily="monospace">OPENSTREETMAP · RUTGERS UNIVERSITY · NEW BRUNSWICK, NJ</text>
      </svg>

      {(fromCampus || toCampus) && (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {fromCampus && (
            <span style={{ background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.success}40`, borderRadius: RADIUS.full, padding: '3px 10px', fontSize: '10px', color: C.success, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.success, display: 'inline-block' }}/>{fromCampus.name}
            </span>
          )}
          {toCampus && (
            <span style={{ background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.red}40`, borderRadius: RADIUS.full, padding: '3px 10px', fontSize: '10px', color: C.red, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.red, display: 'inline-block' }}/>{toCampus.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
