const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let votes = { A: 0, B: 0, C: 0, D: 0 };
const votedIPs = new Set();

app.post('/vote', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (votedIPs.has(ip)) {
    return res.status(429).json({ success: false, message: 'Už jste hlasoval.' });
  }

  const { answer } = req.body;
  if (votes.hasOwnProperty(answer)) {
    votes[answer]++;
    votedIPs.add(ip);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Neplatná odpověď' });
  }
});

app.get('/results', (req, res) => {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const percentages = {};
  for (const key in votes) {
    percentages[key] = total === 0 ? 0 : ((votes[key] / total) * 100).toFixed(1);
  }
  res.json({ total, percentages, votes });
});

app.post('/reset', (req, res) => {
  const { password } = req.body;
  if (password !== 'tajneheslo') {
    return res.status(403).json({ success: false, message: 'Špatné heslo' });
  }
  votes = { A: 0, B: 0, C: 0, D: 0 };
  votedIPs.clear();
  res.json({ success: true, message: 'Hlasování bylo resetováno' });
});

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
