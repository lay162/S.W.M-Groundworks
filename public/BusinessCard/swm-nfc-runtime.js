/**
 * Unified NFC runtime — Tap n Share, Tap n Save, Tap n Swap on live cards.
 * Logs taps to localStorage; optional Apps Script when window.SWM_NFC_LOG_URL is set.
 */
(function (global) {
  'use strict';

  var scanActive = false;
  var activeCardData = null;
  var TAP_LOG_KEY = 'swm_nfc_tap_log';
  var activeReader = null;
  var scanAbort = null;
  var writeInFlight = false;

  function getPreference() {
    if (global.SWMDBC && global.SWMDBC.getNfcSharingPreference) {
      return global.SWMDBC.getNfcSharingPreference();
    }
    try {
      return JSON.parse(localStorage.getItem('swm_nfc_preferences') || '{}').sharingMethod || 'tap_n_share';
    } catch (e) {
      return 'tap_n_share';
    }
  }

  function getCardData() {
    return activeCardData || global.__swmLiveCardData || null;
  }

  function appendLocalTap(entry) {
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(TAP_LOG_KEY) || '[]');
    } catch (e) {
      list = [];
    }
    list.unshift(entry);
    if (list.length > 200) list = list.slice(0, 200);
    try {
      localStorage.setItem(TAP_LOG_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function logTap(readerType, cardData) {
    cardData = cardData || getCardData();
    if (!cardData) return;

    var payload = {
      type: 'nfc_tap',
      nfc_token: cardData.nfcToken,
      card_id: cardData.cardId,
      reader_id: 'DEVICE-NFC',
      reader_type: readerType,
      timestamp: new Date().toISOString(),
    };
    appendLocalTap(payload);

    var logUrl = global.SWM_NFC_LOG_URL || '';
    if (!logUrl) return;

    var body = Object.assign({}, payload, {
      secret: global.SWM_NFC_LOG_SECRET || '',
    });
    try {
      fetch(logUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        mode: 'no-cors',
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function downloadVcard(vcard, name) {
    var blob = new Blob([vcard], { type: 'text/vcard' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (name || 'contact').replace(/\s+/g, '-') + '.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  function saveContactFromVcard(vcard, sourceCardData) {
    var name = 'contact';
    var m = vcard.match(/FN:([^\n\r]+)/);
    if (m) name = m[1];
    downloadVcard(vcard, name);
    logTap('tap_save', sourceCardData);
  }

  function isSwmCardUrl(url) {
    if (!url) return false;
    return (
      url.indexOf('BusinessCard') !== -1 ||
      url.indexOf('swm-groundworks') !== -1 ||
      url.indexOf('card.html') !== -1
    );
  }

  function handleIncoming(data, type, ownerCardData) {
    var pref = getPreference();

    if (type === 'url' && isSwmCardUrl(data)) {
      logTap('tap_share', ownerCardData);
      if (global.navigator.serviceWorker && global.navigator.serviceWorker.controller) {
        global.navigator.serviceWorker.controller.postMessage({
          type: 'SWM_CARD_DETECTED',
          url: data,
        });
      }
      global.open(data, '_blank');
      if (pref === 'tap_n_swap') {
        setTimeout(function () {
          shareCard(ownerCardData);
        }, 600);
      }
      return;
    }

    if ((type === 'text' || type === 'mime') && data.indexOf('BEGIN:VCARD') !== -1) {
      if (pref === 'tap_n_save' || pref === 'tap_n_swap' || pref === 'tap_n_share') {
        saveContactFromVcard(data, ownerCardData);
      }
      if (pref === 'tap_n_swap') {
        setTimeout(function () {
          shareCard(ownerCardData);
        }, 600);
      }
      return;
    }

    if (type === 'text' && data.indexOf('SWM_DBC_SHARE:') === 0) {
      var method = data.replace('SWM_DBC_SHARE:', '').trim();
      if (method === 'tap_n_swap') shareCard(ownerCardData);
      else if (method === 'tap_n_share') logTap('tap_share', ownerCardData);
      else if (method === 'tap_n_save') logTap('tap_save', ownerCardData);
      return;
    }

    if (type === 'text' && (data.indexOf('SWMNFC_') === 0 || data.indexOf('SWM|') === 0)) {
      logTap('door', Object.assign({}, ownerCardData || {}, { nfcToken: data }));
    }
  }

  function stopScan() {
    try {
      if (scanAbort) scanAbort.abort();
    } catch (e) {}
    scanAbort = null;
    activeReader = null;
    scanActive = false;
  }

  function shareCard(cardData) {
    cardData = cardData || getCardData();
    if (!cardData) return Promise.reject(new Error('No card data'));
    if (global.SWMDBC) cardData = global.SWMDBC.enrichCardData(cardData);

    if (!('NDEFReader' in global)) {
      return Promise.reject(new Error('Web NFC not supported on this device.'));
    }
    if (writeInFlight) {
      return Promise.reject(new Error('NFC write already in progress.'));
    }

    writeInFlight = true;
    stopScan();

    var writePromise =
      global.SWMDBC && global.SWMDBC.writeNfcTag
        ? global.SWMDBC.writeNfcTag(cardData)
        : new NDEFReader().write({
            records: [{ recordType: 'url', data: global.location.href }],
          });

    return writePromise
      .then(function () {
        logTap('tap_share', cardData);
        if (getPreference() === 'tap_n_swap') logTap('tap_swap', cardData);
        return enableReading(cardData);
      })
      .finally(function () {
        writeInFlight = false;
      });
  }

  function enableReading(cardData) {
    if (!('NDEFReader' in global)) return Promise.resolve(false);
    cardData = cardData || getCardData();
    activeCardData = cardData;

    stopScan();
    var ndef = new NDEFReader();
    activeReader = ndef;
    scanAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;

    ndef.addEventListener('reading', function (event) {
      (event.message.records || []).forEach(function (record) {
        try {
          var decoded = new TextDecoder().decode(record.data);
          if (record.recordType === 'url') {
            handleIncoming(decoded, 'url', cardData);
          } else if (record.recordType === 'text') {
            handleIncoming(decoded, 'text', cardData);
          } else if (record.recordType === 'mime') {
            handleIncoming(decoded, 'mime', cardData);
          }
        } catch (e) {}
      });
    });

    var scanOpts = scanAbort ? { signal: scanAbort.signal } : undefined;
    return ndef
      .scan(scanOpts)
      .then(function () {
        scanActive = true;
        return true;
      })
      .catch(function (err) {
        if (err && err.name === 'AbortError') return false;
        scanActive = false;
        return false;
      });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    var paths = ['nfc-sw.js', './nfc-sw.js', '/BusinessCard/nfc-sw.js'];
    function tryRegister(i) {
      if (i >= paths.length) return;
      navigator.serviceWorker.register(paths[i]).catch(function () {
        tryRegister(i + 1);
      });
    }
    tryRegister(0);
  }

  function applyModeFromUrl() {
    try {
      var params = new URLSearchParams(global.location.search || '');
      var mode = params.get('nfc') || params.get('mode');
      if (mode === 'tap_n_share' || mode === 'tap_n_save' || mode === 'tap_n_swap') {
        if (global.SWMDBC && global.SWMDBC.setNfcSharingMode) {
          global.SWMDBC.setNfcSharingMode(mode);
        }
      }
    } catch (e) {}
  }

  function initLiveCard(cardData) {
    if (!cardData) return;
    applyModeFromUrl();
    if (global.SWMDBC) {
      cardData = global.SWMDBC.enrichCardData(cardData);
      global.SWMDBC.publishCard(cardData);
    }
    activeCardData = cardData;
    global.__swmLiveCardData = cardData;
    registerServiceWorker();
    enableReading(cardData).then(function () {
      showNfcReadyBanner(getPreference());
    });
  }

  function showNfcReadyBanner(mode) {
    if (!global.document || !global.document.body || typeof global.document.createElement !== 'function') {
      return;
    }
    var labels = {
      tap_n_share: 'Tap n Share',
      tap_n_save: 'Tap n Save',
      tap_n_swap: 'Tap n Swap',
    };
    var label = labels[mode] || 'NFC';
    var existing = document.getElementById('swmNfcReadyBanner');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = 'swmNfcReadyBanner';
    banner.className = 'swm-nfc-ready-banner';
    if (typeof banner.setAttribute === 'function') {
      banner.setAttribute('role', 'status');
    }

    if (!('NDEFReader' in global)) {
      banner.textContent =
        'Android phone-to-phone tap → notification needs the S.W.M NFC Share app (android-nfc-share). Chrome Web NFC still works for tags/readers. Save Contact + Share work on all phones.';
      document.body.appendChild(banner);
      return;
    }

    banner.innerHTML =
      '<div class="swm-nfc-banner-row">' +
      '<span><strong>' +
      label +
      ' active</strong> — Hold phones together to exchange (Chrome Android). Door/clock readers supported.</span>' +
      '<label class="swm-nfc-mode-label">Mode ' +
      '<select id="swmNfcModeSelect" aria-label="NFC sharing mode">' +
      '<option value="tap_n_share">Tap n Share</option>' +
      '<option value="tap_n_save">Tap n Save</option>' +
      '<option value="tap_n_swap">Tap n Swap</option>' +
      '</select></label></div>';
    document.body.appendChild(banner);

    var select = document.getElementById('swmNfcModeSelect');
    if (select) {
      select.value = mode;
      select.addEventListener('change', function () {
        if (global.SWMDBC && global.SWMDBC.setNfcSharingMode) {
          global.SWMDBC.setNfcSharingMode(select.value);
        }
        showNfcReadyBanner(select.value);
      });
    }
  }

  function saveContactForCard(cardData) {
    cardData = cardData || getCardData();
    if (!cardData) return;
    var vcard =
      global.SWMDBC && global.SWMDBC.generateVCard
        ? global.SWMDBC.generateVCard(cardData)
        : null;
    if (!vcard) return;
    downloadVcard(vcard, cardData.fullName || cardData.company);
    logTap('tap_save', cardData);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'OPEN_SWM_CARD' && event.data.url) {
        global.open(event.data.url, '_blank');
      }
    });
  }

  global.SWMNFCRuntime = {
    getPreference: getPreference,
    shareCard: shareCard,
    enableReading: enableReading,
    initLiveCard: initLiveCard,
    saveContactForCard: saveContactForCard,
    downloadVcard: downloadVcard,
    logTap: logTap,
    isScanActive: function () {
      return scanActive;
    },
  };
})(window);
