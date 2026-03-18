import { useEffect, useRef, useState, useCallback } from 'react';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { CAMPUSES, MOCK_DRIVERS } from '../../constants/data';

// ─── Replace with your actual key ─────────────────────────────────────────
export const GOOGLE_MAPS_API_KEY = 'AIzaSyD-REPLACE-WITH-YOUR-KEY';

const RU_CENTER = { lat: 40.5008, lng: -74.4474 };

// Light minimalist map style
const MAP_STYLE = [
  { elementType: 'geometry',               stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon',            stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',       stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke',     stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative',         elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',                    stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                   elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',                   elementType: 'geometry.stroke', stylers: [{ color: '#e8e8e8' }] },
  { featureType: 'road.arterial',          elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway',           elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
  { featureType: 'road.highway',           elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.local',             elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'transit',                stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                  elementType: 'geometry', stylers: [{ color: '#dce8f0' }] },
  { featureType: 'landscape',              elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'landscape.natural',      elementType: 'geometry', stylers: [{ color: '#e8f0e8' }] },
];

let mapsLoaded = false;
let mapsLoading = false;
const callbacks = [];

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return; }
    callbacks.push({ resolve, reject });
    if (mapsLoading) return;
    mapsLoading = true;
    window.__googleMapsReady = () => {
      mapsLoaded = true;
      callbacks.forEach(cb => cb.resolve(window.google.maps));
      callbacks.length = 0;
    };
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__googleMapsReady&libraries=geometry,places`;
    s.async = true; s.defer = true;
    s.onerror = () => callbacks.forEach(cb => cb.reject(new Error('Maps failed')));
    document.head.appendChild(s);
  });
}

function makeDriverMarkerSvg(initials) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/></filter></defs>
      <rect x="4" y="4" width="40" height="40" rx="20" fill="#CC0033" filter="url(#s)"/>
      <text x="24" y="30" text-anchor="middle" font-size="14" font-weight="700" fill="white" font-family="system-ui">${initials}</text>
      <path d="M24 48 L18 42 H30 Z" fill="#CC0033"/>
    </svg>
  `)}`;
}

function makeUserMarkerSvg() {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="24" fill="rgba(204,0,51,0.15)"/>
      <circle cx="28" cy="28" r="14" fill="#CC0033" opacity="0.9"/>
      <circle cx="28" cy="28" r="6" fill="white"/>
    </svg>
  `)}`;
}

function makeCampusMarkerSvg(icon) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.18)"/></filter></defs>
      <path d="M22 2C12 2 4 10 4 20 C4 32 22 50 22 50 S40 32 40 20 C40 10 32 2 22 2Z" fill="white" stroke="#CC0033" stroke-width="2" filter="url(#s)"/>
      <text x="22" y="25" text-anchor="middle" font-size="16">${icon}</text>
    </svg>
  `)}`;
}

// ─── MAIN MAP COMPONENT ───────────────────────────────────────────────────────
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
  const markersRef = useRef([]);
  const directionsRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watchRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error | no_key
  const [userPos, setUserPos] = useState(null);

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const initMap = useCallback(async () => {
    // Check if API key is real
    if (GOOGLE_MAPS_API_KEY.includes('REPLACE')) {
      setStatus('no_key');
      return;
    }

    try {
      const maps = await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
      if (!ref.current) return;

      const map = new maps.Map(ref.current, {
        center: RU_CENTER, zoom: 14,
        styles: MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: interactive,
        gestureHandling: interactive ? 'cooperative' : 'none',
        clickableIcons: false,
      });
      mapRef.current = map;

      // Campus markers
      if (showCampuses) {
        CAMPUSES.forEach(campus => {
          const isFrom = fromCampus?.id === campus.id;
          const isTo = toCampus?.id === campus.id;
          const marker = new maps.Marker({
            position: { lat: campus.lat, lng: campus.lng },
            map,
            title: campus.name,
            icon: {
              url: makeCampusMarkerSvg(campus.icon),
              scaledSize: new maps.Size(44, 52),
              anchor: new maps.Point(22, 52),
            },
            zIndex: isFrom || isTo ? 10 : 5,
            animation: (isFrom || isTo) ? maps.Animation.DROP : null,
          });

          const info = new maps.InfoWindow({
            content: `<div style="font-family:DM Sans,sans-serif;padding:6px 2px;min-width:140px">
              <b style="font-size:13px;color:#0A0A0A">${campus.name}</b>
              <p style="font-size:11px;color:#888;margin:3px 0 5px">${campus.desc}</p>
              <span style="background:#FFF0F3;color:#CC0033;border:1px solid rgba(204,0,51,0.2);border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;">$5 Flat Fare</span>
            </div>`,
          });
          marker.addListener('click', () => info.open(map, marker));
          markersRef.current.push(marker);
        });
      }

      // Driver markers
      if (showDrivers) {
        MOCK_DRIVERS.forEach(driver => {
          const marker = new maps.Marker({
            position: { lat: driver.lat, lng: driver.lng },
            map,
            title: driver.name,
            icon: {
              url: makeDriverMarkerSvg(driver.initials),
              scaledSize: new maps.Size(48, 56),
              anchor: new maps.Point(24, 56),
            },
            zIndex: 8,
          });

          const info = new maps.InfoWindow({
            content: `<div style="font-family:DM Sans,sans-serif;padding:6px 2px;min-width:160px">
              <b style="font-size:13px;color:#0A0A0A">${driver.name}</b>
              <p style="font-size:11px;color:#888;margin:2px 0">${driver.car}</p>
              <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
                <span style="font-size:11px;color:#555">⭐ ${driver.rating}</span>
                <span style="font-size:11px;color:#CC0033">ETA ${driver.eta}</span>
                <span style="font-size:11px;color:#555">${driver.seats} seats</span>
              </div>
            </div>`,
          });

          marker.addListener('click', () => {
            info.open(map, marker);
            onDriverClick?.(driver);
          });
          markersRef.current.push(marker);
        });
      }

      // Active driver tracking
      if (activeDriverLocation) {
        const m = new maps.Marker({
          position: activeDriverLocation, map,
          icon: { url: makeDriverMarkerSvg('DR'), scaledSize: new maps.Size(52, 60), anchor: new maps.Point(26, 60) },
          zIndex: 20, animation: maps.Animation.BOUNCE,
        });
        markersRef.current.push(m);
      }

      // Route rendering
      if (fromCampus && toCampus) {
        const ds = new maps.DirectionsService();
        const dr = new maps.DirectionsRenderer({
          map, suppressMarkers: true,
          polylineOptions: { strokeColor: '#CC0033', strokeWeight: 4, strokeOpacity: 0.8 },
        });
        directionsRef.current = dr;
        ds.route({
          origin: { lat: fromCampus.lat, lng: fromCampus.lng },
          destination: { lat: toCampus.lat, lng: toCampus.lng },
          travelMode: maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === 'OK') {
            dr.setDirections(result);
            const bounds = new maps.LatLngBounds();
            bounds.extend({ lat: fromCampus.lat, lng: fromCampus.lng });
            bounds.extend({ lat: toCampus.lat, lng: toCampus.lng });
            map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
          }
        });
      }

      // User geolocation
      if (showMyLocation && navigator.geolocation) {
        const watch = navigator.geolocation.watchPosition(
          pos => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserPos(loc);
            onLocationUpdate?.(loc);

            if (!userMarkerRef.current) {
              userMarkerRef.current = new maps.Marker({
                position: loc, map, zIndex: 15,
                icon: { url: makeUserMarkerSvg(), scaledSize: new maps.Size(56, 56), anchor: new maps.Point(28, 28) },
                title: 'Your Location',
              });
              // Only center on user once if no route
              if (!fromCampus && !toCampus) map.setCenter(loc);
            } else {
              userMarkerRef.current.setPosition(loc);
            }
          },
          () => {}, // ignore errors silently
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
        watchRef.current = watch;
      }

      setStatus('ready');
    } catch (e) {
      setStatus('error');
    }
  }, [fromCampus?.id, toCampus?.id, showDrivers, activeDriverLocation]);

  useEffect(() => {
    initMap();
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [initMap]);

  return (
    <div style={{ position: 'relative', height, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${C.gray200}`, boxShadow: SHADOW.sm }}>
      <div ref={ref} style={{ width: '100%', height: '100%', background: C.gray50 }}/>

      {/* No key — show SVG fallback */}
      {status === 'no_key' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <FallbackMap fromCampus={fromCampus} toCampus={toCampus} showDrivers={showDrivers} height={height}/>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, background: C.gray50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FallbackMap fromCampus={fromCampus} toCampus={toCampus} showDrivers={showDrivers} height={height}/>
        </div>
      )}

      {/* Recenter button */}
      {status === 'ready' && userPos && (
        <button
          onClick={() => mapRef.current?.setCenter(userPos)}
          style={{ position: 'absolute', bottom: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '9px', background: C.white, border: `1px solid ${C.gray200}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.md }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
        </button>
      )}

      {/* Campus labels overlay */}
      {(fromCampus || toCampus) && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '180px' }}>
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

  // Campus pixel positions on a 400×260 canvas
  const pos = {
    busch:       { x: 85,  y: 70  },
    college_ave: { x: 200, y: 130 },
    douglass:    { x: 195, y: 180 },
    cook:        { x: 270, y: 175 },
    livingston:  { x: 305, y: 80  },
  };

  // Driver positions
  const driverPos = [
    { x: 155, y: 105, initials: 'MT', eta: '4m' },
    { x: 235, y: 155, initials: 'PS', eta: '7m' },
    { x: 310, y: 100, initials: 'JW', eta: '11m' },
    { x: 180, y: 190, initials: 'SG', eta: '9m' },
    { x: 120, y: 115, initials: 'DC', eta: '5m' },
  ];

  const fp = fromCampus ? pos[fromCampus.id] : null;
  const tp = toCampus   ? pos[toCampus.id]   : null;
  const progress = (tick % 14) / 14;

  return (
    <div style={{ width: '100%', height, overflow: 'hidden', borderRadius: RADIUS.lg, position: 'relative', background: '#f5f5f5', border: `1px solid ${C.gray200}` }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        {/* Base */}
        <rect width="400" height="260" fill="#f5f5f5"/>
        {/* Water */}
        <ellipse cx="350" cy="230" rx="80" ry="40" fill="#dce8f0" opacity="0.6"/>
        {/* Green zones */}
        <ellipse cx="190" cy="155" rx="50" ry="30" fill="#e8f0e8" opacity="0.8"/>
        <ellipse cx="90" cy="90" rx="40" ry="25" fill="#e8f0e8" opacity="0.7"/>
        {/* Roads */}
        <path d="M0 130 Q80 122 160 130 Q240 138 320 130 Q370 125 400 130" fill="none" stroke="white" strokeWidth="10" opacity="0.9"/>
        <path d="M0 130 Q80 122 160 130 Q240 138 320 130 Q370 125 400 130" fill="none" stroke="#e8e8e8" strokeWidth="1"/>
        <path d="M160 0 Q168 80 200 130 Q215 160 220 260" fill="none" stroke="white" strokeWidth="8" opacity="0.9"/>
        <path d="M160 0 Q168 80 200 130 Q215 160 220 260" fill="none" stroke="#e8e8e8" strokeWidth="1"/>
        <path d="M0 55 Q140 50 280 75 Q350 88 400 78" fill="none" stroke="white" strokeWidth="7" opacity="0.8"/>
        <path d="M55 260 Q110 200 200 130" fill="none" stroke="white" strokeWidth="7" opacity="0.8"/>
        <path d="M200 130 Q255 105 305 80" fill="none" stroke="white" strokeWidth="6" opacity="0.8"/>
        <path d="M280 75 L305 80 L310 120 Q290 150 270 175" fill="none" stroke="white" strokeWidth="6" opacity="0.8"/>

        {/* Route */}
        {fp && tp && (
          <>
            <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} stroke={C.red} strokeWidth="3" strokeDasharray="8,5" opacity="0.7"/>
            <circle cx={fp.x + (tp.x - fp.x) * progress} cy={fp.y + (tp.y - fp.y) * progress} r="5" fill={C.red} style={{ filter: 'drop-shadow(0 0 4px rgba(204,0,51,0.5))' }}/>
          </>
        )}

        {/* Campus markers */}
        {CAMPUSES.map(c => {
          const p = pos[c.id];
          const isF = fromCampus?.id === c.id;
          const isT = toCampus?.id === c.id;
          const active = isF || isT;
          return (
            <g key={c.id}>
              {active && <circle cx={p.x} cy={p.y} r="22" fill={isF ? 'rgba(26,138,74,0.12)' : 'rgba(204,0,51,0.1)'}/>}
              {/* Pin shape */}
              <ellipse cx={p.x} cy={p.y + 20} rx="5" ry="2" fill="rgba(0,0,0,0.12)"/>
              <path d={`M${p.x} ${p.y + 14} Q${p.x-4} ${p.y + 8} ${p.x-8} ${p.y} A8 8 0 1 1 ${p.x+8} ${p.y} Q${p.x+4} ${p.y+8} ${p.x} ${p.y+14}Z`}
                fill={active ? (isF ? C.success : C.red) : C.white} stroke={active ? 'none' : C.gray300} strokeWidth="1"/>
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="9">{c.icon}</text>
              {!active && <text x={p.x} y={p.y + 26} textAnchor="middle" fontSize="8" fill={C.gray500} fontFamily="system-ui" fontWeight="600">{c.name.split(' ')[0]}</text>}
            </g>
          );
        })}

        {/* Driver markers */}
        {showDrivers && driverPos.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="16" fill={C.red} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}/>
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui" fontWeight="700">{d.initials}</text>
            <rect x={d.x - 12} y={d.y - 28} width="24" height="14" rx="4" fill="white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}/>
            <text x={d.x} y={d.y - 19} textAnchor="middle" fontSize="8" fill={C.red} fontFamily="system-ui" fontWeight="700">{d.eta}</text>
          </g>
        ))}

        {/* User location dot */}
        {!fromCampus && !toCampus && (
          <>
            <circle cx="200" cy="128" r="20" fill="rgba(204,0,51,0.1)"/>
            <circle cx="200" cy="128" r="10" fill={C.red} opacity="0.85"/>
            <circle cx="200" cy="128" r="4" fill="white"/>
          </>
        )}

        {/* Legend */}
        <text x="6" y="254" fontSize="8" fill={C.gray400} fontFamily="monospace">RUTGERS UNIVERSITY · NEW BRUNSWICK, NJ</text>
      </svg>

      {/* Labels */}
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
