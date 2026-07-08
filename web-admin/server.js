const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dashboard', (req, res) => {
  res.json({
    users: 18240,
    artists: 1240,
    streams: 985000,
    revenue: 12840
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Lazer Play admin running on port ${PORT}`);
});
