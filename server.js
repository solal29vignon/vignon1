const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Recherche par nom/prénom — Advanced Phone Search (endpoint /v1/search)
app.get('/search-by-name', async (req, res) => {
  const { apiId, firstName, lastName, companyName, country } = req.query;
  if (!apiId || !firstName || !lastName) {
    return res.status(400).json({ error: 'apiId, firstName et lastName requis' });
  }

  let url = `https://gateway.datagma.net/api/ingress/v1/search?apiId=${encodeURIComponent(apiId)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&minimumMatch=1`;
  if (companyName) url += `&companyName=${encodeURIComponent(companyName)}`;
  if (country)     url += `&countryCode=${encodeURIComponent(country)}`;

  try {
    const r    = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Recherche par LinkedIn / email
app.get('/search-by-linkedin', async (req, res) => {
  const { apiId, username, email } = req.query;
  if (!apiId || (!username && !email)) {
    return res.status(400).json({ error: 'apiId + (username ou email) requis' });
  }

  let url = `https://gateway.datagma.net/api/ingress/v1/search?apiId=${encodeURIComponent(apiId)}&minimumMatch=1`;
  if (username) url += `&username=${encodeURIComponent(username)}`;
  if (email)    url += `&email=${encodeURIComponent(email)}`;

  try {
    const r    = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('ProspectCall Proxy — OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy lancé sur le port ${PORT}`));
