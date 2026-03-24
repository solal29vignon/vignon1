const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search-by-name', async (req, res) => {
  const { apiId, fullName, companyName } = req.query;
  if (!apiId || !fullName) return res.status(400).json({ error: 'apiId et fullName requis' });

  // On essaie les deux endpoints et on renvoie celui qui donne un résultat
  const urls = [
    // Endpoint v2/full avec phoneFull
    `https://gateway.datagma.net/api/ingress/v2/full?apiId=${encodeURIComponent(apiId)}&data=MAYD&phoneFull=true&fullName=${encodeURIComponent(fullName)}${companyName ? `&companyName=${encodeURIComponent(companyName)}` : ''}`,
    // Endpoint v3/findPhone
    `https://api.datagma.com/api/ingress/v3/findPhone?firstName=${encodeURIComponent(fullName.split(' ')[0])}&lastName=${encodeURIComponent(fullName.split(' ').slice(1).join(' '))}&apiId=${encodeURIComponent(apiId)}${companyName ? `&company=${encodeURIComponent(companyName)}` : ''}`,
  ];

  const results = [];
  for (const url of urls) {
    try {
      const r = await fetch(url);
      const data = await r.json();
      results.push({ url, status: r.status, data });
    } catch (e) {
      results.push({ url, error: e.message });
    }
  }

  // Renvoie tout pour le debug
  res.json({ debug: true, results });
});

app.get('/search-by-linkedin', async (req, res) => {
  const { apiId, username, email } = req.query;
  if (!apiId || (!username && !email)) return res.status(400).json({ error: 'apiId + (username ou email) requis' });

  let url = `https://gateway.datagma.net/api/ingress/v1/search?apiId=${encodeURIComponent(apiId)}&minimumMatch=1`;
  if (username) url += `&username=${encodeURIComponent(username)}`;
  if (email)    url += `&email=${encodeURIComponent(email)}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('ProspectCall Proxy — OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy lancé sur le port ${PORT}`));
