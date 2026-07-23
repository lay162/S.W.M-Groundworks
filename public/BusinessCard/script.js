function getCardUrl() {
  // Prefer canonical URL without query/hash
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  return url.toString();
}

function openModal(view) {
  const modal = document.getElementById('modal');
  const copyView = document.getElementById('copyView');
  const qrView = document.getElementById('qrView');
  if (!modal || !copyView || !qrView) return;

  modal.classList.add('open');
  copyView.classList.toggle('active', view === 'copy');
  qrView.classList.toggle('active', view === 'qr');

  if (view === 'qr') {
    generateQr();
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  const copyView = document.getElementById('copyView');
  const qrView = document.getElementById('qrView');
  if (!modal || !copyView || !qrView) return;

  modal.classList.remove('open');
  copyView.classList.remove('active');
  qrView.classList.remove('active');
}

async function copyUrl() {
  const text = getCardUrl();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }

  const btn = document.getElementById('copyURL');
  if (!btn) return;
  const prev = btn.textContent;
  btn.textContent = 'Copied';
  setTimeout(() => {
    btn.textContent = prev;
  }, 1200);
}

function nativeShare() {
  const url = getCardUrl();
  const payload = {
    title: 'S.W.M Groundworks — Business Card',
    text: 'S.W.M Groundworks — Business Card',
    url,
  };

  // Use native share when available; otherwise show copy modal.
  if (navigator.share) {
    navigator.share(payload).catch(() => {
      openModal('copy');
    });
    return;
  }

  openModal('copy');
}

let qrRenderedFor = null;
function generateQr() {
  const container = document.getElementById('qr');
  if (!container) return;

  const url = getCardUrl();
  if (qrRenderedFor === url) return;
  qrRenderedFor = url;

  container.innerHTML = '';

  // qrcode.min.js exposes global QRCode
  // eslint-disable-next-line no-undef
  new QRCode(container, {
    text: url,
    width: 220,
    height: 220,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

function getLiveCardData() {
  if (window.SWMDBC && typeof window.SWMDBC.getDefaultCardData === 'function') {
    return window.SWMDBC.getDefaultCardData();
  }
  return {
    fullName: 'S.W.M Groundworks',
    company: 'S.W.M Groundworks',
    email: 'info@swm-groundworks.co.uk',
    phone: '+447375996207',
    website: 'https://swm-groundworks.co.uk/',
    cardUrl: getCardUrl(),
  };
}

function initNfc() {
  const cardData = getLiveCardData();
  if (window.SWMNFCRuntime && typeof window.SWMNFCRuntime.initLiveCard === 'function') {
    window.SWMNFCRuntime.initLiveCard(cardData);
  }
}

function init() {
  const share = document.getElementById('share');
  const showQR = document.getElementById('showQR');
  const closeBtn = document.getElementById('close');
  const copyBtn = document.getElementById('copyURL');
  const modal = document.getElementById('modal');
  const vcard = document.getElementById('vcard');

  if (share) {
    share.addEventListener('click', (e) => {
      e.preventDefault();
      // Prefer NFC share when Web NFC is available; otherwise keep existing share flow.
      if ('NDEFReader' in window && window.SWMNFCRuntime) {
        window.SWMNFCRuntime.shareCard(getLiveCardData()).catch(() => {
          // User cancelled NFC, no tag nearby, or write failed — fall back cleanly.
          nativeShare();
        });
        return;
      }
      nativeShare();
    });
  }
  if (showQR) showQR.addEventListener('click', (e) => (e.preventDefault(), openModal('qr')));
  if (closeBtn) closeBtn.addEventListener('click', (e) => (e.preventDefault(), closeModal()));
  if (copyBtn) copyBtn.addEventListener('click', (e) => (e.preventDefault(), copyUrl()));

  // Keep Save Contact working; also log NFC tap_save when runtime is present.
  if (vcard) {
    vcard.addEventListener('click', () => {
      if (window.SWMNFCRuntime && typeof window.SWMNFCRuntime.logTap === 'function') {
        window.SWMNFCRuntime.logTap('tap_save', getLiveCardData());
      }
    });
  }

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  initNfc();
}

document.addEventListener('DOMContentLoaded', init);

