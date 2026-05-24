// ════════════════════════════════════════════════════════
//  ITACHI ZONE — API Admin
//  Maneja agregar/borrar correos en Edge Config
// ════════════════════════════════════════════════════════

const ADMIN_PASS     = process.env.ADMIN_PASS || 'itachi123';
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
const VERCEL_TOKEN   = process.env.VERCEL_TOKEN;
const { createClient } = require('@vercel/edge-config');

async function getCuentas() {
  try {
    const client  = createClient(process.env.EDGE_CONFIG);
    const cuentas = await client.get('cuentas');
    return cuentas || {};
  } catch (e) {
    return {};
  }
}

async function setCuentas(cuentas) {
  const url = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ operation: 'upsert', key: 'cuentas', value: cuentas }]
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Error guardando: ' + err);
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve({}); }
    });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers['authorization'] || '';
  const pass = auth.replace('Bearer ', '').trim();
  if (pass !== ADMIN_PASS)
    return res.status(401).json({ error: 'No autorizado.' });

  if (req.method === 'GET') {
    const cuentas = await getCuentas();
    return res.json({ cuentas });
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { correo, servicio } = body;
    if (!correo || !servicio)
      return res.status(400).json({ error: 'Faltan datos.' });
    const cuentas = await getCuentas();
    cuentas[correo.toLowerCase().trim()] = { servicio: servicio.toLowerCase().trim() };
    await setCuentas(cuentas);
    return res.json({ ok: true, cuentas });
  }

  if (req.method === 'DELETE') {
    const body = await parseBody(req);
    const { correo } = body;
    if (!correo)
      return res.status(400).json({ error: 'Falta el correo.' });
    const cuentas = await getCuentas();
    delete cuentas[correo.toLowerCase().trim()];
    await setCuentas(cuentas);
    return res.json({ ok: true, cuentas });
  }

  return res.status(405).json({ error: 'Método no permitido.' });
};
