const pool = require('../database/db');

const Playlist = {
  // Créer une playlist
  create: (user_id, name) => {
    const sql = `INSERT INTO Playlists (user_id, name) VALUES (?, ?)`;
    return pool.query(sql, [user_id, name]);
  },

  // Récupérer toutes les playlists d'un utilisateur
  getUserPlaylists: (user_id) => {
    const sql = `SELECT * FROM Playlists WHERE user_id = ? ORDER BY created_at DESC`;
    return pool.query(sql, [user_id]);
  },

  // Supprimer une playlist
  delete: (playlist_id, user_id) => {
    const sql = `DELETE FROM Playlists WHERE id = ? AND user_id = ?`;
    return pool.query(sql, [playlist_id, user_id]);
  },

  // Récupérer les vidéos d'une playlist
  getVideos: (playlist_id, user_id) => {
    const sql = `
      SELECT v.*, pv.added_at
      FROM Playlist_Videos pv
      JOIN Videos v ON pv.video_id = v.id
      JOIN Playlists p ON pv.playlist_id = p.id
      WHERE p.id = ? AND p.user_id = ?
      ORDER BY pv.added_at DESC
    `;
    return pool.query(sql, [playlist_id, user_id]);
  },

  // Ajouter une vidéo à une playlist
  addVideo: (playlist_id, video_id, user_id) => {
    const sql = `
      INSERT IGNORE INTO Playlist_Videos (playlist_id, video_id)
      SELECT ?, ? FROM Playlists 
      WHERE id = ? AND user_id = ?
    `;
    return pool.query(sql, [playlist_id, video_id, playlist_id, user_id]);
  },

  // Retirer une vidéo d'une playlist
  removeVideo: (playlist_id, video_id, user_id) => {
    const sql = `
      DELETE pv FROM Playlist_Videos pv
      JOIN Playlists p ON pv.playlist_id = p.id
      WHERE pv.playlist_id = ? AND pv.video_id = ? AND p.user_id = ?
    `;
    return pool.query(sql, [playlist_id, video_id, user_id]);
  },

  // Créer la playlist "À regarder plus tard" pour un utilisateur
  createWatchLaterPlaylist: (user_id) => {
    const sql = `INSERT INTO Playlists (user_id, name) VALUES (?, 'À regarder plus tard')`;
    return pool.query(sql, [user_id]);
  }
};

module.exports = Playlist;
