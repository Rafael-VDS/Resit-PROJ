const pool = require('../database/db');

const Playlist = {
  create: (id_user, title, description) => {
    const sql = `INSERT INTO Playlists (id_user, title, description) VALUES (?, ?, ?)`;
    return pool.query(sql, [id_user, title, description]);
  },

  update: (id_playlist, title, description) => {
    const sql = `UPDATE Playlists SET title = ?, description = ? WHERE id_playlist = ?`;
    return pool.query(sql, [title, description, id_playlist]);
  },

  delete: (id_playlist) => {
    const sql = `DELETE FROM Playlists WHERE id_playlist = ?`;
    return pool.query(sql, [id_playlist]);
  },

  addVideo: (id_playlist, id_video) => {
    const sql = `INSERT IGNORE INTO Playlist_Videos (id_playlist, id_video) VALUES (?, ?)`;
    return pool.query(sql, [id_playlist, id_video]);
  },

  removeVideo: (id_playlist, id_video) => {
    const sql = `DELETE FROM Playlist_Videos WHERE id_playlist = ? AND id_video = ?`;
    return pool.query(sql, [id_playlist, id_video]);
  }
};

module.exports = Playlist;
