const Playlist = require('../models/Playlist');

exports.createPlaylist = async (req, res) => {
  const id_user = req.user.id;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Titre obligatoire." });

  try {
    await Playlist.create(id_user, title, description || '');
    res.status(201).json({ message: "Playlist créée." });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.updatePlaylist = async (req, res) => {
  const { id_playlist } = req.params;
  const { title, description } = req.body;

  try {
    await Playlist.update(id_playlist, title, description || '');
    res.json({ message: "Playlist mise à jour." });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.deletePlaylist = async (req, res) => {
  const { id_playlist } = req.params;

  try {
    await Playlist.delete(id_playlist);
    res.json({ message: "Playlist supprimée." });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.addVideoToPlaylist = async (req, res) => {
  const { id_playlist } = req.params;
  const { id_video } = req.body;

  try {
    await Playlist.addVideo(id_playlist, id_video);
    res.json({ message: "Vidéo ajoutée à la playlist." });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.removeVideoFromPlaylist = async (req, res) => {
  const { id_playlist, id_video } = req.params;

  try {
    await Playlist.removeVideo(id_playlist, id_video);
    res.json({ message: "Vidéo retirée de la playlist." });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};
