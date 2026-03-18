import { useState } from 'react';
import SplashScreen from './components/screens/SplashScreen';
import { OnboardingScreen, LoginScreen, SignupScreen, VerificationScreen } from './components/screens/AuthScreens';
import HomeScreen from './components/screens/HomeScreen';
import FoodScreen from './components/screens/FoodScreen';
import { RidesScreen, ProfileScreen } from './components/screens/ProfileScreens';
import { ActiveRideScreen, ReviewScreen } from './components/screens/RideScreens';
import { BottomNav } from './components/ui';
import { C, FONTS } from './constants/theme';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 0; }
  html, body { background: #F8F8F8; font-family: 'DM Sans', system-ui, sans-serif; }
  input::placeholder, textarea::placeholder { color: #AAAAAA; }
  select option { background: white; color: #1A1A1A; }
  @keyframes pulseDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

export default function App() {
  const [splash, setSplash] = useState(true);
  const [screen, setScreen] = useState('onboarding');
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [reviewRide, setReviewRide] = useState(null);

  const handleLoginSuccess = (auth) => {
    setUser({
      netid: auth.netid,
      fullName: 'Alex Johnson',
      school: 'School of Engineering (SOE)',
      email: `${auth.netid}@scarletmail.rutgers.edu`,
      phone: '+1 (732) 555-0123',
      address: '15 College Ave, New Brunswick, NJ 08901',
      role: 'rider',
    });
    setScreen('app');
  };

  const handleSignupSuccess = (form) => {
    setUser({ ...form, role: 'rider', verificationStatus: 'pending' });
    setScreen('verification');
  };

  const handleRideComplete = (ride) => {
    setActiveRide(null);
    setReviewRide(ride);
  };

  const handleReviewDone = () => {
    setReviewRide(null);
    setTab('home');
  };

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', background: C.offWhite, minHeight: '100vh', position: 'relative', fontFamily: FONTS.body }}>
      <style>{GLOBAL_CSS}</style>

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
          {/* Active ride — fullscreen overlay */}
          {activeRide && (
            <ActiveRideScreen ride={activeRide} onComplete={handleRideComplete}/>
          )}

          {/* Review — fullscreen overlay */}
          {reviewRide && !activeRide && (
            <ReviewScreen ride={reviewRide} onDone={handleReviewDone}/>
          )}

          {/* Normal tab content */}
          {!activeRide && !reviewRide && (
            <>
              <div style={{ paddingBottom: '80px' }}>
                {tab === 'home'    && <HomeScreen user={user} onStartRide={ride => setActiveRide(ride)}/>}
                {tab === 'food'    && <FoodScreen/>}
                {tab === 'rides'   && <RidesScreen onBook={() => setTab('home')}/>}
                {tab === 'profile' && <ProfileScreen user={user} onUpdateRole={role => setUser(u => ({ ...u, role }))}/>}
              </div>
              <BottomNav active={tab} onChange={setTab}/>
            </>
          )}
        </>
      )}
    </div>
  );
}
