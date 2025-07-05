const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Création du serveur HTTP
const server = http.createServer(app);

// Initialisation de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // 🔁 Autorise tous les domaines, à restreindre en prod
    methods: ["GET", "POST"]
  }
});

// Routes HTTP classiques
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend Node.js avec Socket.IO !');
});

// Connexion Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Client connecté :', socket.id);

  // Exemple d'événement personnalisé
  socket.on('message', (data) => {
    console.log('📨 Message reçu :', data);
    // Réenvoi à tous les clients connectés
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté :', socket.id);
  });
});

// Lancement du serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur + Socket.IO en ligne sur le port ${PORT}`);
});
