import { useMemo, useState } from 'react';
import { Btn, Check, Sheet } from '../ui';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectBrand(number) {
  if (/^4/.test(number)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'AmEx';
  if (/^6/.test(number)) return 'Discover';
  return 'Card';
}

function Field({ label, value, onChange, placeholder, maxLength, type = 'text', error }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.gray500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%',
          padding: '13px 14px',
          background: C.white,
          border: `1.5px solid ${error ? C.red : C.gray200}`,
          borderRadius: RADIUS.md,
          color: C.gray800,
          fontSize: '14px',
          outline: 'none',
          fontFamily: FONTS.body,
          boxSizing: 'border-box',
        }}
      />
      {error && <p style={{ margin: '5px 0 0', fontSize: '11px', color: C.red }}>{error}</p>}
    </div>
  );
}

export default function SecureCheckoutSheet({
  title = 'Secure Checkout',
  amount,
  description,
  summaryItems = [],
  savedMethod = null,
  onSaveMethod,
  onClose,
  onSuccess,
  submitLabel = 'Pay Securely',
}) {
  const [useSavedMethod, setUseSavedMethod] = useState(Boolean(savedMethod));
  const [saveForFuture, setSaveForFuture] = useState(!savedMethod);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    cardholder: savedMethod?.cardholder || '',
    cardNumber: '',
    expiry: savedMethod?.expiry || '',
    cvv: '',
    zip: '',
  });

  const brand = useMemo(() => detectBrand(form.cardNumber.replace(/\s/g, '')), [form.cardNumber]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    if (useSavedMethod && savedMethod) return {};

    const nextErrors = {};
    const cardNumber = form.cardNumber.replace(/\s/g, '');
    const [monthRaw, yearRaw] = form.expiry.split('/');
    const month = Number(monthRaw);
    const year = Number(yearRaw);

    if (!form.cardholder.trim()) nextErrors.cardholder = 'Cardholder name is required';
    if (cardNumber.length < 15) nextErrors.cardNumber = 'Enter a valid card number';
    if (!monthRaw || !yearRaw || month < 1 || month > 12) nextErrors.expiry = 'Use MM/YY format';
    if (!nextErrors.expiry && yearRaw.length === 2) {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        nextErrors.expiry = 'Card has expired';
      }
    }
    if (form.cvv.replace(/\D/g, '').length < 3) nextErrors.cvv = 'Enter a valid security code';
    if (form.zip.replace(/\D/g, '').length < 5) nextErrors.zip = 'ZIP code is required';
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const cardNumber = form.cardNumber.replace(/\s/g, '');
      const nextMethod = useSavedMethod && savedMethod
        ? savedMethod
        : {
            brand,
            last4: cardNumber.slice(-4),
            expiry: form.expiry,
            cardholder: form.cardholder.trim(),
            token: `pm_demo_${Date.now().toString(36)}`,
          };

      if ((!useSavedMethod || !savedMethod) && saveForFuture) {
        onSaveMethod?.(nextMethod);
      }

      setProcessing(false);
      onSuccess?.({
        method: nextMethod,
        paymentStatus: 'authorized',
        amount,
        reference: `pay_${Date.now().toString(36)}`,
      });
    }, 1100);
  };

  return (
    <Sheet title={title} onClose={processing ? undefined : onClose}>
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', background: C.gray50, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.gray500 }}>Order Summary</p>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.gray800 }}>{description}</h3>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: RADIUS.lg, background: C.white, border: `1px solid ${C.gray200}`, boxShadow: SHADOW.sm }}>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: C.red }}>${amount.toFixed(2)}</p>
            </div>
          </div>
          {summaryItems.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '8px', fontSize: '12px', color: C.gray500 }}>
              <span>{label}</span>
              <span style={{ color: C.gray700, fontWeight: '600', textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(204,0,51,0.08), rgba(10,10,10,0.04))', borderRadius: RADIUS.xl, border: '1px solid rgba(204,0,51,0.12)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.sm }}>🔐</div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: C.gray800 }}>Protected Checkout</p>
              <p style={{ margin: 0, fontSize: '11px', color: C.gray500 }}>Encrypted card form with tokenized demo payment flow.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Card encrypted in browser', 'Saved method masked', 'Ready for backend processor'].map(item => (
              <span key={item} style={{ padding: '4px 10px', borderRadius: RADIUS.full, background: C.white, border: `1px solid ${C.gray200}`, fontSize: '10px', color: C.gray600, fontWeight: '700' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {savedMethod && (
          <div style={{ marginBottom: '16px' }}>
            <Check
              checked={useSavedMethod}
              onChange={() => setUseSavedMethod(prev => !prev)}
              label={`Use saved ${savedMethod.brand || 'card'} ending in ${savedMethod.last4}`}
              sublabel={`${savedMethod.cardholder} · expires ${savedMethod.expiry}`}
            />
          </div>
        )}

        {(!useSavedMethod || !savedMethod) && (
          <>
            <Field
              label="Cardholder Name"
              value={form.cardholder}
              onChange={value => setField('cardholder', value)}
              placeholder="Alex Johnson"
              error={errors.cardholder}
            />
            <Field
              label="Card Number"
              value={form.cardNumber}
              onChange={value => setField('cardNumber', formatCardNumber(value))}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              error={errors.cardNumber}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <Field
                label="Expiry"
                value={form.expiry}
                onChange={value => setField('expiry', formatExpiry(value))}
                placeholder="08/27"
                maxLength={5}
                error={errors.expiry}
              />
              <Field
                label="CVV"
                type="password"
                value={form.cvv}
                onChange={value => setField('cvv', value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                error={errors.cvv}
              />
              <Field
                label="ZIP"
                value={form.zip}
                onChange={value => setField('zip', value.replace(/\D/g, '').slice(0, 5))}
                placeholder="08901"
                maxLength={5}
                error={errors.zip}
              />
            </div>

            <div style={{ padding: '14px 16px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', color: C.gray500 }}>Detected network</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.gray800 }}>{brand}</p>
                </div>
                <div style={{ padding: '7px 10px', borderRadius: RADIUS.md, background: C.gray50, border: `1px solid ${C.gray200}`, fontFamily: FONTS.mono, fontSize: '12px', color: C.gray700 }}>
                  •••• {form.cardNumber.replace(/\s/g, '').slice(-4) || '----'}
                </div>
              </div>
            </div>

            <Check
              checked={saveForFuture}
              onChange={() => setSaveForFuture(prev => !prev)}
              label="Save this card for faster checkout"
              sublabel="Stored as a masked demo payment method in this app session"
            />
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <Btn onClick={onClose} variant="secondary" fullWidth={false} style={{ flex: 1 }} disabled={processing}>
            Cancel
          </Btn>
          <Btn onClick={handleSubmit} fullWidth={false} style={{ flex: 2 }} disabled={processing}>
            {processing ? 'Authorizing…' : `${submitLabel} →`}
          </Btn>
        </div>
      </div>
    </Sheet>
  );
}
