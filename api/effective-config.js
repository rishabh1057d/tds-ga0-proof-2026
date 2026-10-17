module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const c = { port: 8681, workers: 14, debug: false, log_level: 'warning', api_key: 'key-f509ymjq9v' };
  const sets = Array.isArray(req.query.set) ? req.query.set : req.query.set ? [req.query.set] : [];
  for (const item of sets) {
    const i = item.indexOf('='); if (i < 1) continue;
    const k = item.slice(0, i), v = item.slice(i + 1);
    if (k === 'port' || k === 'workers') c[k] = parseInt(v, 10);
    else if (k === 'debug') c[k] = /^(1|true|yes|on)$/i.test(v);
    else if (k === 'log_level') c[k] = v;
  }
  c.api_key = '****';
  return res.status(200).json(c);
};
