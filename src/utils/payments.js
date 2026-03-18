export function isWalletMethod(method) {
  return method?.type === 'wallet';
}

export function getPaymentMethodTitle(method) {
  if (!method) return 'No payment method';
  if (isWalletMethod(method)) return method.displayName || method.brand || 'Digital Wallet';
  if (method.last4) return `${method.brand || 'Card'} ending in ${method.last4}`;
  return method.brand || 'Saved card';
}

export function getPaymentMethodShortLabel(method) {
  if (!method) return 'Add payment';
  if (isWalletMethod(method)) return method.displayName || method.brand || 'Wallet';
  if (method.last4) return `${method.brand || 'Card'} •${method.last4}`;
  return method.brand || 'Saved card';
}

export function getPaymentMethodSubtitle(method, fallbackName = 'RUride user') {
  if (!method) return 'No saved payment method';
  if (isWalletMethod(method)) return method.walletEmail || 'Tokenized device wallet';
  return `${method.cardholder || fallbackName}${method.expiry ? ` · expires ${method.expiry}` : ''}`;
}

export function getPaymentStorageLabel(method) {
  if (!method) return 'No saved token yet';
  if (isWalletMethod(method)) return `${method.displayName || 'Wallet'} device token`;
  return `Masked ${method.brand || 'card'} token`;
}
