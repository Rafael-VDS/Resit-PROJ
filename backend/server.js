const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const userRoutes = require('./app/routes/userRoutes');

// 🔧 Charge les variables d'environnement
dotenv.config();

// 📦 Initialise Express
const app = express();
const PORT = process.env.PORT || 5000;

// 📡 Crée un serveur HTTP avec Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 📶 Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Connexion à la base
require('./app/database/db');

// 📚 Routes API
app.use('/api/users', userRoutes);

// 🧪 Route de test
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend FreeTube avec Socket.IO !');
});

// 🔌 Événements Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Client connecté :', socket.id);

  socket.on('message', (data) => {
    console.log('📨 Message reçu :', data);
    io.emit('message', data); // Renvoie le message à tout le monde
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté :', socket.id);
  });
});

// 🚀 Lancer le serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur + Socket.IO en ligne sur http://localhost:${PORT}`);
});
