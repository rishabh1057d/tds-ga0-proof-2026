const { createHash } = require('node:crypto');
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Exam-Challenge, X-Exam-Timestamp, X-Exam-Signature');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const body = req.body || {}, id = body.id ?? null;
  if (body.method === 'notifications/initialized') return res.status(202).end();
  if (body.method === 'initialize') return res.status(200).json({ jsonrpc: '2.0', id, result: { protocolVersion: body.params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'tds-ga1', version: '1.0.0' } } });
  if (body.method === 'tools/list') return res.status(200).json({ jsonrpc: '2.0', id, result: { tools: [{ name: 'solve_challenge', description: 'Solve the current exam challenge', inputSchema: { type: 'object', properties: {} } }] } });
  if (body.method === 'tools/call' && body.params?.name === 'solve_challenge') {
    const challenge = req.headers['x-exam-challenge'] || '';
    const text = createHash('sha256').update(`${challenge}:23f3000755@ds.study.iitm.ac.in`).digest('hex').slice(0, 16);
    return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }], isError: false } });
  }
  return res.status(200).json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
};
