# 🚗 RUride — Rutgers University Campus Rideshare

> University-verified carpooling platform exclusively for Rutgers students.

---

## 🚀 Quick Start

```bash
npm install

# Start dev server
npm run dev
# Opens at http://localhost:3000
```

---

## 📦 Store Release Kit

Store submission drafts and checklists live in `docs/store/`:

- `docs/store/ios-app-store-metadata.md`
- `docs/store/google-play-metadata.md`
- `docs/store/privacy-policy-checklist.md`
- `docs/store/screenshots-checklist.md`
- `docs/store/release-commands.md`

---

## 🗺️ OpenStreetMap + GPS

The app now uses:

- **OpenStreetMap** tile layers via Leaflet
- **Browser geolocation** for live GPS
- **No API key required**

Notes:

- The Home screen uses real OSM tiles immediately after `npm install`
- The browser will prompt for location permission the first time GPS is requested
- If location permission is denied or unavailable, the app still shows the live OSM map with Rutgers campus and driver markers
- Ride route previews use a direct route line between campuses for the demo

---

## 🚌 Rutgers Transit Integration

The app now includes a Rutgers bus tracker screen designed for a production Passio-style integration.

Frontend setup:

```bash
VITE_RUTGERS_TRANSIT_API_BASE=https://your-transit-proxy.example.com
```

Expected backend endpoints:

- `GET /routes` → `{ routes: [{ id, shortName, longName, campus, color, path }] }`
- `GET /stops` → `{ stops: [{ id, name, campus, lat, lng, routeIds }] }`
- `GET /alerts` → `{ alerts: [{ id, title, body, updatedAt }] }`
- `GET /vehicles?routeId=A&routeId=LX` → `{ vehicles: [{ id, name, routeId, lat, lng, campus, nextStopName, tripHeadsign, speedMph, lastUpdated }] }`
- `GET /stops/:stopId/predictions?routeId=A` → `{ predictions: [{ routeId, routeShortName, routeName, vehicleId, vehicleName, minutes, arrivalText, headsign }] }`

Notes:

- The frontend intentionally does **not** call undocumented Rutgers/Passio endpoints directly from the browser
- Use a server-side proxy for auth, rate limiting, caching, feed normalization, and resilience
- When the backend is not configured, the app falls back to the official Rutgers tracker at `https://rutgers.passiogo.com/`

---

## 📁 Project Structure

```
ruride/
├── src/
│   ├── App.jsx                        ← Root app & navigation state
│   ├── main.jsx                       ← React entry point
│   ├── constants/
│   │   ├── theme.js                   ← Colors, fonts, shadows (white/black/red)
│   │   └── data.js                    ← Campuses, drivers, restaurants
│   │   └── transit.js                 ← Rutgers transit route catalog + polling config
│   ├── components/
│   │   ├── ui/index.jsx               ← Btn, Input, Select, Stars, BottomNav, Sheet...
│   │   ├── map/LiveMap.jsx            ← Leaflet + OpenStreetMap + SVG fallback
│   │   └── screens/
│   │       ├── SplashScreen.jsx
│   │       ├── AuthScreens.jsx        ← Onboarding, Login, Signup, Verification
│   │       ├── HomeScreen.jsx         ← Main dashboard, ride booking, driver list
│   │       ├── BusScreen.jsx          ← Rutgers live transit tracker
│   │       ├── RideScreens.jsx        ← Active ride + review
│   │       ├── FoodScreen.jsx         ← Campus food delivery
│   │       └── ProfileScreens.jsx     ← Rides history, profile, settings
│   └── services/
│       └── rutgersTransit.js          ← Transit backend client + polling helpers
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎯 Demo Flow

1. **Splash** → animated red RUride logo
2. **Onboarding** → Sign In / Create Account
3. **Login** → NetID + password → 2FA code (shown in demo banner)
4. **Signup** → 3 steps: Personal Info → Contact → Terms
5. **Verification** → Upload student ID → Skip for demo
6. **Home** → Live map with 5 driver pins + your location + Book Ride button
7. **Book Ride** → Select From campus → To campus → Find Drivers → Book
8. **Active Ride** → Map with route → Status progression → Complete
9. **Review** → Rate driver, tags, comment
10. **Eats** → Browse restaurants by campus → Menu → Order
11. **Buses** → Live Rutgers transit map → Stops → ETAs → Bus details
12. **My Rides** → History with re-book, Upcoming tab
13. **Profile** → Info, Payment, Settings with real toggles

---

## 🏫 Campus Coordinates

| Campus | Lat | Lng |
|--------|-----|-----|
| Busch Campus | 40.5235 | -74.4626 |
| College Avenue Campus | 40.5008 | -74.4474 |
| Douglass Campus | 40.4887 | -74.4496 |
| George H. Cook Campus | 40.4824 | -74.4378 |
| Livingston Campus | 40.5219 | -74.4380 |

---

## 🔌 Backend Integration Roadmap

| Feature | Service |
|---------|---------|
| Auth | Rutgers CAS OAuth + Firebase Auth |
| Database | Firebase Firestore / Supabase |
| Real-time | Socket.io / Firebase Realtime DB |
| Payments | Stripe |
| SMS / 2FA | Twilio |
| Maps | OpenStreetMap + Leaflet |
| Push | Firebase Cloud Messaging |
| Storage | Firebase Storage / AWS S3 |

---

## 🎨 Design System

- **Primary:** Rutgers Scarlet `#CC0033`
- **Background:** White `#FFFFFF` / Off-white `#F8F8F8`
- **Text:** Near-black `#1A1A1A` → Gray scale
- **Accent:** Minimal — red only for CTAs and active states
- **Font Display:** Playfair Display (logo/headers)
- **Font Body:** DM Sans (all UI)
- **Font Mono:** JetBrains Mono (codes, plates)

---

## 📄 License

MIT © RUride — Built for the Rutgers community
