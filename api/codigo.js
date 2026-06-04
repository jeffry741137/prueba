const Imap = require('imap');
const { simpleParser } = require('mailparser');

const CUENTAS_ICLOUD = [
  { user: process.env.ICLOUD_USER,  pass: process.env.ICLOUD_PASS },
  { user: process.env.ICLOUD_USER2, pass: process.env.ICLOUD_PASS2 },
];
const EDGE_CONFIG_ID  = process.env.EDGE_CONFIG_ID;
const VERCEL_TOKEN    = process.env.VERCEL_TOKEN;
const MINUTOS_VALIDOS = 5;

const FILTROS = {
  netflix_hogar:     ['hogar', 'household', 'ubicación', 'tv de tu hogar', 'actualiza tu hogar'],
  netflix_login4:    ['código de inicio de sesión', 'sign-in code', 'ingresa este código para iniciar sesión'],
  netflix_login_url: ['inicio de sesión', 'sign-in', 'iniciar sesión'],
  netflix_login6:    ['código de verificación', 'verification code', 'alguien intenta acceder'],
  netflix_pass:      ['restablece', 'restablecer', 'reset', 'contraseña', 'password'],
  netflix_pin:       ['confirma el cambio', 'pin'],
  netflix_temporal:  ['código de acceso temporal', 'temporary access code', 'acceso temporal'],
  disney:            ['código', 'code', 'verificación', 'verification'],
};

async function getCuentas() {
  try {
    const url = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/cuentas`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` } });
    if (!res.ok) return {};
    const data = await res.json();
    return data.value || data || {};
  } catch (e) { return {}; }
}

function buscarEmailsImap(palabrasClave, aliasCliente, imapUser, imapPass) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: imapUser, password: imapPass,
      host: 'imap.mail.me.com', port: 993, tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 15000, authTimeout: 10000,
    });

    const ahora   = new Date();
    const limite  = new Date(ahora.getTime() - MINUTOS_VALIDOS * 60 * 1000);
    const diezMin = new Date(ahora.getTime() - 10 * 60 * 1000);
    const fechaImap = diezMin.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '');
    const carpetas = ['INBOX', 'INBOX.Principal', 'INBOX.Transacciones', 'INBOX.Novedades', 'INBOX.Promociones'];

    function buscarEnCarpeta(carpeta) {
      return new Promise((resolveBox) => {
        imap.openBox(carpeta, true, (err) => {
          if (err) return resolveBox([]);
          imap.search(['ALL', ['SINCE', fechaImap]], (err, uids) => {
            if (err || !uids || uids.length === 0) return resolveBox([]);
            const fetch = imap.fetch(uids.slice(-15), { bodies: '' });
            const emails = [];
            const parsePromises = [];
            fetch.on('message', (msg) => {
              let buffer = '';
              msg.on('body', (stream) => {
                stream.on('data', (chunk) => { buffer += chunk.toString('utf8'); });
                stream.once('end', () => {
                  const p = simpleParser(buffer).then(parsed => emails.push(parsed)).catch(() => {});
                  parsePromises.push(p);
                });
              });
            });
            fetch.once('error', () => resolveBox([]));
            fetch.once('end', () => {
              setTimeout(async () => { await Promise.allSettled(parsePromises); resolveBox(emails); }, 1500);
            });
          });
        });
      });
    }

    imap.once('ready', () => {
      (async () => {
        try {
          let todos = [];
          for (const carpeta of carpetas) {
            const mails = await buscarEnCarpeta(carpeta).catch(() => []);
            todos = todos.concat(mails);
          }
          imap.end();
          const filtrados = todos.filter(mail => {
            const fecha = mail.date ? new Date(mail.date) : new Date(0);
            if (fecha < limite) return false;
            const asunto = (mail.subject || '').toLowerCase();
            if (!palabrasClave.some(p => asunto.includes(p.toLowerCase()))) return false;
            const cuerpo = (mail.text || '') + ' ' + (mail.html || '');
            return cuerpo.toLowerCase().includes(aliasCliente.toLowerCase());
          });
          filtrados.sort((a, b) => new Date(b.date) - new Date(a.date));
          resolve(filtrados);
        } catch(e) { imap.end(); resolve([]); }
      })();
    });
    imap.once('error', (err) => reject(err));
    imap.connect();
  });
}

function limpiarLink(url) {
  return url.replace(/[\]"'\s>\\)]+$/, '').trim();
}

function extraerValor(servicio, cuerpo) {
  if (servicio === 'netflix_hogar') {
    const patrones = [
      /https:\/\/www\.netflix\.com\/account\/travel\/[^\s"'<>\)\\]+/gi,
      /https:\/\/www\.netflix\.com\/[^\s"'<>\)\\]*travel[^\s"'<>\)\\]+/gi,
      /https:\/\/www\.netflix\.com\/account\/[^\s"'<>\)\\]{30,}/gi,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m?.[0]) return { valor: limpiarLink(m[0]), tipo: 'link' }; }
  }

  // Login 4 dígitos — busca código corto
  if (servicio === 'netflix_login4') {
    const patrones = [
      /ingresa este c[oó]digo para iniciar sesi[oó]n[^0-9]*([0-9]{4})/i,
      /c[oó]digo de inicio de sesi[oó]n[^0-9]*([0-9]{4})/i,
      /sign.in code[^0-9]*([0-9]{4})/i,
      />\s*([0-9]{4})\s*</,
      /\b([0-9]{4})\b/,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m) return { valor: m[1], tipo: 'codigo' }; }
  }

  // Login URL — busca link de inicio de sesión
  if (servicio === 'netflix_login_url') {
    const patrones = [
      /https:\/\/www\.netflix\.com\/login[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/[^\s"'<>\)\[\]\\]*signin[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/[^\s"'<>\)\[\]\\]*sign-in[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/account\/[^\s"'<>\)\[\]\\]{30,}/gi,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m?.[0]) return { valor: limpiarLink(m[0]), tipo: 'link' }; }
  }

  // Login 6 dígitos — código de verificación de dispositivo nuevo
  if (servicio === 'netflix_login6') {
    const patrones = [
      /c[oó]digo de verificaci[oó]n:\s*([0-9]{6})/i,
      /verification code:\s*([0-9]{6})/i,
      /ingresa este c[oó]digo de verificaci[oó]n[^0-9]*([0-9]{6})/i,
      />\s*([0-9]{6})\s*</,
      /\b([0-9]{6})\b/,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m) return { valor: m[1], tipo: 'codigo' }; }
  }

  if (servicio === 'netflix_pass') {
    const patrones = [
      /https:\/\/www\.netflix\.com\/password[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/[^\s"'<>\)\[\]\\]*password[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/[^\s"'<>\)\[\]\\]*reset[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/account\/[^\s"'<>\)\[\]\\]{30,}/gi,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m?.[0]) return { valor: limpiarLink(m[0]), tipo: 'link' }; }
  }

  if (servicio === 'netflix_pin') {
    const patrones = [
      /confirma el cambio[^0-9]*([0-9]{6})/i,
      />\s*([0-9]{6})\s*</,
      /\b([0-9]{6})\b/,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m) return { valor: m[1], tipo: 'codigo' }; }
  }

  if (servicio === 'netflix_temporal') {
    const patrones = [
      /https:\/\/www\.netflix\.com\/account\/travel\/verify[^\s"'<>\)\[\]\\]*/gi,
      /https:\/\/www\.netflix\.com\/[^\s"'<>\)\[\]\\]*travel\/verify[^\s"'<>\)\[\]\\]*/gi,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m?.[0]) return { valor: limpiarLink(m[0]), tipo: 'link' }; }
  }

  if (servicio === 'disney') {
    const patrones = [
      /c[oó]digo[^0-9]*([0-9]{6})/i,
      />\s*([0-9]{6})\s*</,
      /\b([0-9]{6})\b/,
    ];
    for (const p of patrones) { const m = cuerpo.match(p); if (m) return { valor: m[1], tipo: 'codigo' }; }
  }
  return null;
}

function mensajeVacio(s) {
  const msgs = {
    netflix_hogar:     'No hay email de Hogar en los últimos 5 min. Solicítalo desde Netflix.',
    netflix_login4:    'No hay código de inicio de sesión (4 dígitos) en los últimos 5 min.',
    netflix_login_url: 'No hay enlace de inicio de sesión en los últimos 5 min.',
    netflix_login6:    'No hay código de verificación (6 dígitos) en los últimos 5 min.',
    netflix_pass:      'No hay email de restablecimiento en los últimos 5 min.',
    netflix_pin:       'No hay código PIN en los últimos 5 min.',
    netflix_temporal:  'No hay email de código temporal en los últimos 5 min.',
    disney:            'No hay código de Disney+ en los últimos 5 min.',
  };
  return msgs[s] || 'No hay código disponible.';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const servicio = (req.query.servicio || '').trim();
  const correo   = (req.query.correo  || '').toLowerCase().trim();
  if (!servicio || !correo) return res.json({ error: 'Faltan parámetros.' });

  const CUENTAS = await getCuentas();
  const cuenta  = CUENTAS[correo];
  if (!cuenta) return res.json({ error: 'Correo no registrado.' });

  const esNetflix = ['netflix_hogar','netflix_login4','netflix_login_url','netflix_login6','netflix_pass','netflix_pin','netflix_temporal'].includes(servicio);
  const ok =
    (cuenta.servicio === 'netflix' && esNetflix) ||
    (cuenta.servicio === 'disney'  && servicio === 'disney');
  if (!ok) return res.json({ error: 'Este correo no corresponde al servicio solicitado.' });

  try {
    const resultados = await Promise.all(
      CUENTAS_ICLOUD
        .filter(c => c.user && c.pass)
        .map(c => buscarEmailsImap(FILTROS[servicio], correo, c.user, c.pass).catch(() => []))
    );
    const emails = resultados.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!emails || emails.length === 0) return res.json({ error: mensajeVacio(servicio) });
    const mail    = emails[0];
    const cuerpo  = (mail.text || '') + ' ' + (mail.html || '');
    const resultado = extraerValor(servicio, cuerpo);
    if (!resultado) return res.json({ error: 'No se encontró el código en el email.' });
    return res.json({
      success: true,
      valor:   resultado.valor,
      tipo:    resultado.tipo,
      asunto:  mail.subject || '',
      fecha:   mail.date ? new Date(mail.date).toISOString() : new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error IMAP:', err.message);
    return res.json({ error: 'Error al conectar con el correo. Intenta de nuevo.' });
  }
};
