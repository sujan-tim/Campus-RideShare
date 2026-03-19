# Release Build Commands

These commands assume the current bundle ID / package name is `com.ruride.app`.

## Shared

Build the web app:

```bash
npm run build
```

Regenerate native icon and splash assets:

```bash
npm run mobile:assets
```

Sync web assets to native projects:

```bash
npx cap sync
```

## Android Release

1. Create a real release keystore.
2. Copy the template:

```bash
cp android/keystore.properties.example android/keystore.properties
```

3. Fill in real values in `android/keystore.properties`.
4. Build and sync:

```bash
npm run build
npx cap sync android
```

5. Build the Play Store bundle:

```bash
cd android
./gradlew bundleRelease
```

Output:

- `android/app/build/outputs/bundle/release/app-release.aab`

## iOS Release

First-time machine setup:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

Then:

```bash
npm run build
npx cap sync ios
```

Open the workspace:

```bash
npm run mobile:ios
```

In Xcode:

1. Select the `App` target
2. Set your Apple team
3. Confirm bundle identifier
4. Choose `Any iOS Device (arm64)`
5. Product -> Archive
6. Distribute through App Store Connect

Optional CLI archive flow after signing is configured:

```bash
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/RUride.xcarchive \
  archive
```

Optional CLI export using the example plist after replacing the team ID:

```bash
xcodebuild \
  -exportArchive \
  -archivePath build/RUride.xcarchive \
  -exportPath build/ios-release \
  -exportOptionsPlist ios/App/ExportOptions.plist.example
```

## Submission Order

1. Finalize privacy policy URL
2. Finalize support email and support website
3. Capture screenshots
4. Complete Apple privacy answers
5. Complete Google Play Data Safety
6. Upload `.aab` to Play Console
7. Upload iOS archive to App Store Connect
8. Complete listing metadata and review notes
