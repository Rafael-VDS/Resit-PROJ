const pool = require('../database/db');

const History = {
  create: (user_id, video_id) => {
    const sql = `
      INSERT INTO History (user_id, video_id) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP`;
    return pool.query(sql, [user_id, video_id]);
  },

  update: (id, video_id) => {
    const sql = `
      UPDATE History SET video_id = ?, viewed_at = CURRENT_TIMESTAMP 
      WHERE id = ?`;
    return pool.query(sql, [video_id, id]);
  },

  delete: (user_id, video_id) => {
    const sql = `DELETE FROM History WHERE user_id = ? AND video_id = ?`;
    return pool.query(sql, [user_id, video_id]);
  },

  getAllByUser: (user_id) => {
    const sql = `
      SELECT H.id, H.viewed_at, V.title, V.id as video_id, V.thumbnail_url, V.description, V.is_public, V.created_at
      FROM History H
      JOIN Videos V ON H.video_id = V.id
      WHERE H.user_id = ?
      ORDER BY H.viewed_at DESC`;
    return pool.query(sql, [user_id]);
  },

  deleteAll: (user_id) => {
    const sql = `DELETE FROM History WHERE user_id = ?`;
    return pool.query(sql, [user_id]);
  }
};

module.exports = History;
