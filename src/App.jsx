import { useEffect, useState } from 'react';
import SplashScreen from './components/screens/SplashScreen';
import { OnboardingScreen, LoginScreen, SignupScreen, VerificationScreen } from './components/screens/AuthScreens';
import HomeScreen from './components/screens/HomeScreen';
import FoodScreen from './components/screens/FoodScreen';
import BusScreen from './components/screens/BusScreen';
import { RidesScreen, ProfileScreen } from './components/screens/ProfileScreens';
import { ActiveRideScreen, ReviewScreen } from './components/screens/RideScreens';
import { ActiveDriverTripScreen, DriverEarningsScreen, DriverHomeScreen, DriverTripsScreen } from './components/screens/DriverScreens';
import { BottomNav } from './components/ui';
import { MOCK_RIDE_REQUESTS } from './constants/data';
import { C, FONTS } from './constants/theme';
import { formatStamp, loadAppState, makeId, saveAppState } from './utils/persistence';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 0; }
  html, body, #root { min-height: 100%; }
  body { margin: 0; background: #F4F1F2; font-family: 'DM Sans', system-ui, sans-serif; }
  input::placeholder, textarea::placeholder { color: #AAAAAA; }
  select option { background: white; color: #1A1A1A; }
  button, input, select, textarea { font: inherit; }
  .app-shell { overflow: hidden; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12); border-left: 1px solid rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.85); }
  @keyframes pulseDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @media (max-width: 480px) {
    .app-shell { box-shadow: none; border: none; }
  }
`;

export default function App() {
  const persisted = loadAppState();
  const initialDriverRequests = (persisted.driverRequests || MOCK_RIDE_REQUESTS).map(request => ({
    ...request,
    status: request.status || 'pending',
  }));
  const [splash, setSplash] = useState(true);
  const [screen, setScreen] = useState(persisted.user ? 'app' : 'onboarding');
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(persisted.user || null);
  const [activeRide, setActiveRide] = useState(persisted.activeRide || null);
  const [reviewRide, setReviewRide] = useState(persisted.reviewRide || null);
  const [driverActiveTrip, setDriverActiveTrip] = useState(persisted.driverActiveTrip || null);
  const [paymentMethod, setPaymentMethod] = useState(persisted.paymentMethod || null);
  const [rideHistory, setRideHistory] = useState(persisted.rideHistory || []);
  const [driverTripHistory, setDriverTripHistory] = useState(persisted.driverTripHistory || []);
  const [notifications, setNotifications] = useState(persisted.notifications || []);
  const [supportTickets, setSupportTickets] = useState(persisted.supportTickets || []);
  const [savedPlaces, setSavedPlaces] = useState(persisted.savedPlaces || []);
  const [driverProfile, setDriverProfile] = useState(
    persisted.driverProfile || {
      available: false,
      vehicle: '2019 Honda Civic',
      plate: 'RU-2024',
      earnings: 85,
      completedTrips: 17,
      acceptanceRate: 96,
    }
  );
  const [driverRequests, setDriverRequests] = useState(initialDriverRequests);
  const appRole = user?.role === 'driver' ? 'driver' : 'rider';
  const showRiderLiveTrip = appRole === 'rider' && activeRide && tab === 'rides';
  const showDriverLiveTrip = appRole === 'driver' && driverActiveTrip && tab === 'rides';
  const showReviewScreen = appRole === 'rider' && reviewRide && !activeRide && tab === 'rides';

  useEffect(() => {
    saveAppState({
      user,
      activeRide,
      reviewRide,
      driverActiveTrip,
      paymentMethod,
      rideHistory,
      driverTripHistory,
      notifications,
      supportTickets,
      savedPlaces,
      driverProfile,
      driverRequests,
    });
  }, [activeRide, driverActiveTrip, driverProfile, driverRequests, driverTripHistory, notifications, paymentMethod, reviewRide, rideHistory, savedPlaces, supportTickets, user]);

  useEffect(() => {
    if (appRole === 'driver' && tab === 'food') setTab('home');
    if (appRole === 'driver' && tab === 'buses') setTab('home');
    if (appRole === 'rider' && tab === 'earnings') setTab('home');
  }, [appRole, tab]);

  const addNotification = (title, body, tone = 'info') => {
    setNotifications(prev => [
      { id: makeId('note'), title, body, tone, read: false, createdAt: formatStamp() },
      ...prev,
    ].slice(0, 40));
  };

  const addSavedPlace = place => {
    setSavedPlaces(prev => {
      const withoutDuplicate = prev.filter(entry => entry.label !== place.label);
      return [place, ...withoutDuplicate].slice(0, 8);
    });
  };

  const createSupportTicket = ({ title, description, severity = 'standard', rideId = null }) => {
    const ticket = {
      id: makeId('ticket'),
      title,
      description,
      severity,
      rideId,
      status: 'open',
      createdAt: formatStamp(),
    };
    setSupportTickets(prev => [ticket, ...prev]);
    addNotification('Support ticket created', title, 'alert');
  };

  const resolveSupportTicket = ticketId => {
    setSupportTickets(prev => prev.map(ticket => (
      ticket.id === ticketId ? { ...ticket, status: 'resolved', resolvedAt: formatStamp() } : ticket
    )));
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(note => ({ ...note, read: true })));
  };

  const handleLoginSuccess = (auth) => {
    const nextUser = {
      netid: auth.netid,
      fullName: 'Alex Johnson',
      school: 'School of Engineering (SOE)',
      email: `${auth.netid}@scarletmail.rutgers.edu`,
      phone: '+1 (732) 555-0123',
      address: '15 College Ave, New Brunswick, NJ 08901',
      role: 'rider',
    };
    setUser(nextUser);
    addSavedPlace({ label: 'Home', value: nextUser.address, type: 'home' });
    addNotification('Welcome back', `Signed in as ${nextUser.fullName}`, 'success');
    setScreen('app');
  };

  const handleSignupSuccess = (form) => {
    const nextUser = { ...form, role: 'rider', verificationStatus: 'pending' };
    setUser(nextUser);
    if (nextUser.address) addSavedPlace({ label: 'Home', value: nextUser.address, type: 'home' });
    addNotification('Account created', 'Complete verification to unlock all ride features.', 'info');
    setScreen('verification');
  };

  const handleRideStart = (ride) => {
    const nextRide = {
      ...ride,
      id: ride.id || makeId('ride'),
      requestedAt: ride.requestedAt || formatStamp(),
      status: 'active',
    };
    setActiveRide(nextRide);
    setTab('rides');
    addNotification('Ride confirmed', `${nextRide.name} is on the way to ${nextRide.pickupLabel || nextRide.from}.`, 'success');
  };

  const handleRideComplete = (ride) => {
    setActiveRide(null);
    setReviewRide(ride);
    setTab('rides');
    addNotification('Ride completed', `Trip to ${ride.dropoffLabel || ride.to} is ready for review.`, 'info');
  };

  const handleReviewDone = (review) => {
    if (reviewRide) {
      setRideHistory(prev => [
        {
          ...reviewRide,
          status: 'completed',
          completedAt: formatStamp(),
          review,
        },
        ...prev,
      ]);
    }
    setReviewRide(null);
    addNotification('Thanks for the feedback', 'Your ride receipt has been saved to ride history.', 'success');
    setTab('home');
  };

  const handleDriverRequestUpdate = (requestId, status) => {
    const request = driverRequests.find(entry => entry.id === requestId);
    if (!request) return;

    if (status === 'accepted') {
      if (driverActiveTrip) return;
      setDriverRequests(prev => prev.map(entry => (
        entry.id === requestId ? { ...entry, status: 'accepted', updatedAt: formatStamp() } : entry
      )));
      setDriverActiveTrip({
        id: makeId('dtrip'),
        requestId,
        rider: request.rider,
        initials: request.initials,
        fare: request.fare,
        eta: request.eta,
        distance: request.distance,
        pickupSpot: request.pickupSpot || request.from,
        dropoffSpot: request.dropoffSpot || request.to,
        fromCampusId: request.fromCampusId,
        toCampusId: request.toCampusId,
        riderPhone: request.riderPhone,
        note: request.note,
        acceptedAt: formatStamp(),
        liveStatus: 'heading_pickup',
      });
      addNotification('Pickup assigned', `Head to ${request.pickupSpot || request.from} for ${request.rider}.`, 'success');
      setDriverProfile(prev => ({
        ...prev,
        available: true,
        acceptanceRate: Math.min(99, prev.acceptanceRate + 1),
      }));
      setTab('rides');
      return;
    }

    setDriverRequests(prev => prev.map(entry => (
      entry.id === requestId ? { ...entry, status: 'declined', updatedAt: formatStamp() } : entry
    )));
    addNotification('Driver request declined', 'The request was removed from your queue.', 'info');
    setDriverProfile(prev => ({
      ...prev,
      acceptanceRate: Math.max(80, prev.acceptanceRate - 1),
    }));
  };

  const handleDriverTripComplete = (trip) => {
    setDriverActiveTrip(null);
    setDriverTripHistory(prev => [
      {
        ...trip,
        status: 'completed',
        completedAt: trip.completedAt || formatStamp(),
        payout: trip.payout || 5,
      },
      ...prev,
    ]);
    setDriverProfile(prev => ({
      ...prev,
      earnings: Number((prev.earnings + (trip.payout || 5)).toFixed(2)),
      completedTrips: prev.completedTrips + 1,
    }));
    addNotification('Trip complete', `${trip.rider} has been dropped off and the payout was saved.`, 'success');
    setTab('earnings');
  };

  const handleUpdateRole = (role) => {
    setUser(current => current ? { ...current, role } : current);
    setTab('home');
    addNotification(
      role === 'driver' ? 'Driver mode enabled' : 'Rider mode enabled',
      role === 'driver' ? 'The app now shows driver tools and trip management.' : 'The app is back on the rider booking flow.',
      'info'
    );
  };

  const handleLogout = () => {
    setUser(null);
    setPaymentMethod(null);
    setActiveRide(null);
    setReviewRide(null);
    setDriverActiveTrip(null);
    setScreen('onboarding');
    setTab('home');
    addNotification('Signed out', 'Your local session has ended on this device.', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(204,0,51,0.14), transparent 30%), linear-gradient(180deg, #f7f3f4 0%, #f3f4f6 100%)', padding: '0 16px', fontFamily: FONTS.body }}>
      <style>{GLOBAL_CSS}</style>
      <div className="app-shell" style={{ maxWidth: '430px', margin: '0 auto', background: C.offWhite, minHeight: '100vh', position: 'relative', fontFamily: FONTS.body }}>

        {/* Splash */}
        {splash && <SplashScreen onDone={() => setSplash(false)}/>}

        {/* Auth flow */}
        {!splash && screen === 'onboarding' && (
          <OnboardingScreen onLogin={() => setScreen('login')} onSignup={() => setScreen('signup')}/>
        )}
        {!splash && screen === 'login' && (
          <LoginScreen onBack={() => setScreen('onboarding')} onSuccess={handleLoginSuccess}/>
        )}
        {!splash && screen === 'signup' && (
          <SignupScreen onBack={() => setScreen('onboarding')} onSuccess={handleSignupSuccess}/>
        )}
        {!splash && screen === 'verification' && (
          <VerificationScreen user={user} onSkip={() => setScreen('app')}/>
        )}

        {/* Main App */}
        {!splash && screen === 'app' && (
          <>
            {showRiderLiveTrip && (
              <ActiveRideScreen
                ride={activeRide}
                onComplete={handleRideComplete}
                onCreateSupportTicket={createSupportTicket}
                onNotify={addNotification}
                onBack={() => setTab('home')}
              />
            )}

            {showDriverLiveTrip && (
              <ActiveDriverTripScreen
                trip={driverActiveTrip}
                onComplete={handleDriverTripComplete}
                onCreateSupportTicket={createSupportTicket}
                onNotify={addNotification}
                onBack={() => setTab('home')}
              />
            )}

            {showReviewScreen && (
              <ReviewScreen ride={reviewRide} onDone={handleReviewDone} onBack={() => setTab('home')}/>
            )}

            {!showRiderLiveTrip && !showReviewScreen && !showDriverLiveTrip && (
              <>
                <div style={{ paddingBottom: '80px' }}>
                  {appRole === 'rider' && tab === 'home' && (
                    <HomeScreen
                      user={user}
                      paymentMethod={paymentMethod}
                      notifications={notifications}
                      savedPlaces={savedPlaces}
                      onAddSavedPlace={addSavedPlace}
                      onCreateSupportTicket={createSupportTicket}
                      onMarkNotificationsRead={markNotificationsRead}
                      onPaymentMethodSave={setPaymentMethod}
                      onStartRide={handleRideStart}
                    />
                  )}
                  {appRole === 'rider' && tab === 'food' && (
                    <FoodScreen
                      paymentMethod={paymentMethod}
                      onPaymentMethodSave={setPaymentMethod}
                    />
                  )}
                  {appRole === 'rider' && tab === 'buses' && <BusScreen/>}
                  {appRole === 'rider' && tab === 'rides' && (
                    <RidesScreen
                      activeRide={activeRide}
                      rideHistory={rideHistory}
                      onBook={() => setTab('home')}
                    />
                  )}
                  {appRole === 'driver' && tab === 'home' && (
                    <DriverHomeScreen
                      user={user}
                      driverProfile={driverProfile}
                      driverRequests={driverRequests}
                      driverActiveTrip={driverActiveTrip}
                      driverTripHistory={driverTripHistory}
                      notifications={notifications}
                      onMarkNotificationsRead={markNotificationsRead}
                      onAcceptRequest={requestId => handleDriverRequestUpdate(requestId, 'accepted')}
                      onDeclineRequest={requestId => handleDriverRequestUpdate(requestId, 'declined')}
                      onUpdateDriverProfile={setDriverProfile}
                      onCreateSupportTicket={createSupportTicket}
                      onOpenTrips={() => setTab('rides')}
                    />
                  )}
                  {appRole === 'driver' && tab === 'rides' && (
                    <DriverTripsScreen
                      driverActiveTrip={driverActiveTrip}
                      driverTripHistory={driverTripHistory}
                    />
                  )}
                  {appRole === 'driver' && tab === 'earnings' && (
                    <DriverEarningsScreen
                      driverProfile={driverProfile}
                      driverTripHistory={driverTripHistory}
                      driverRequests={driverRequests}
                    />
                  )}
                  {tab === 'profile' && (
                    <ProfileScreen
                      user={user}
                      rideHistory={rideHistory}
                      driverTripHistory={driverTripHistory}
                      notifications={notifications}
                      paymentMethod={paymentMethod}
                      savedPlaces={savedPlaces}
                      supportTickets={supportTickets}
                      driverProfile={driverProfile}
                      driverRequests={driverRequests}
                      onCreateSupportTicket={createSupportTicket}
                      onResolveSupportTicket={resolveSupportTicket}
                      onUpdateDriverProfile={setDriverProfile}
                      onUpdateDriverRequest={handleDriverRequestUpdate}
                      onPaymentMethodSave={setPaymentMethod}
                      onUpdateRole={handleUpdateRole}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
                <BottomNav active={tab} onChange={setTab} role={appRole}/>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
