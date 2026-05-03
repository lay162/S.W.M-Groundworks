import nodemailer from 'nodemailer';

const ipCounters = new Map();

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function clampString(v, maxLen) {
  if (typeof v !== 'string') return '';
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

const MAX_ATTACHMENTS = 50;
const MAX_TOTAL_BASE64_CHARS = 4_500_000;

function normalizeAttachments(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  let total = 0;
  for (const item of raw.slice(0, MAX_ATTACHMENTS)) {
    if (!item || typeof item !== 'object') continue;
    const name = clampString(String(item.name || 'photo.jpg'), 200);
    const mime = clampString(String(item.mime || 'application/octet-stream'), 120);
    const data = typeof item.data === 'string' ? item.data.replace(/\s/g, '') : '';
    if (!data) continue;
    total += data.length;
    if (total > MAX_TOTAL_BASE64_CHARS) break;
    try {
      Buffer.from(data, 'base64');
    } catch {
      continue;
    }
    out.push({ name, mime, data });
  }
  return out;
}

function rateLimitOk(ip) {
  if (!ip) return true;
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 10;

  const cur = ipCounters.get(ip) ?? { count: 0, startMs: now };
  if (now - cur.startMs > windowMs) {
    ipCounters.set(ip, { count: 1, startMs: now });
    return true;
  }

  if (cur.count >= limit) return false;
  ipCounters.set(ip, { count: cur.count + 1, startMs: cur.startMs });
  return true;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { allow: 'POST' },
      body: 'Method Not Allowed',
    };
  }

  const ip =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    '';

  if (!rateLimitOk(ip)) {
    return json(429, { ok: false, error: 'Too many requests. Please try again shortly.' });
  }

  const rawBody = event.body || '';
  if (rawBody.length > 5_200_000) {
    return json(413, { ok: false, error: 'Request too large. Send fewer or smaller photos and try again.' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON.' });
  }

  // Honeypot: bots often fill hidden fields.
  if (isNonEmptyString(payload.website)) {
    return json(200, { ok: true });
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || ownerEmail;

  const sheetUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const sheetSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

  const hasEmail =
    isNonEmptyString(ownerEmail) &&
    isNonEmptyString(smtpHost) &&
    isNonEmptyString(smtpUser) &&
    isNonEmptyString(smtpPass);

  const hasSheet = isNonEmptyString(sheetUrl) && isNonEmptyString(sheetSecret);

  const sheetIncludePhotos =
    hasSheet &&
    String(process.env.GOOGLE_APPS_SCRIPT_INCLUDE_PHOTOS || '').toLowerCase() === 'true';

  if (!hasEmail && !hasSheet) {
    return json(500, {
      ok: false,
      error:
        'Not configured. Set OWNER_EMAIL + SMTP_* for email, and/or GOOGLE_APPS_SCRIPT_URL + GOOGLE_APPS_SCRIPT_SECRET for Google Sheets. See google-apps-script.txt in this repo.',
    });
  }

  const type = payload.type === 'quote' ? 'quote' : 'quote';

  const name = clampString(payload.name, 120).trim();
  const email = clampString(payload.email, 200).trim();
  const phone = clampString(payload.phone, 60).trim();
  const service = clampString(payload.service, 80).trim();
  const message = clampString(payload.message, 4000).trim();

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(phone) || !isNonEmptyString(message)) {
    return json(400, { ok: false, error: 'Missing required fields.' });
  }

  const timestamp = payload.createdAt && isNonEmptyString(String(payload.createdAt))
    ? clampString(String(payload.createdAt), 80)
    : new Date().toISOString();

  const attachments = normalizeAttachments(payload.attachments);
  const photoNames = attachments.map((a) => a.name).join('; ');
  const photoCount = attachments.length;

  let sheetOk = false;
  if (hasSheet) {
    try {
      const sheetBody = {
        secret: sheetSecret,
        type,
        timestamp,
        name,
        email,
        phone,
        service,
        message,
        ip: ip || '',
        photoCount,
        photoNames,
      };
      if (sheetIncludePhotos && attachments.length) {
        sheetBody.photos = attachments.map((a) => ({ name: a.name, mime: a.mime, data: a.data }));
      }
      const sheetRes = await fetch(sheetUrl.trim(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(sheetBody),
      });
      const sheetJson = await sheetRes.json().catch(() => ({}));
      sheetOk = sheetRes.ok && sheetJson.ok === true;
    } catch {
      sheetOk = false;
    }
  }

  let emailOk = false;
  if (hasEmail) {
    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const subject = `New quote enquiry — ${service || 'Service'} — ${name}`;

    const text = [
      `Type: ${type}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      service ? `Service: ${service}` : null,
      '',
      'Message:',
      message,
      '',
      `IP: ${ip || 'unknown'}`,
      `Time: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const mailAttachments = attachments.map((a) => ({
        filename: a.name,
        content: Buffer.from(a.data, 'base64'),
        contentType: a.mime,
      }));

      await transport.sendMail({
        from: smtpFrom,
        to: ownerEmail,
        replyTo: email,
        subject,
        text:
          text +
          (photoCount
            ? `\n\nPhotos attached: ${photoCount}\nFile names: ${photoNames || '(none)'}`
            : ''),
        attachments: mailAttachments.length ? mailAttachments : undefined,
      });
      emailOk = true;
    } catch {
      emailOk = false;
    }
  }

  if (!emailOk && !sheetOk) {
    return json(500, { ok: false, error: 'Failed to save quote (email and/or Google Sheets).' });
  }

  return json(200, { ok: true });
}

