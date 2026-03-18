import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { BackBtn, Btn, Sheet, Tag } from '../ui';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { RUTGERS_TRANSIT_OFFICIAL_URL, RUTGERS_TRANSIT_POLL_MS } from '../../constants/transit';
import { fetchTransitBootstrap, fetchTransitPredictions, fetchTransitVehicles, getRutgersTransitConfig } from '../../services/rutgersTransit';

const DEFAULT_CENTER = [40.5008, -74.4474];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

function routeColor(route) {
  return route?.color || C.red;
}

function busIcon(route) {
  return L.divIcon({
    className: 'ruride-bus-icon',
    html: `
      <div style="width:42px;height:42px;border-radius:14px;background:${routeColor(route)};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.18);font:800 12px system-ui;border:2px solid rgba(255,255,255,0.92);">
        ${route?.shortName || 'Bus'}
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function stopIcon(active = false) {
  return L.divIcon({
    className: 'ruride-stop-icon',
    html: `
      <div style="width:${active ? 18 : 14}px;height:${active ? 18 : 14}px;border-radius:50%;background:${active ? C.red : '#111111'};border:3px solid rgba(255,255,255,0.94);box-shadow:0 4px 12px rgba(0,0,0,0.18);"></div>
    `,
    iconSize: [active ? 18 : 14, active ? 18 : 14],
    iconAnchor: [active ? 9 : 7, active ? 9 : 7],
  });
}

function formatUpdatedAt(value) {
  if (!value) return 'Waiting for live feed';
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function predictionLabel(prediction) {
  if (prediction?.arrivalText) return prediction.arrivalText;
  if (typeof prediction?.minutes === 'number') return prediction.minutes <= 0 ? 'Due' : `${prediction.minutes} min`;
  return 'No ETA';
}

function BusMap({
  routes,
  stops,
  vehicles,
  selectedRouteIds,
  selectedStopId,
  focusKey,
  onSelectStop,
  onSelectVehicle,
}) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const stopLayerRef = useRef(null);
  const vehicleLayerRef = useRef(null);
  const focusKeyRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      center: DEFAULT_CENTER,
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    stopLayerRef.current = L.layerGroup().addTo(map);
    vehicleLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeLayerRef.current || !stopLayerRef.current || !vehicleLayerRef.current) return;

    routeLayerRef.current.clearLayers();
    stopLayerRef.current.clearLayers();
    vehicleLayerRef.current.clearLayers();

    const bounds = [];

    routes.forEach(route => {
      if (route.path?.length > 1) {
        L.polyline(route.path, {
          color: routeColor(route),
          weight: 4,
          opacity: 0.9,
        }).addTo(routeLayerRef.current);
        bounds.push(...route.path);
      }
    });

    stops.forEach(stop => {
      const marker = L.marker([stop.lat, stop.lng], {
        icon: stopIcon(stop.id === selectedStopId),
        zIndexOffset: stop.id === selectedStopId ? 400 : 200,
      }).addTo(stopLayerRef.current);

      marker.on('click', () => onSelectStop(stop));
      bounds.push([stop.lat, stop.lng]);
    });

    vehicles.forEach(vehicle => {
      const marker = L.marker([vehicle.lat, vehicle.lng], {
        icon: busIcon(vehicle.route),
        zIndexOffset: 600,
      }).addTo(vehicleLayerRef.current);

      marker.on('click', () => onSelectVehicle(vehicle));
      bounds.push([vehicle.lat, vehicle.lng]);
    });

    if (bounds.length > 1 && focusKeyRef.current !== focusKey) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28] });
      focusKeyRef.current = focusKey;
      return;
    }

    if (bounds.length === 1 && focusKeyRef.current !== focusKey) {
      map.setView(bounds[0], 15);
      focusKeyRef.current = focusKey;
    }
  }, [focusKey, onSelectStop, onSelectVehicle, routes, selectedStopId, stops, vehicles]);

  return <div ref={ref} style={{ width: '100%', height: '100%', background: C.gray50 }}/>;
}

function VehicleSheet({ vehicle, onClose }) {
  if (!vehicle) return null;

  return (
    <Sheet title="Bus Details" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', background: C.gray50, borderRadius: RADIUS.xl, border: `1px solid ${C.gray100}`, boxShadow: SHADOW.sm, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Live vehicle</p>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: C.gray800 }}>{vehicle.name || vehicle.route?.shortName || 'Rutgers Bus'}</h3>
            </div>
            <Tag color={routeColor(vehicle.route)}>{vehicle.route?.shortName || 'Route'}</Tag>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: C.gray600, lineHeight: '1.6' }}>{vehicle.tripHeadsign || vehicle.route?.longName || 'Rutgers campus service'}</p>
        </div>

        {[
          ['Route', vehicle.route?.longName || vehicle.route?.shortName || 'Active route'],
          ['Next stop', vehicle.nextStopName || 'Waiting for prediction feed'],
          ['Updated', formatUpdatedAt(vehicle.lastUpdated)],
          ['Speed', vehicle.speedMph ? `${vehicle.speedMph} mph` : 'Not published'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${C.gray100}` }}>
            <span style={{ fontSize: '12px', color: C.gray500 }}>{label}</span>
            <span style={{ fontSize: '12px', color: C.gray800, fontWeight: '700', textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function StopSheet({ stop, predictions, onClose }) {
  if (!stop) return null;

  return (
    <Sheet title="Stop Arrivals" onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', background: C.gray50, borderRadius: RADIUS.xl, border: `1px solid ${C.gray100}`, boxShadow: SHADOW.sm, marginBottom: '14px' }}>
          <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Stop</p>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: C.gray800 }}>{stop.name}</h3>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: C.gray500 }}>{stop.campus || 'Rutgers Transit'}</p>
        </div>

        {predictions.length === 0 ? (
          <div style={{ padding: '18px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm }}>
            <p style={{ margin: 0, fontSize: '13px', color: C.gray500, lineHeight: '1.6' }}>No live ETAs were returned for this stop yet.</p>
          </div>
        ) : predictions.map(prediction => (
          <div key={`${prediction.routeId}-${prediction.vehicleId || prediction.arrivalText}`} style={{ padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: C.gray800 }}>{prediction.routeShortName || prediction.routeName || 'Route'}</p>
              <span style={{ fontSize: '13px', fontWeight: '800', color: C.red }}>{predictionLabel(prediction)}</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray500 }}>{prediction.vehicleName || prediction.headsign || 'Live arrival estimate'}</p>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

export default function BusScreen({ onBack }) {
  const transitConfig = getRutgersTransitConfig();
  const [bootstrap, setBootstrap] = useState({ routes: [], stops: [], alerts: [], source: 'loading', lastUpdated: null });
  const [vehicles, setVehicles] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollError, setPollError] = useState('');

  const loadBootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchTransitBootstrap();
      setBootstrap(next);
      setPollError('');
    } catch (error) {
      setPollError('Unable to load Rutgers bus data right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleRoutes = useMemo(() => {
    const byCampus = selectedCampus === 'all'
      ? bootstrap.routes
      : bootstrap.routes.filter(route => route.campus === selectedCampus);
    return byCampus;
  }, [bootstrap.routes, selectedCampus]);

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    if (!visibleRoutes.length) return;
    setSelectedRouteIds(prev => {
      const next = prev.filter(routeId => visibleRoutes.some(route => route.id === routeId));
      return next;
    });
  }, [visibleRoutes]);

  useEffect(() => {
    if (bootstrap.source !== 'live') {
      setVehicles([]);
      return undefined;
    }

    let cancelled = false;

    async function refreshVehicles() {
      try {
        const nextVehicles = await fetchTransitVehicles(selectedRouteIds);
        if (cancelled) return;
        setVehicles(nextVehicles);
        setPollError('');
      } catch {
        if (cancelled) return;
        setPollError('Live bus polling failed. Open the official Rutgers tracker if this continues.');
      }
    }

    refreshVehicles();
    const timer = setInterval(refreshVehicles, RUTGERS_TRANSIT_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [bootstrap.source, selectedRouteIds]);

  useEffect(() => {
    if (!selectedStop || bootstrap.source !== 'live') {
      setPredictions([]);
      return undefined;
    }

    let cancelled = false;

    async function loadPredictions() {
      try {
        const nextPredictions = await fetchTransitPredictions(selectedStop.id, selectedRouteIds);
        if (cancelled) return;
        setPredictions(nextPredictions);
      } catch {
        if (!cancelled) setPredictions([]);
      }
    }

    loadPredictions();
    const timer = setInterval(loadPredictions, RUTGERS_TRANSIT_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [bootstrap.source, selectedRouteIds, selectedStop]);

  const activeRouteIds = selectedRouteIds.length ? selectedRouteIds : visibleRoutes.map(route => route.id);
  const activeRoutes = visibleRoutes.filter(route => activeRouteIds.includes(route.id));
  const activeStops = bootstrap.stops.filter(stop => {
    if (selectedCampus !== 'all' && stop.campus !== selectedCampus) return false;
    if (!activeRouteIds.length) return true;
    return stop.routeIds?.some(routeId => activeRouteIds.includes(routeId));
  });
  const activeVehicles = vehicles
    .map(vehicle => ({
      ...vehicle,
      route: bootstrap.routes.find(route => route.id === vehicle.routeId) || activeRoutes.find(route => route.id === vehicle.routeId),
    }))
    .filter(vehicle => {
      if (selectedCampus !== 'all' && vehicle.campus && vehicle.campus !== selectedCampus) return false;
      if (!activeRouteIds.length) return true;
      return activeRouteIds.includes(vehicle.routeId);
    });

  const highlightedStops = activeStops.slice(0, 8);
  const focusKey = `${selectedCampus}:${activeRouteIds.join(',') || 'all'}`;

  const toggleRoute = routeId => {
    setSelectedRouteIds(prev => (
      prev.includes(routeId) ? prev.filter(id => id !== routeId) : [...prev, routeId]
    ));
  };

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {selectedVehicle && <VehicleSheet vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)}/>}
      {selectedStop && <StopSheet stop={selectedStop} predictions={predictions} onClose={() => setSelectedStop(null)}/>}

      <div style={{ background: 'linear-gradient(180deg, #111111 0%, #1e1e1e 100%)', padding: '56px 20px 22px', color: C.white }}>
        <div style={{ marginBottom: '14px' }}>
          <BackBtn onClick={onBack}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Rutgers Transit</p>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900', fontFamily: FONTS.body }}>Live Bus Tracker</h1>
          </div>
          <button
            onClick={() => window.open(RUTGERS_TRANSIT_OFFICIAL_URL, '_blank', 'noopener,noreferrer')}
            style={{ padding: '10px 12px', borderRadius: RADIUS.md, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.08)', color: C.white, fontSize: '11px', fontWeight: '700', cursor: 'pointer', height: 'fit-content', fontFamily: FONTS.body }}
          >
            Open Official Tracker
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            [String(activeVehicles.length), 'Live buses'],
            [String(activeRoutes.length || visibleRoutes.length), 'Routes'],
            [bootstrap.lastUpdated ? formatUpdatedAt(bootstrap.lastUpdated) : 'Pending', 'Updated'],
          ].map(([value, label]) => (
            <div key={label} style={{ padding: '12px', borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '12px' }}>
          {[
            ['all', 'All Campuses'],
            ['new_brunswick', 'New Brunswick'],
            ['newark', 'Newark'],
            ['camden', 'Camden'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSelectedCampus(id)}
              style={{
                padding: '10px 14px',
                borderRadius: RADIUS.full,
                border: `1.5px solid ${selectedCampus === id ? C.red : C.gray200}`,
                background: selectedCampus === id ? C.redFaint : C.white,
                color: selectedCampus === id ? C.red : C.gray600,
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontFamily: FONTS.body,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px' }}>
          {visibleRoutes.map(route => {
            const active = selectedRouteIds.includes(route.id);
            return (
              <button
                key={route.id}
                onClick={() => toggleRoute(route.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: RADIUS.full,
                  border: `1.5px solid ${active ? routeColor(route) : C.gray200}`,
                  background: active ? `${routeColor(route)}15` : C.white,
                  color: active ? routeColor(route) : C.gray600,
                  fontSize: '12px',
                  fontWeight: '800',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  fontFamily: FONTS.body,
                }}
              >
                {route.shortName}
              </button>
            );
          })}
        </div>

        {(bootstrap.source !== 'live' || pollError) && (
          <div style={{ padding: '16px', background: bootstrap.source !== 'live' ? '#FFF8E7' : C.redFaint, borderRadius: RADIUS.xl, border: `1px solid ${bootstrap.source !== 'live' ? 'rgba(240,180,41,0.24)' : 'rgba(204,0,51,0.14)'}`, marginBottom: '14px' }}>
            <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: '800', color: bootstrap.source !== 'live' ? '#8A6500' : C.red }}>
              {bootstrap.source !== 'live' ? 'Transit backend not configured' : 'Live polling warning'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray600, lineHeight: '1.6' }}>
              {bootstrap.source !== 'live'
                ? `Set VITE_RUTGERS_TRANSIT_API_BASE to your Rutgers transit proxy to power live vehicles, route geometry, stops, and ETAs. Until then, use the official Rutgers Passio tracker.`
                : pollError}
            </p>
          </div>
        )}

        {bootstrap.alerts.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            {bootstrap.alerts.slice(0, 3).map(alert => (
              <div key={alert.id} style={{ padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: C.gray800 }}>{alert.title}</p>
                  <span style={{ fontSize: '10px', color: C.gray400 }}>{formatUpdatedAt(alert.updatedAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: C.gray500, lineHeight: '1.6' }}>{alert.body}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: '300px', borderRadius: RADIUS.xl, overflow: 'hidden', border: `1px solid ${C.gray100}`, background: C.white, boxShadow: SHADOW.sm, marginBottom: '14px' }}>
          <BusMap
            routes={activeRoutes}
            stops={activeStops}
            vehicles={activeVehicles}
            selectedRouteIds={activeRouteIds}
            selectedStopId={selectedStop?.id || null}
            focusKey={focusKey}
            onSelectStop={setSelectedStop}
            onSelectVehicle={setSelectedVehicle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div style={{ padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.gray500 }}>Feed mode</p>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: bootstrap.source === 'live' ? C.success : C.gray800 }}>
              {bootstrap.source === 'live' ? 'Live Passio-backed' : 'Official fallback'}
            </p>
          </div>
          <div style={{ padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.gray500 }}>Backend</p>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: C.gray800 }}>
              {transitConfig.configured ? 'Configured' : 'Missing'}
            </p>
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.gray100}` }}>
            <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Popular Stops</p>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>Tap a stop for live ETAs</h3>
          </div>
          {highlightedStops.length === 0 ? (
            <div style={{ padding: '20px 16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: C.gray500, lineHeight: '1.6' }}>
                Stop geometry will appear here once the Rutgers transit backend supplies stop coordinates and route membership.
              </p>
            </div>
          ) : highlightedStops.map((stop, index) => (
            <button
              key={stop.id}
              onClick={() => setSelectedStop(stop)}
              style={{ width: '100%', padding: '14px 16px', background: C.white, border: 'none', borderBottom: index < highlightedStops.length - 1 ? `1px solid ${C.gray100}` : 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{stop.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: C.gray500 }}>{stop.routeIds?.join(' · ') || stop.campus || 'Rutgers Transit'}</p>
                </div>
                <span style={{ fontSize: '12px', color: C.red, fontWeight: '700' }}>View ETAs</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.gray100}` }}>
            <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Live Fleet</p>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>Real-time buses</h3>
          </div>
          {loading ? (
            <div style={{ padding: '20px 16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: C.gray500 }}>Loading Rutgers transit data…</p>
            </div>
          ) : activeVehicles.length === 0 ? (
            <div style={{ padding: '20px 16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: C.gray500, lineHeight: '1.6' }}>
                {bootstrap.source === 'live' ? 'No buses matched the current filter.' : 'Live buses will appear here when the transit backend is connected.'}
              </p>
            </div>
          ) : activeVehicles.map((vehicle, index) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              style={{ width: '100%', padding: '14px 16px', background: C.white, border: 'none', borderBottom: index < activeVehicles.length - 1 ? `1px solid ${C.gray100}` : 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <Tag color={routeColor(vehicle.route)}>{vehicle.route?.shortName || 'Route'}</Tag>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{vehicle.name || 'Rutgers Bus'}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: C.gray500 }}>{vehicle.nextStopName || vehicle.tripHeadsign || 'Live vehicle coordinate matched to route'}</p>
                </div>
                <span style={{ fontSize: '11px', color: C.gray400 }}>{formatUpdatedAt(vehicle.lastUpdated)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
