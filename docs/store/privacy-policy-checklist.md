# Privacy Policy And Data Declaration Checklist

This is a launch checklist, not legal advice. Final declarations must match the shipped production app and every third-party SDK in it.

## App Store Privacy

Apple requires:

- A working Privacy Policy URL
- Accurate app privacy answers in App Store Connect for all data types the app collects

Review these RUride data areas before declaring:

- Contact info
  - Name
  - Email
  - Phone number
- Location
  - Precise location for rider or driver map features
- User content
  - Student verification uploads if enabled
  - Support messages if added later
- Financial info
  - Payment method details if processed directly
  - If using Stripe or another processor, review exactly what the app and SDK collect
- Identifiers
  - User IDs
  - Device/session identifiers
- Usage data
  - Ride history
  - Search, trip, and bus tracking interactions
- Diagnostics
  - Crash reporting
  - Performance monitoring

Before submitting Apple privacy answers:

- Confirm what is collected by your backend
- Confirm what is collected by analytics, crash, auth, payment, and map SDKs
- Confirm whether data is linked to the user
- Confirm whether any data is used for tracking

## Google Play Data Safety

Google requires:

- A privacy policy
- A completed Data Safety form for apps published on Google Play, including closed, open, or production tracks
- Declarations that include third-party SDK behavior

Review these questions carefully:

- Does the app collect location?
- Does the app share data with third parties?
- Is data encrypted in transit?
- Can users request deletion of their account and data?
- What user data is optional versus required?
- Are payments handled directly or through a processor SDK?
- Are student ID uploads or profile images stored?

## RUride Final Checks

- Verify every permission in Android and iOS matches a real feature
- Host the privacy policy on a stable public URL
- Add account deletion instructions or an in-app deletion flow if accounts are persistent
- Remove any demo-only collection that is not present in production
- Re-audit after adding analytics, push, Stripe, auth, or transit SDKs
