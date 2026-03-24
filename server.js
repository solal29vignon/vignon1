const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search-by-name', async (req, res) => {
  const { apiId, firstName, lastName, company, country, city } = req.query;
  if (!apiId || !firstName || !lastName) {
    return res.status(400).json({ error: 'apiId, firstName et lastName requis' });
  }

  let url = `https://gateway.datagma.net/api/ingress/v1/search?apiId=${encodeURIComponent(apiId)}&source=advanced_search&whatsappCheck=true&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;
  if (country) url += `&country=${encodeURIComponent(country)}`;
  if (city)    url += `&city=${encodeURIComponent(city)}`;
  if (company) url += `&companyName=${encodeURIComponent(company)}`;

  try {
    const r    = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/search-by-linkedin', async (req, res) => {
  const { apiId, username, email } = req.query;
  if (!apiId || (!username && !email)) {
    return res.status(400).json({ error: 'apiId + (username ou email) requis' });
  }

  let url = `https://gateway.datagma.net/api/ingress/v1/search?apiId=${encodeURIComponent(apiId)}&source=advanced_search&whatsappCheck=true&minimumMatch=1`;
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
