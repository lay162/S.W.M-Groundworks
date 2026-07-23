/**
 * Shared DBC publish + NFC — every SWM card is NFC-enabled.
 * Same pattern as ATV: universal NDEF token payloads for readers + phone tap.
 */
(function (global) {
  'use strict';

  var REGISTRY_KEY = 'swm_dbc_cards';
  var PREFS_KEY = 'swm_nfc_preferences';
  var CARD_DATA_KEY = 'swm_dbc_data';

  var NFC_READER_BRANDS = {
    universal: { records: ['url', 'token', 'compact', 'vcard', 'token_alt'], unrestricted: true },
    hid: { records: ['url', 'token', 'compact'], unrestricted: true },
    kantech: { records: ['url', 'compact', 'token'], unrestricted: true },
    paxton: { records: ['url', 'token'], unrestricted: true },
    salto: { records: ['url', 'token'], unrestricted: true },
    assa_abloy: { records: ['url', 'token', 'compact'], unrestricted: true },
    dormakaba: { records: ['url', 'token'], unrestricted: true },
    timeclock: { records: ['url', 'token', 'compact'], unrestricted: true },
    generic_ndef: { records: ['url', 'token', 'vcard'], unrestricted: true },
    acs: { records: ['url', 'token'], unrestricted: true },
    nedap: { records: ['url', 'compact'], unrestricted: true },
    igloo: { records: ['url', 'token'], unrestricted: true },
    zktaco: { records: ['token', 'url'], unrestricted: true },
    uface: { records: ['token', 'url'], unrestricted: true },
    honeywell: { records: ['url', 'token', 'compact'], unrestricted: true },
    bosch: { records: ['url', 'token'], unrestricted: true },
    avigilon: { records: ['url', 'token'], unrestricted: true },
    dormakaba_exos: { records: ['url', 'token'], unrestricted: true },
    fujitsu: { records: ['url', 'token'], unrestricted: true },
    mifare_generic: { records: ['url', 'token', 'compact', 'token_alt'], unrestricted: true },
    iso14443a: { records: ['url', 'token', 'compact'], unrestricted: true },
    iso15693: { records: ['url', 'token'], unrestricted: true },
    felica: { records: ['url', 'compact'], unrestricted: true },
    ntag: { records: ['url', 'token', 'vcard'], unrestricted: true },
    cheap_kiosk: { records: ['url', 'token'], unrestricted: true },
  };

  var DEFAULT_CARD = {
    fullName: 'S.W.M Groundworks',
    company: 'S.W.M Groundworks',
    jobTitle: '',
    email: 'info@swm-groundworks.co.uk',
    phone: '+447375996207',
    website: 'https://swm-groundworks.co.uk/',
    tagline:
      'The leading specialist in elite groundworks for the Wirral, Liverpool, Merseyside, Cheshire and North Wales.',
    note: 'Driveways, fencing, patios, landscaping, drainage, foundations.',
    cardUrl: 'https://swm-groundworks.co.uk/BusinessCard/',
  };

  function getUserId() {
    var userId = localStorage.getItem('swm_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('swm_user_id', userId);
    }
    return userId;
  }

  function slugify(name) {
    return (name || 'swm-groundworks')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function generateNfcToken(cardId) {
    return 'SWMNFC_' + cardId + '_' + Math.random().toString(36).substr(2, 12);
  }

  function generateCardId() {
    return 'dbc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  }

  function loadPersistedIdentity() {
    try {
      var list = JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]');
      if (list.length && list[0]) {
        return {
          cardId: list[0].cardId,
          nfcToken: list[0].nfcToken,
        };
      }
      var data = JSON.parse(localStorage.getItem(CARD_DATA_KEY) || 'null');
      if (data && data.cardId) {
        return { cardId: data.cardId, nfcToken: data.nfcToken };
      }
    } catch (e) {}
    return null;
  }

  function identityFromUrl() {
    try {
      var params = new URLSearchParams((global.location && global.location.search) || '');
      var cardId = params.get('card');
      var nfcToken = params.get('token');
      if (cardId && nfcToken) return { cardId: cardId, nfcToken: nfcToken };
      if (cardId) return { cardId: cardId, nfcToken: null };
    } catch (e) {}
    return null;
  }

  function persistIdentityShell(cardId, nfcToken) {
    if (!cardId || !nfcToken) return;
    try {
      var existing = JSON.parse(localStorage.getItem(CARD_DATA_KEY) || 'null') || {};
      existing.cardId = cardId;
      existing.nfcToken = nfcToken;
      localStorage.setItem(CARD_DATA_KEY, JSON.stringify(existing));

      var list = [];
      try {
        list = JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]');
      } catch (e2) {
        list = [];
      }
      if (!list.length) {
        list.push({ cardId: cardId, nfcToken: nfcToken });
      } else {
        list[0].cardId = cardId;
        list[0].nfcToken = nfcToken;
      }
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function enrichCardData(cardData, options) {
    options = options || {};
    var data = Object.assign({}, DEFAULT_CARD, cardData || {});
    var fromUrl = identityFromUrl();
    var persisted = loadPersistedIdentity();

    if (!data.cardId) {
      data.cardId =
        (fromUrl && fromUrl.cardId) ||
        (persisted && persisted.cardId) ||
        generateCardId();
    }
    if (!data.nfcToken) {
      var matchedPersisted =
        persisted && persisted.nfcToken && persisted.cardId === data.cardId
          ? persisted.nfcToken
          : null;
      var matchedUrl =
        fromUrl && fromUrl.nfcToken && fromUrl.cardId === data.cardId
          ? fromUrl.nfcToken
          : null;
      data.nfcToken = matchedUrl || matchedPersisted || generateNfcToken(data.cardId);
    }

    // Keep the same token on this device once assigned (door/clock readers need stability).
    persistIdentityShell(data.cardId, data.nfcToken);

    data.nfcEnabled = true;
    data.nfcCapabilities = {
      tapShare: true,
      tapSave: true,
      tapSwap: true,
      doorAccess: true,
      clockInOut: true,
      walletReady: !!options.walletReady,
    };

    data.companyId = data.companyId || slugify(data.company || 'swm-groundworks');
    data.nfcReaderBrand = options.nfcBrand || data.nfcReaderBrand || 'universal';
    data.nfcUnrestricted = true;
    if (!data.accessZones) data.accessZones = [];
    data.publishedAt = data.publishedAt || new Date().toISOString();
    data.cardUrl = data.cardUrl || buildCardUrl(data);
    return data;
  }

  function buildCardUrl(cardData) {
    var base =
      (cardData && cardData.cardUrl) ||
      (global.location && global.location.origin
        ? global.location.origin + '/BusinessCard/'
        : DEFAULT_CARD.cardUrl);
    try {
      var url = new URL(base, global.location.href);
      url.hash = '';
      if (cardData && cardData.cardId) url.searchParams.set('card', cardData.cardId);
      if (cardData && cardData.nfcToken) url.searchParams.set('token', cardData.nfcToken);
      url.searchParams.set('live', 'true');
      return url.href;
    } catch (e) {
      return base;
    }
  }

  function generateVCard(cardData) {
    var lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:' + (cardData.fullName || ''),
      'ORG:' + (cardData.company || ''),
      'TITLE:' + (cardData.jobTitle || ''),
      'EMAIL;TYPE=INTERNET:' + (cardData.email || ''),
      'TEL;TYPE=CELL:' + (cardData.phone || ''),
      'URL:' + (cardData.website || ''),
      'NOTE:' + (cardData.note || ''),
      'END:VCARD',
    ];
    if (cardData.profilePhoto) {
      lines.splice(lines.length - 1, 0, 'PHOTO;VALUE=URI:' + cardData.profilePhoto);
    }
    return lines
      .filter(function (l) {
        return l.indexOf(':') !== l.length - 1;
      })
      .join('\n');
  }

  function buildNfcReaderPayload(cardData) {
    var enriched = enrichCardData(cardData);
    return {
      token: enriched.nfcToken,
      compact: 'SWM|' + enriched.cardId + '|' + enriched.nfcToken,
      cardId: enriched.cardId,
      url: buildCardUrl(enriched),
      vcard: generateVCard(enriched),
      brand: enriched.nfcReaderBrand || 'universal',
    };
  }

  function buildNdefRecords(cardData) {
    return buildLockScreenNdefRecords(cardData);
  }

  /** URL-first NDEF — lock-screen tap + all reader brands (low-end to enterprise). */
  function buildLockScreenNdefRecords(cardData) {
    var payload = buildNfcReaderPayload(cardData);
    var brandKey = payload.brand || 'universal';
    var brand = NFC_READER_BRANDS[brandKey] || NFC_READER_BRANDS.universal;
    var order = brand.records || NFC_READER_BRANDS.universal.records;
    var tokenAlt = (payload.token || '').replace(/_/g, '-');
    var records = [];
    var map = {
      url: { recordType: 'url', data: payload.url },
      token: { recordType: 'text', data: payload.token },
      token_alt: { recordType: 'text', data: tokenAlt },
      compact: { recordType: 'text', data: payload.compact },
      vcard: { recordType: 'mime', mediaType: 'text/vcard', data: payload.vcard },
    };
    order.forEach(function (key) {
      if (map[key]) records.push(map[key]);
    });
    if (brandKey === 'universal' || brand.unrestricted) {
      ['url', 'token', 'compact', 'vcard'].forEach(function (key) {
        if (map[key] && !records.some(function (r) { return r.data === map[key].data; })) {
          records.push(map[key]);
        }
      });
    }
    var shareMode = 'tap_n_share';
    try {
      shareMode = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}').sharingMethod || 'tap_n_share';
    } catch (e) {}
    records.push({ recordType: 'text', data: 'SWM_DBC_SHARE:' + shareMode });
    return records;
  }

  function saveToRegistry(record) {
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]');
    } catch (e) {
      list = [];
    }
    var idx = list.findIndex(function (c) {
      return c.cardId === record.cardId;
    });
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(list));
    localStorage.setItem(CARD_DATA_KEY, JSON.stringify(record.cardData));
    localStorage.setItem(
      'liveCardUpdate_' + getUserId(),
      JSON.stringify({
        userId: getUserId(),
        timestamp: Date.now(),
        data: record.cardData,
      })
    );
  }

  function publishCard(cardData, options) {
    options = options || {};
    var enriched = enrichCardData(cardData, options);
    var url = buildCardUrl(enriched);
    var record = {
      cardId: enriched.cardId,
      nfcToken: enriched.nfcToken,
      slug: slugify(enriched.fullName || enriched.company),
      url: url,
      cardData: enriched,
      publishedAt: enriched.publishedAt,
    };
    saveToRegistry(record);
    return record;
  }

  function writeNfcTag(cardData) {
    if (!('NDEFReader' in global)) {
      return Promise.reject(new Error('Web NFC not supported on this device/browser.'));
    }
    var ndef = new NDEFReader();
    return ndef.write({ records: buildNdefRecords(cardData) });
  }

  function getNfcSharingPreference() {
    try {
      var prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
      return prefs.sharingMethod || 'tap_n_share';
    } catch (e) {
      return 'tap_n_share';
    }
  }

  function setNfcSharingMode(mode) {
    var allowed = { tap_n_share: 1, tap_n_save: 1, tap_n_swap: 1 };
    if (!allowed[mode]) mode = 'tap_n_share';
    var prefs = {};
    try {
      prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    } catch (e) {}
    prefs.sharingMethod = mode;
    prefs.enabled = true;
    prefs.timestamp = Date.now();
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  function getDefaultCardData() {
    return enrichCardData(Object.assign({}, DEFAULT_CARD));
  }

  global.SWMDBC = {
    enrichCardData: enrichCardData,
    buildCardUrl: buildCardUrl,
    buildNfcReaderPayload: buildNfcReaderPayload,
    buildNdefRecords: buildNdefRecords,
    buildLockScreenNdefRecords: buildLockScreenNdefRecords,
    publishCard: publishCard,
    generateVCard: generateVCard,
    writeNfcTag: writeNfcTag,
    slugify: slugify,
    NFC_READER_BRANDS: NFC_READER_BRANDS,
    getRegistry: function () {
      try {
        return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },
    getDefaultCardData: getDefaultCardData,
    getNfcSharingPreference: getNfcSharingPreference,
    setNfcSharingMode: setNfcSharingMode,
    REGISTRY_KEY: REGISTRY_KEY,
    PREFS_KEY: PREFS_KEY,
    DEFAULT_CARD: DEFAULT_CARD,
  };
})(window);
