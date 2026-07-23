# S.W.M Android NFC Share (no stickers)

Companion app for **Android ↔ Android** tap sharing of the live Business Card.

The website alone cannot do phone-to-phone contactless (browser limit).  
This app makes **your phone the contactless card** (Host Card Emulation) so another Android can tap it and get a **notification / open the SWM card**.

## What you get

| Mode | What happens on tap |
|------|---------------------|
| **Tap n Share** | Other phone gets a notification and opens the Business Card URL |
| **Tap n Save** | Same + vCard payload so contact save is available from the card |
| **Tap n Swap** | Receive their card (notification) → this phone auto-switches to Share so they can tap yours back |

Same URL / `SWMNFC_` token pattern as `public/BusinessCard/`.

**No NFC stickers.** Phone backs together.

## Requirements

- Two Android phones with **NFC**
- This app installed on **both** (recommended for bulletproof results)
- NFC turned **ON**
- Notification permission allowed (for the popup)

## How to use (bulletproof)

1. **Phone A** → open app → pick Share / Save / Swap → tap **Share my card**
2. **Phone B** → open app → tap **Receive a card**
3. Hold the **backs** of the phones together (1–3 seconds)
4. Phone B shows a **notification** and opens https://swm-groundworks.co.uk/BusinessCard/

### Tap n Swap

1. B on **Receive**, A on **Share** → tap → B gets A’s card  
2. App on B flips to **Share** automatically  
3. A switches to **Receive** → tap again → A gets B’s card  

## Build & install

1. Install [Android Studio](https://developer.android.com/studio)
2. **Open** this folder: `swm-groundsworks/android-nfc-share`
3. Let Gradle sync
4. Plug in an Android phone (USB debugging on) **or** use an emulator with NFC (most emulators do **not** do real NFC — use real phones)
5. Click **Run**

To sideload a release APK later:

```text
./gradlew :app:assembleRelease
```

APK path: `app/build/outputs/apk/release/`

## Door / clock readers

While **Share my card** is active, the phone presents the same universal token / URL NDEF that readers can use (no Google/Apple Wallet required). Reader brands vary — test against your hardware.

## Honest limits

- **iPhone** cannot run this HCE share app the same way (Apple blocks this for third-party contactless card emulation like Pay).
- Website Chrome NFC remains useful for tags/readers; **phone↔phone notification** needs this app.
- Some OEM skins (Xiaomi/Huawei/etc.) need NFC “on”, screen unlocked, and this app in the foreground.

## Link with the website

Live card: https://swm-groundworks.co.uk/BusinessCard/  
Web NFC scripts stay in `public/BusinessCard/` — this Android app is the phone-to-phone layer.
