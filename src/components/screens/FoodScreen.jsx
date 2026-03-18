import { useState } from 'react';
import { Btn, Stars, Tag, BackBtn } from '../ui';
import SecureCheckoutSheet from '../payments/SecureCheckoutSheet';
import { C, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { CAMPUSES, RESTAURANTS, MENU_ITEMS } from '../../constants/data';
import { getPaymentMethodShortLabel, getPaymentMethodTitle } from '../../utils/payments';

function MenuScreen({ restaurant, paymentMethod, onPaymentMethodSave, onBack }) {
  const [cart, setCart] = useState({});
  const [ordered, setOrdered] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const add = id => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = id => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });
  const total = Object.entries(cart).reduce((s, [id, q]) => s + (MENU_ITEMS.find(m => m.id === id)?.price || 0) * q, 0);
  const count = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartSummary = Object.entries(cart)
    .map(([id, qty]) => {
      const item = MENU_ITEMS.find(entry => entry.id === id);
      return item ? `${qty}× ${item.name}` : null;
    })
    .filter(Boolean);

  if (ordered) return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
      <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ fontSize: '24px', fontWeight: '900', color: C.gray800, margin: '0 0 6px', fontFamily: FONTS.body }}>Order Placed!</h2>
      <p style={{ color: C.gray400, fontSize: '14px', margin: '0 0 16px' }}>from {restaurant.name}</p>
      <span style={{ padding: '6px 16px', background: '#E8F8F0', color: C.success, border: `1px solid ${C.success}30`, borderRadius: RADIUS.full, fontSize: '13px', fontWeight: '700' }}>⏱ Est. {restaurant.time}</span>
      <p style={{ color: C.gray400, fontSize: '13px', margin: '20px 0 24px', lineHeight: '1.6' }}>Your food is being prepared. You'll receive an SMS when your order is ready.</p>
      <Btn onClick={() => { setOrdered(false); setCart({}); onBack(); }} style={{ maxWidth: '240px' }}>Back to Restaurants</Btn>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column' }}>
      {showCheckout && (
        <SecureCheckoutSheet
          title="Secure Food Checkout"
          amount={total}
          description={`${restaurant.name} order`}
          summaryItems={[
            ['Items', `${count} selected`],
            ['Ready in', restaurant.time],
            ['Campus', CAMPUSES.find(c => c.id === restaurant.campus)?.name || 'Rutgers'],
          ]}
          savedMethod={paymentMethod}
          onSaveMethod={onPaymentMethodSave}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            setOrdered(true);
          }}
          submitLabel="Place Secure Order"
        />
      )}

      {/* Header */}
      <div style={{ padding: '56px 20px 16px', borderBottom: `1px solid ${C.gray100}`, background: C.white }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <BackBtn onClick={onBack}/>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: C.gray800, fontFamily: FONTS.body }}>{restaurant.emoji} {restaurant.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stars rating={restaurant.rating} size={11}/>
              <span style={{ fontSize: '11px', color: C.gray400 }}>·</span>
              <span style={{ fontSize: '11px', color: C.gray400 }}>{restaurant.time}</span>
              <span style={{ fontSize: '11px', color: C.gray400 }}>·</span>
              <span style={{ fontSize: '11px', color: C.gray500 }}>{restaurant.price}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: RADIUS.xl, background: C.gray50, border: `1px solid ${C.gray100}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.gray500 }}>Secure checkout</p>
              <p style={{ margin: 0, fontSize: '14px', color: C.gray800, fontWeight: '700' }}>
                {paymentMethod ? getPaymentMethodTitle(paymentMethod) : 'No saved payment method yet'}
              </p>
            </div>
            <span style={{ padding: '6px 10px', borderRadius: RADIUS.md, background: C.white, border: `1px solid ${C.gray200}`, fontSize: '11px', fontWeight: '700', color: C.gray600 }}>
              🔐 Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, padding: '0 20px', paddingBottom: count > 0 ? '110px' : '40px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: C.gray400, letterSpacing: '1px', textTransform: 'uppercase', margin: '16px 0 12px' }}>Menu</p>
        {MENU_ITEMS.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 0', borderBottom: `1px solid ${C.gray100}` }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: C.gray800 }}>{item.name}</p>
                {item.popular && <Tag>Popular</Tag>}
              </div>
              <p style={{ margin: '2px 0 4px', fontSize: '12px', color: C.gray400, lineHeight: '1.4' }}>{item.desc}</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.gray800 }}>${item.price.toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {cart[item.id] > 0 && (
                <>
                  <button onClick={() => remove(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.gray100, border: `1px solid ${C.gray200}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: C.gray600 }}>−</button>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: C.gray800, minWidth: '16px', textAlign: 'center' }}>{cart[item.id]}</span>
                </>
              )}
              <button onClick={() => add(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.red, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: C.white, fontWeight: '700', boxShadow: SHADOW.red }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart bar */}
      {count > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '0 16px' }}>
          <button onClick={() => setShowCheckout(true)} style={{ width: '100%', padding: '15px 20px', borderRadius: RADIUS.lg, background: C.red, border: 'none', cursor: 'pointer', fontFamily: FONTS.body, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: SHADOW.red }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', color: C.white }}>{count}</div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: C.white }}>Review & Pay</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: C.white }}>${total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {count > 0 && !showCheckout && (
        <div style={{ position: 'fixed', bottom: '148px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '0 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.sm, padding: '12px 14px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.gray500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Cart Preview</p>
            <p style={{ margin: 0, fontSize: '12px', color: C.gray700, lineHeight: '1.5' }}>{cartSummary.slice(0, 2).join(' • ')}{cartSummary.length > 2 ? ` • +${cartSummary.length - 2} more` : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FoodScreen({ paymentMethod, onPaymentMethodSave }) {
  const [campus, setCampus] = useState('all');
  const [restaurant, setRestaurant] = useState(null);

  const filtered = campus === 'all' ? RESTAURANTS : RESTAURANTS.filter(r => r.campus === campus);
  if (restaurant) {
    return (
      <MenuScreen
        restaurant={restaurant}
        paymentMethod={paymentMethod}
        onPaymentMethodSave={onPaymentMethodSave}
        onBack={() => setRestaurant(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite }}>
      {/* Header */}
      <div style={{ background: C.white, padding: '56px 20px 20px', borderBottom: `1px solid ${C.gray100}` }}>
        <h1 style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '900', color: C.gray800, fontFamily: FONTS.body }}>Campus Eats 🍔</h1>
        <p style={{ margin: 0, fontSize: '13px', color: C.gray400 }}>Order from restaurants near Rutgers</p>
        <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            'Fast pickup windows',
            paymentMethod ? `Saved ${getPaymentMethodShortLabel(paymentMethod)}` : 'Add Apple Pay, Google Pay, or card at checkout',
            'Secure checkout flow',
          ].map(item => (
            <span key={item} style={{ padding: '6px 10px', borderRadius: RADIUS.full, background: C.gray50, border: `1px solid ${C.gray100}`, fontSize: '11px', color: C.gray600, fontWeight: '700' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Campus filter */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.gray100}`, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0', padding: '0 20px', minWidth: 'max-content' }}>
          {[{ id: 'all', name: 'All' }, ...CAMPUSES.map(c => ({ id: c.id, name: c.name.split(' ')[0] }))].map(c => (
            <button key={c.id} onClick={() => setCampus(c.id)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${campus === c.id ? C.red : 'transparent'}`, color: campus === c.id ? C.red : C.gray500, fontSize: '13px', fontWeight: campus === c.id ? '700' : '500', cursor: 'pointer', fontFamily: FONTS.body, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{c.name}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍽️</div>
            <p style={{ color: C.gray400 }}>No restaurants on this campus yet</p>
          </div>
        ) : filtered.map(r => {
          const cp = CAMPUSES.find(c => c.id === r.campus);
          return (
            <div key={r.id} onClick={() => setRestaurant(r)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: C.white, border: `1px solid ${C.gray100}`, borderRadius: RADIUS.xl, marginBottom: '10px', cursor: 'pointer', boxShadow: SHADOW.sm }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: C.redFaint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{r.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: C.gray800 }}>{r.name}</p>
                  {r.popular && <Tag>⭐ Popular</Tag>}
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.gray400 }}>{r.cuisine}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Stars rating={r.rating} size={10}/>
                  <span style={{ fontSize: '11px', color: C.gray400 }}>·</span>
                  <span style={{ fontSize: '11px', color: C.gray500 }}>⏱ {r.time}</span>
                  <span style={{ fontSize: '11px', color: C.gray400 }}>·</span>
                  <span style={{ fontSize: '11px', color: C.gray400 }}>{r.price}</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gray300} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
