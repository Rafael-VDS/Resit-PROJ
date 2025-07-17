const pool = require('../database/db');

const History = {
  create: (id_user, id_video) => {
    const sql = `
      INSERT INTO History (id_user, id_video) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP`;
    return pool.query(sql, [id_user, id_video]);
  },

  update: (id_history, id_video) => {
    const sql = `
      UPDATE History SET id_video = ?, viewed_at = CURRENT_TIMESTAMP 
      WHERE id_history = ?`;
    return pool.query(sql, [id_video, id_history]);
  },

  delete: (id_user, id_video) => {
    const sql = `DELETE FROM History WHERE id_user = ? AND id_video = ?`;
    return pool.query(sql, [id_user, id_video]);
  },

  getAllByUser: (id_user) => {
    const sql = `
      SELECT H.id_history, H.viewed_at, V.title, V.id_video, V.thumbnail
      FROM History H
      JOIN Videos V ON H.id_video = V.id_video
      WHERE H.id_user = ?
      ORDER BY H.viewed_at DESC`;
    return pool.query(sql, [id_user]);
  }
};

module.exports = History;
