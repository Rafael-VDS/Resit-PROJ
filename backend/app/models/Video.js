const pool = require('../database/db');

const Video = {
  // 📥 Créer une vidéo
  create: ({ user_id, title, description, video_url, thumbnail_url, is_public }) => {
    const sql = `
      INSERT INTO Videos (user_id, title, description, video_url, thumbnail_url, is_public)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return pool.query(sql, [user_id, title, description, video_url, thumbnail_url, is_public]);
  },

  // ✏️ Modifier une vidéo
  update: (id_video, fields, values) => {
    const sql = `UPDATE Videos SET ${fields.join(', ')} WHERE id = ?`;
    return pool.query(sql, [...values, id_video]);
  },

  // ❌ Supprimer une vidéo
  delete: (id_video) => {
    const sql = 'DELETE FROM Videos WHERE id = ?';
    return pool.query(sql, [id_video]);
  },

  // 🔍 Récupérer les vidéos par utilisateur
  getById: (id_video) => {
    const sql = 'SELECT * FROM Videos WHERE id = ?';
    if (isNaN(id_video)) {
      return res.status(400).json({ error: 'ID invalide.' });
    }
    return pool.query(sql, [id_video]);
  },

  // 🔸 Dernières vidéos publiques
  getLatestPublic: (limit = 10) => {
    const sql = `
      SELECT * FROM Videos
      WHERE is_public = 1
      ORDER BY id DESC
      LIMIT ?
    `;
    return pool.query(sql, [limit]);
  },

  // 🔒 Dernières vidéos privées d'un utilisateur
  getLatestPrivateByUser: (user_id, limit = 10) => {
    const sql = `
      SELECT * FROM Videos
      WHERE is_public = 0 AND user_id = ?
      ORDER BY id DESC
      LIMIT ?
    `;
    return pool.query(sql, [user_id, limit]);
  }
};

module.exports = Video;
