import { useState, useRef } from 'react';
import { Btn, Input, Select, Check, BackBtn, Divider } from '../ui';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { SCHOOLS, TERMS_SECTIONS, CAMPUSES } from '../../constants/data';

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
export function OnboardingScreen({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Red hero section */}
      <div style={{
        background: C.red, flex: '0 0 auto',
        padding: '80px 32px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle circles */}
        {[160, 260, 360].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: s, height: s, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          }}/>
        ))}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', lineHeight: 1, marginBottom: '18px' }}>🚗</div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: '54px', fontWeight: '900', color: C.white, letterSpacing: '-2px', lineHeight: 1, margin: '0 0 8px' }}>
            RU<span style={{ fontStyle: 'italic' }}>Ride</span>
          </h1>
          <p style={{ fontFamily: FONTS.mono, fontSize: '11px', color: 'rgba(255,255,255,0.75)', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
            Campus Rideshare · Rutgers Only
          </p>
        </div>
      </div>

      {/* White content */}
      <div style={{ flex: 1, padding: '32px 24px 48px', display: 'flex', flexDirection: 'column' }}>
        {/* Features */}
        <div style={{ marginBottom: '32px' }}>
          {[
            { icon: '🔒', title: 'NetID Verified Only', desc: 'Exclusively for enrolled Rutgers students' },
            { icon: '💰', title: 'Flat $5 Fare', desc: 'Any campus destination, no surge pricing' },
            { icon: '📍', title: 'Live GPS Tracking', desc: 'See drivers nearby in real time' },
            { icon: '⚡', title: '5 Rutgers Campuses', desc: 'Busch, College Ave, Douglass, Cook, Livingston' },
          ].map(({ icon, title, desc }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i < 3 ? `1px solid ${C.gray100}` : 'none' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.redFaint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{icon}</div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Btn onClick={onLogin} size="lg" style={{ marginBottom: '10px' }}>Sign In with NetID</Btn>
          <Btn onClick={onSignup} variant="secondary" size="lg">Create Account</Btn>
          <p style={{ textAlign: 'center', fontSize: '11px', color: C.gray400, marginTop: '14px', lineHeight: '1.6' }}>
            Available exclusively to Rutgers University students.<br />
            Powered by Rutgers CAS authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export function LoginScreen({ onBack, onSuccess }) {
  const [step, setStep] = useState('creds');
  const [netid, setNetid] = useState('');
  const [pass, setPass] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const submitCreds = () => {
    const e = {};
    if (!netid.trim()) e.netid = 'NetID is required';
    if (!pass.trim()) e.pass = 'Password is required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => {
      const c = String(Math.floor(100000 + Math.random() * 900000));
      setDemoCode(c); setLoading(false); setStep('2fa');
    }, 1400);
  };

  const submit2FA = () => {
    if (code.length < 6) { setErrors({ code: 'Enter all 6 digits' }); return; }
    if (code !== demoCode) { setErrors({ code: `Wrong code. Demo: ${demoCode}` }); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess({ netid }); }, 900);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '56px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${C.gray100}` }}>
        <BackBtn onClick={onBack}/>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>{step === 'creds' ? 'Sign In' : 'Verify Identity'}</h2>
          <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>{step === 'creds' ? 'Use your Rutgers NetID' : 'Enter the SMS code sent to your phone'}</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 20px' }}>
        {step === 'creds' && (
          <>
            {/* CAS badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: C.redFaint, border: `1px solid rgba(204,0,51,0.15)`, borderRadius: RADIUS.md, marginBottom: '24px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🏛️</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: '700', color: C.red }}>Rutgers CAS Authentication</p>
                <p style={{ margin: 0, fontSize: '11px', color: C.redDark }}>cas.rutgers.edu · Secure SSL</p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.success }}>🔒 Secure</span>
            </div>
            <Input label="NetID" value={netid} onChange={setNetid} placeholder="e.g. ab123" icon="👤" error={errors.netid}/>
            <Input label="Password" type="password" value={pass} onChange={setPass} placeholder="CAS password" icon="🔑" error={errors.pass}/>
            <Btn onClick={submitCreds} disabled={loading} size="lg" style={{ marginTop: '8px' }}>
              {loading ? 'Authenticating…' : 'Continue →'}
            </Btn>
          </>
        )}

        {step === '2fa' && (
          <>
            <div style={{ textAlign: 'center', padding: '28px 20px', background: C.gray50, borderRadius: RADIUS.xl, marginBottom: '24px', border: `1px solid ${C.gray100}` }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: C.gray800 }}>2-Step Verification</h3>
              <p style={{ margin: 0, fontSize: '13px', color: C.gray500, lineHeight: '1.6' }}>A 6-digit security code was sent to your registered phone number.</p>
            </div>

            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Verification Code</label>
            <input
              type="tel" maxLength={6} value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setErrors({}); }}
              placeholder="000000"
              style={{ width: '100%', padding: '16px', background: C.white, border: `2px solid ${errors.code ? C.red : C.gray200}`, borderRadius: RADIUS.md, color: C.gray800, fontSize: '28px', fontFamily: FONTS.mono, fontWeight: '700', textAlign: 'center', outline: 'none', letterSpacing: '10px', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            />
            {errors.code && <p style={{ fontSize: '12px', color: C.red, marginTop: '5px' }}>{errors.code}</p>}

            {demoCode && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#FFF8E7', border: '1px solid rgba(240,180,41,0.3)', borderRadius: RADIUS.md, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#8A6500' }}>Demo code: <strong style={{ fontFamily: FONTS.mono, letterSpacing: '3px' }}>{demoCode}</strong></p>
              </div>
            )}

            <Btn onClick={submit2FA} disabled={loading || code.length < 6} size="lg" style={{ marginTop: '16px' }}>
              {loading ? 'Verifying…' : 'Verify & Enter →'}
            </Btn>
            <button onClick={() => { const c = String(Math.floor(100000 + Math.random() * 900000)); setDemoCode(c); }} style={{ width: '100%', background: 'none', border: 'none', color: C.gray400, fontSize: '13px', cursor: 'pointer', padding: '12px', textDecoration: 'underline', fontFamily: FONTS.body }}>Resend Code</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export function SignupScreen({ onBack, onSuccess }) {
  const [step, setStep] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({ fullName: '', school: '', address: '', email: '', phone: '', password: '', agreeTerms: false, agreePrivacy: false });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = 'Full name required';
      if (!form.school) e.school = 'Please select your school';
    }
    if (step === 1) {
      if (!form.email) e.email = 'Email required';
      else if (!form.email.includes('@rutgers.edu') && !form.email.includes('@scarletmail.rutgers.edu')) e.email = 'Must use @rutgers.edu or @scarletmail.rutgers.edu';
      if (!form.phone) e.phone = 'Phone number required';
      if (!form.password || form.password.length < 8) e.password = 'Min. 8 characters';
    }
    if (step === 2) {
      if (!form.agreeTerms) e.terms = 'Required';
      if (!form.agreePrivacy) e.privacy = 'Required';
    }
    return e;
  };

  const next = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (step < 2) setStep(s => s + 1);
    else onSuccess(form);
  };

  const STEPS = ['Personal Info', 'Contact Details', 'Terms & Privacy'];

  if (showTerms) return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '56px 20px 18px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${C.gray100}` }}>
        <BackBtn onClick={() => setShowTerms(false)}/>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>Terms & Conditions</h2>
      </div>
      <div style={{ flex: 1, padding: '20px 20px 40px', overflowY: 'auto' }}>
        {TERMS_SECTIONS.map(([title, body]) => (
          <div key={title} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${C.gray100}` }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '700', color: C.gray800 }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: C.gray500, lineHeight: '1.65' }}>{body}</p>
          </div>
        ))}
        <Btn onClick={() => setShowTerms(false)}>I've Read the Terms ✓</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '56px 20px 18px', borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <BackBtn onClick={step === 0 ? onBack : () => setStep(s => s - 1)}/>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>{STEPS[step]}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>Step {step + 1} of 3</p>
          </div>
        </div>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= step ? C.red : C.gray200, transition: 'background 0.3s', boxShadow: i === step ? `0 0 8px rgba(204,0,51,0.4)` : 'none' }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 20px 40px', overflowY: 'auto' }}>
        {step === 0 && (
          <>
            <Input label="Full Legal Name" value={form.fullName} onChange={v => set('fullName', v)} placeholder="Jane Smith" icon="👤" error={errors.fullName}/>
            <Select label="School / College" value={form.school} onChange={v => set('school', v)} options={SCHOOLS} placeholder="Select your school"/>
            {errors.school && <p style={{ fontSize: '12px', color: C.red, marginTop: '-10px', marginBottom: '12px' }}>{errors.school}</p>}
            <Input label="Home Address" value={form.address} onChange={v => set('address', v)} placeholder="123 College Ave, New Brunswick, NJ" icon="🏠" hint="For accurate pickup suggestions"/>
          </>
        )}

        {step === 1 && (
          <>
            <Input label="Rutgers Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="netid@rutgers.edu" icon="📧" error={errors.email} hint={!errors.email ? 'Use @rutgers.edu or @scarletmail.rutgers.edu' : ''}/>
            <Input label="Phone Number" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="+1 (732) 555-0000" icon="📱" error={errors.phone} hint={!errors.phone ? 'For 2-step verification' : ''}/>
            <Input label="Password" type="password" value={form.password} onChange={v => set('password', v)} placeholder="Minimum 8 characters" icon="🔑" error={errors.password}/>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', padding: '24px', background: C.redFaint, borderRadius: RADIUS.xl, marginBottom: '20px', border: `1px solid rgba(204,0,51,0.1)` }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '800', color: C.gray800 }}>Almost There!</h3>
              <p style={{ margin: 0, fontSize: '13px', color: C.gray500 }}>Review and accept our terms to join RUride.</p>
            </div>
            <Check checked={form.agreeTerms} onChange={() => set('agreeTerms', !form.agreeTerms)} label="I agree to the Terms & Conditions" sublabel="Tap to read" onSublabelClick={() => setShowTerms(true)}/>
            {errors.terms && <p style={{ fontSize: '12px', color: C.red, marginTop: '-6px', marginBottom: '8px' }}>{errors.terms}</p>}
            <Check checked={form.agreePrivacy} onChange={() => set('agreePrivacy', !form.agreePrivacy)} label="I agree to the Privacy Policy" sublabel="Your data is encrypted and never sold"/>
            {errors.privacy && <p style={{ fontSize: '12px', color: C.red, marginTop: '-6px', marginBottom: '8px' }}>{errors.privacy}</p>}
          </>
        )}

        <Btn onClick={next} size="lg" style={{ marginTop: '12px' }}>
          {step < 2 ? 'Continue →' : 'Create My Account 🎉'}
        </Btn>
      </div>
    </div>
  );
}

// ─── VERIFICATION ─────────────────────────────────────────────────────────────
export function VerificationScreen({ user, onSkip }) {
  const [uploaded, setUploaded] = useState(false);
  const ref = useRef();

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      {/* Red header */}
      <div style={{ background: C.red, padding: '56px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎓</div>
        <h2 style={{ fontFamily: FONTS.display, fontSize: '28px', fontWeight: '900', color: C.white, margin: '0 0 6px' }}>Verify Your Identity</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>Upload your Rutgers student ID card. Reviews complete in 1–4 hours.</p>
      </div>

      <div style={{ flex: 1, padding: '24px 20px 40px' }}>
        {/* User preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: C.gray50, borderRadius: RADIUS.lg, border: `1px solid ${C.gray100}`, marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: C.redFaint, border: `2px solid rgba(204,0,51,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '15px', color: C.gray800 }}>{user?.fullName || 'Student'}</p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>{user?.email || 'netid@rutgers.edu'}</p>
          </div>
          <span style={{ padding: '4px 10px', background: '#FFF8E7', color: '#8A6500', border: '1px solid rgba(240,180,41,0.3)', borderRadius: RADIUS.full, fontSize: '11px', fontWeight: '700' }}>🕐 Pending</span>
        </div>

        {/* Upload zone */}
        <input ref={ref} type="file" accept="image/*" onChange={() => setUploaded(true)} style={{ display: 'none' }}/>
        <div
          onClick={() => ref.current?.click()}
          style={{ border: `2px dashed ${uploaded ? C.success : C.gray300}`, borderRadius: RADIUS.xl, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', background: uploaded ? C.successFaint : C.gray50, transition: 'all 0.2s' }}
        >
          <div style={{ fontSize: '44px', marginBottom: '10px' }}>{uploaded ? '✅' : '📷'}</div>
          <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '16px', color: uploaded ? C.success : C.gray700 }}>{uploaded ? 'Student ID Uploaded!' : 'Tap to Upload Student ID'}</p>
          <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>{uploaded ? 'Awaiting admin review' : 'Front of your Rutgers ID card · JPG or PNG'}</p>
        </div>

        {uploaded && (
          <div style={{ padding: '14px', background: '#FFF8E7', border: '1px solid rgba(240,180,41,0.3)', borderRadius: RADIUS.lg, marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⏳</span>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#8A6500', fontSize: '13px' }}>Review In Progress</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#AA8800', lineHeight: '1.5' }}>You'll receive an email and SMS once approved. Most reviews complete in 1–4 hours.</p>
            </div>
          </div>
        )}

        <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: C.gray400, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: '12px', fontFamily: FONTS.body }}>
          [Demo] Skip verification →
        </button>
      </div>
    </div>
  );
}
