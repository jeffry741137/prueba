const { neon } = require('@neondatabase/serverless');
const ADMIN_PASS = process.env.ADMIN_PASS || 'felipe';
const sql = neon(process.env.DATABASE_URL);

async function getCuentas() {
  try {
    const rows = await sql`SELECT correo, servicio, fecha FROM cuentas ORDER BY fecha DESC`;
    return Object.fromEntries(rows.map(r => [r.correo, { servicio: r.servicio, fecha: r.fecha }]));
  } catch (e) { return {}; }
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pass = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (pass !== ADMIN_PASS) return res.status(401).json({ error: 'No autorizado.' });

  if (req.method === 'GET') {
    const cuentas = await getCuentas();
    return res.json({ cuentas });
  }

  if (req.method === 'POST') {
    const { correo, servicio } = await parseBody(req);
    if (!correo || !servicio) return res.status(400).json({ error: 'Faltan datos.' });
    await sql`
      INSERT INTO cuentas (correo, servicio)
      VALUES (${correo.toLowerCase().trim()}, ${servicio.toLowerCase().trim()})
      ON CONFLICT (correo) DO UPDATE SET servicio = EXCLUDED.servicio
    `;
    const cuentas = await getCuentas();
    return res.json({ ok: true, cuentas });
  }

  if (req.method === 'DELETE') {
    const { correo } = await parseBody(req);
    if (!correo) return res.status(400).json({ error: 'Falta el correo.' });
    await sql`DELETE FROM cuentas WHERE correo = ${correo.toLowerCase().trim()}`;
    const cuentas = await getCuentas();
    return res.json({ ok: true, cuentas });
  }

  return res.status(405).json({ error: 'Método no permitido.' });
};
