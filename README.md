# 🚗 RUride — Rutgers University Campus Rideshare

> University-verified carpooling platform exclusively for Rutgers students.

---

## 🚀 Quick Start

```bash
# Unzip and enter project
unzip ruride-project.zip && cd ruride

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:3000
```

---

## 🗺️ Google Maps Setup (Required for live map)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable these 3 APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Places API**
3. Create API Key → copy it
4. Open `src/components/map/LiveMap.jsx`
5. Replace line 11:
```js
export const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_KEY_HERE';
```

> Without a key, the app uses a detailed SVG fallback map with real campus positions and animated driver pins — fully functional for demo.

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
│   ├── components/
│   │   ├── ui/index.jsx               ← Btn, Input, Select, Stars, BottomNav, Sheet...
│   │   ├── map/LiveMap.jsx            ← Google Maps + SVG fallback
│   │   └── screens/
│   │       ├── SplashScreen.jsx
│   │       ├── AuthScreens.jsx        ← Onboarding, Login, Signup, Verification
│   │       ├── HomeScreen.jsx         ← Main dashboard, ride booking, driver list
│   │       ├── RideScreens.jsx        ← Active ride + review
│   │       ├── FoodScreen.jsx         ← Campus food delivery
│   │       └── ProfileScreens.jsx     ← Rides history, profile, settings
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
11. **My Rides** → History with re-book, Upcoming tab
12. **Profile** → Info, Payment, Settings with real toggles

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
| Maps | Google Maps Platform |
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
