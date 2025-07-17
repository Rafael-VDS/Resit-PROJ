const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

const userRoutes = require('./app/routes/userRoutes');
const channelRoutes = require('./app/routes/channelRoutes');
const commentRoutes = require('./app/routes/commentRoutes');
const hashtagRoutes = require('./app/routes/hashtagRoutes');
const videoRoutes = require('./app/routes/videoRoutes');
const subscriptionRoutes = require('./app/routes/subscriptionRoutes');
const likeRoutes = require('./app/routes/likeRoutes');
const historyRoutes = require('./app/routes/historyRoutes');
const playlistRoutes = require('./app/routes/playlistRoutes');

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
app.use('/upload', express.static(path.join(__dirname, 'upload/video')));
app.use(
  '/upload/video_image',
  express.static(path.join(__dirname, 'upload/image/video_image'))
);
app.use('/upload/video', express.static(path.join(__dirname, 'upload/video')));

// 📶 Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/comments', commentRoutes);
app.use('/api/hashtags', hashtagRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/playlists', playlistRoutes);

// 📁 Connexion à la base
require('./app/database/db');

// 📚 Routes API
app.use('/api/users', userRoutes);
app.use('/api/channels', channelRoutes);


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
