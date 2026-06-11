export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = 'e329e423aa';
  const SERVER = 'us16';
  try {
    const response = await fetch(`https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + Buffer.from('anystring:' + API_KEY).toString('base64') },
      body: JSON.stringify({ email_address: email, status: 'subscribed', tags: ['milperks-website', 'pdf-download'] })
    });
    const data = await response.json();
    if (data.id || data.title === 'Member Exists') return res.status(200).json({ success: true });
    return res.status(400).json({ error: data.detail });
  } catch(e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
