const { Pool } = require('pg');

const ADMIN_PASS = process.env.ADMIN_PASS || 'itachi123';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cuentas (
      correo TEXT PRIMARY KEY,
      servicio TEXT NOT NULL,
      creado_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pass = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (pass !== ADMIN_PASS)
    return res.status(401).json({ error: 'No autorizado.' });

  await initDB();

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT correo, servicio FROM cuentas ORDER BY creado_at DESC');
    const cuentas = {};
    rows.forEach(r => { cuentas[r.correo] = { servicio: r.servicio }; });
    return res.json({ cuentas });
  }

  if (req.method === 'POST') {
    const { correo, servicio } = await parseBody(req);
    if (!correo || !servicio)
      return res.status(400).json({ error: 'Faltan datos.' });
    const c = correo.toLowerCase().trim();
    const s = servicio.toLowerCase().trim();
    await pool.query(
      'INSERT INTO cuentas (correo, servicio) VALUES ($1, $2) ON CONFLICT (correo) DO UPDATE SET servicio = $2',
      [c, s]
    );
    const { rows } = await pool.query('SELECT correo, servicio FROM cuentas ORDER BY creado_at DESC');
    const cuentas = {};
    rows.forEach(r => { cuentas[r.correo] = { servicio: r.servicio }; });
    return res.json({ ok: true, cuentas });
  }

  if (req.method === 'DELETE') {
    const { correo } = await parseBody(req);
    if (!correo) return res.status(400).json({ error: 'Falta el correo.' });
    await pool.query('DELETE FROM cuentas WHERE correo = $1', [correo.toLowerCase().trim()]);
    const { rows } = await pool.query('SELECT correo, servicio FROM cuentas ORDER BY creado_at DESC');
    const cuentas = {};
    rows.forEach(r => { cuentas[r.correo] = { servicio: r.servicio }; });
    return res.json({ ok: true, cuentas });
  }

  return res.status(405).json({ error: 'Método no permitido.' });
};
