/**
 * Cross-browser rear-camera access for mobile Safari, Chrome, Samsung Internet, Firefox, etc.
 */

function ensureGetUserMedia() {
  if (typeof navigator === 'undefined') return null;

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {};
  }

  if (!navigator.mediaDevices.getUserMedia) {
    const legacy =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (legacy) {
      navigator.mediaDevices.getUserMedia = (constraints) =>
        new Promise((resolve, reject) => legacy.call(navigator, constraints, resolve, reject));
    }
  }

  return navigator.mediaDevices?.getUserMedia ?? null;
}

export function isCameraApiAvailable() {
  return Boolean(ensureGetUserMedia());
}

export function isSecureCameraContext() {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
}

export function isLikelyInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp/i.test(ua);
}

const CONSTRAINT_ATTEMPTS = [
  { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
  { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
  { video: { facingMode: { ideal: 'environment' } }, audio: false },
  { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
  { video: true, audio: false },
];

export async function requestCameraStream() {
  if (!isSecureCameraContext()) {
    const err = new Error('Camera requires HTTPS.');
    err.code = 'INSECURE';
    throw err;
  }

  const getUserMedia = ensureGetUserMedia();
  if (!getUserMedia) {
    const err = new Error('Camera API not available.');
    err.code = 'UNSUPPORTED';
    throw err;
  }

  let lastError;
  for (const constraints of CONSTRAINT_ATTEMPTS) {
    try {
      return await getUserMedia.call(navigator.mediaDevices, constraints);
    } catch (err) {
      lastError = err;
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        throw err;
      }
      if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        throw err;
      }
    }
  }

  throw lastError || new Error('Camera could not start.');
}

export function cameraErrorMessage(err) {
  if (isLikelyInAppBrowser()) {
    return 'Open this page in Safari or Chrome — in-app browsers (Facebook, Instagram, etc.) often block the camera. Tap the ⋯ menu → Open in browser.';
  }
  if (err?.code === 'INSECURE') {
    return 'Camera needs a secure connection. Use https://swm-groundworks.co.uk';
  }
  if (err?.code === 'UNSUPPORTED' || err?.name === 'NotSupportedError') {
    return 'Camera not available here. On your phone, open https://swm-groundworks.co.uk in Safari or Chrome and tap OPEN CAMERA.';
  }
  if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
    return 'Camera permission blocked. In phone Settings → Safari/Chrome → allow Camera for this site, then tap OPEN CAMERA again.';
  }
  if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
    return 'No camera found on this device.';
  }
  return 'Camera could not start. Tap OPEN CAMERA again or try Safari/Chrome on your phone.';
}
