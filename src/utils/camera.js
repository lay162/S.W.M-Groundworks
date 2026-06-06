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

export function redirectToHttpsIfNeeded() {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname, pathname, search, hash } = window.location;
  if (protocol !== 'http:') return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.github.io')) return false;
  window.location.replace(`https://${hostname}${pathname}${search}${hash}`);
  return true;
}

export function isLikelyInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp/i.test(ua);
}

export function isSamsungInternet() {
  if (typeof navigator === 'undefined') return false;
  return /SamsungBrowser/i.test(navigator.userAgent || '');
}

const CONSTRAINT_ATTEMPTS = [
  { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
  { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
  { video: { facingMode: { ideal: 'environment' } }, audio: false },
  { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
  { video: true, audio: false },
];

export async function requestCameraStream() {
  if (redirectToHttpsIfNeeded()) {
    return new Promise(() => {});
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
      if (err?.name === 'NotSupportedError' || err?.name === 'SecurityError') {
        if (window.location.protocol === 'http:') {
          const insecure = new Error('Camera requires HTTPS.');
          insecure.code = 'INSECURE';
          throw insecure;
        }
      }
    }
  }

  throw lastError || new Error('Camera could not start.');
}

export function cameraErrorMessage(err) {
  if (isLikelyInAppBrowser()) {
    return 'Open this page in Samsung Internet, Chrome or Safari — in-app browsers (Facebook, Instagram, etc.) block the camera. Tap ⋯ → Open in browser.';
  }
  if (err?.code === 'INSECURE' || (err?.name === 'SecurityError' && window.location.protocol === 'http:')) {
    return 'Switching to secure connection… If this stays, type https://swm-groundworks.co.uk in the address bar (not http).';
  }
  if (err?.code === 'UNSUPPORTED' || err?.name === 'NotSupportedError') {
    return 'Camera not available here. Update Samsung Internet from the Galaxy Store, then open https://swm-groundworks.co.uk and tap OPEN CAMERA.';
  }
  if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
    if (isSamsungInternet()) {
      return 'Camera blocked. Samsung Internet → ⋮ menu → Settings → Sites and downloads → swm-groundworks.co.uk → allow Camera. Then tap OPEN CAMERA again.';
    }
    return 'Camera permission blocked. Allow Camera for this site in your browser settings, then tap OPEN CAMERA again.';
  }
  if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
    return 'No camera found on this device.';
  }
  return 'Camera could not start. Tap OPEN CAMERA again.';
}
