const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/routes', require('./routes/route.routes'));
app.use('/api/favorites', require('./routes/favorite.routes'));
app.use('/api/transports', require('./routes/transport.routes'));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`If backend is already running, use it directly at http://localhost:${PORT}`);
    console.error(`Or stop the process with: netstat -ano | findstr :${PORT}`);
    process.exit(1);
    return;
  }

  console.error('Server startup error:', err.message);
  process.exit(1);
});