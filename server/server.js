require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || '').split(',') }));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'CampusConnect API en ligne' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api', require('./routes/feedback'));
app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Serveur démarré')))
  .catch(err => { console.error('Erreur MongoDB:', err.message); process.exit(1); });
