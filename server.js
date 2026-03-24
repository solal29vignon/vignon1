const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors()); // autorise tous les navigateurs
app.use(express.json());

// Proxy pour la recherche par nom / entreprise
app.get('/search-by-name', async (req, res) => {
  const { apiId, fullName, companyName } = req.query;
  if (!apiId || !fullName) return res.status(400).json({ error: 'apiId et fullName requis' });

  let url = `https://gateway.datagma.net/api/ingress/v2/full?apiId=${encodeURIComponent(apiId)}&data=MAYD&phoneFull=true&fullName=${encodeURIComponent(fullName)}`;
  if (companyName) url += `&companyName=${encodeURIComponent(companyName)}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy pour la recherche par LinkedIn / email
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
