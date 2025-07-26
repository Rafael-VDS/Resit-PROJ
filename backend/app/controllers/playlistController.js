const Playlist = require('../models/Playlist');

// Récupérer toutes les playlists d'un utilisateur
exports.getUserPlaylists = async (req, res) => {
  const user_id = req.user.id;
  
  try {
    const [playlists] = await Playlist.getUserPlaylists(user_id);
    res.json(playlists);
  } catch (err) {
    console.error('Erreur getUserPlaylists:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

// Créer une nouvelle playlist
exports.createPlaylist = async (req, res) => {
  const user_id = req.user.id;
  const { name } = req.body;
  
  if (!name) return res.status(400).json({ error: "Nom de playlist obligatoire." });

  try {
    await Playlist.create(user_id, name);
    res.status(201).json({ message: "Playlist créée." });
  } catch (err) {
    console.error('Erreur createPlaylist:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

// Supprimer une playlist
exports.deletePlaylist = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await Playlist.delete(id, user_id);
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: "Playlist non trouvée ou non autorisée." });
    }
    res.json({ message: "Playlist supprimée." });
  } catch (err) {
    console.error('Erreur deletePlaylist:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

// Récupérer les vidéos d'une playlist
exports.getPlaylistVideos = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [videos] = await Playlist.getVideos(id, user_id);
    res.json(videos);
  } catch (err) {
    console.error('Erreur getPlaylistVideos:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

// Ajouter une vidéo à une playlist
exports.addVideoToPlaylist = async (req, res) => {
  const { id } = req.params;
  const { video_id } = req.body;
  const user_id = req.user.id;

  if (!video_id) return res.status(400).json({ error: "ID de vidéo obligatoire." });

  try {
    await Playlist.addVideo(id, video_id, user_id);
    res.json({ message: "Vidéo ajoutée à la playlist." });
  } catch (err) {
    console.error('Erreur addVideoToPlaylist:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

// Retirer une vidéo d'une playlist
exports.removeVideoFromPlaylist = async (req, res) => {
  const { id, videoId } = req.params;
  const user_id = req.user.id;

  try {
    await Playlist.removeVideo(id, videoId, user_id);
    res.json({ message: "Vidéo retirée de la playlist." });
  } catch (err) {
    console.error('Erreur removeVideoFromPlaylist:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};
