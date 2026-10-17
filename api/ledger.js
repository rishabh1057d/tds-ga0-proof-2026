const rows = require('../data/orders.json');
const rates = { USD: 1, EUR: 1.03, INR: 0.01122 };
const months = { jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12 };
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
function answer(question) {
  const q = String(question || ''), low = q.toLowerCase();
  const monthName = Object.keys(months).find(m => new RegExp(`\\b${m}\\b`, 'i').test(q));
  const yearMatch = q.match(/\b20\d{2}\b/), regionMatch = q.match(/\b(north|south|east|west|central)\b/i);
  const productMatch = [...new Set(rows.map(x=>x.product))].sort((a,b)=>b.length-a.length).find(x=>low.includes(x.toLowerCase()));
  const customerMatch = q.match(/\bC\d{4}\b/i), orderMatch = q.match(/\bORD-\d+\b/i);
  let data = rows;
  if (orderMatch) data = data.filter(x=>x.id.toLowerCase()===orderMatch[0].toLowerCase());
  if (customerMatch) data = data.filter(x=>x.customer.toLowerCase()===customerMatch[0].toLowerCase());
  if (regionMatch) data = data.filter(x=>x.region.toLowerCase()===regionMatch[1].toLowerCase());
  if (productMatch) data = data.filter(x=>x.product.toLowerCase()===productMatch.toLowerCase());
  if (monthName || yearMatch) data = data.filter(x=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',year:'numeric',month:'numeric'}).formatToParts(new Date(x.created_at)).map(v=>[v.type,v.value])); return (!monthName||Number(p.month)===months[monthName])&&(!yearMatch||Number(p.year)===Number(yearMatch[0]));});
  if (orderMatch) { const x=data[0]; return x ? (low.includes('status') ? x.status : low.includes('product') ? x.product : low.includes('customer') ? x.customer : low.includes('region') ? x.region : round(x.amount*(rates[x.currency]||1))) : null; }
  const refund = /refund|refunded/i.test(q);
  const paid = /revenue|sales|sold|purchase|paid|spend|spending|order value/i.test(q) && !refund;
  const selected = data.filter(x => refund ? x.status==='refunded' : paid ? x.status==='paid' : true);
  if (/how many|number of|count of|count\b/i.test(low) && /order|refund|transaction|customer/i.test(low) && !/average|dollar|\busd\b|worth|revenue|amount/i.test(low)) {
    return /customer/i.test(low) && /unique|distinct/i.test(low) ? new Set(selected.map(x=>x.customer)).size : selected.length;
  }
  if (/which product|best.?selling|top[- ]selling|top product|highest.*product|most.*product/i.test(low)) {
    const sums={}; for(const x of selected) sums[x.product]=(sums[x.product]||0)+(/revenue|sales|value/i.test(low)?x.amount*(rates[x.currency]||1):x.qty);
    return Object.entries(sums).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0] ?? null;
  }
  if (/average|avg\b/i.test(low)) return round(selected.length?selected.reduce((s,x)=>s+x.amount*(rates[x.currency]||1),0)/selected.length:0);
  if (/quantity|units|items/i.test(low) && !/revenue|sales/i.test(low)) return selected.reduce((s,x)=>s+x.qty,0);
  if (/product|customer|region/i.test(low) && /list|which|what are|top|most/i.test(low) && !/revenue|sales|refund|spend|amount|total/i.test(low)) return [...new Set(selected.map(x=>/customer/i.test(low)?x.customer:/region/i.test(low)?x.region:x.product))].sort();
  return round(selected.reduce((s,x)=>s+x.amount*(rates[x.currency]||1),0));
}
module.exports = (req,res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST required'});
  try { return res.status(200).json({answer:answer(req.body?.question)}); }
  catch(e) { return res.status(400).json({error:e.message}); }
};


