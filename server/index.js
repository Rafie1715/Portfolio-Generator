const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

// Import routes yang baru dibuat
const authRoutes = require('./routes/authRoutes');

const portfolioRoutes = require('./routes/portfolioRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Terhubung ke MongoDB!'))
  .catch((err) => console.error('❌ Gagal koneksi ke MongoDB:', err));

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Gunakan authRoutes dengan awalan /api/auth
app.use('/api/auth', authRoutes)

app.use('/api/portfolio', portfolioRoutes);;

app.get('/', (req, res) => {
  res.send('Server Auto Portfolio Generator berjalan dengan mulus! 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ Server menyala di http://localhost:${PORT}`);
});