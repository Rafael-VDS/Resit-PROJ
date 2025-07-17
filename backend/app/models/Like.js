const pool = require('../database/db');

const Like = {
  create: (id_user, id_video) => {
    const sql = 'INSERT INTO Likes (id_user, id_video) VALUES (?, ?)';
    return pool.query(sql, [id_user, id_video]);
  },

  delete: (id_user, id_video) => {
    const sql = 'DELETE FROM Likes WHERE id_user = ? AND id_video = ?';
    return pool.query(sql, [id_user, id_video]);
  },

  countByVideo: (id_video) => {
    const sql = 'SELECT COUNT(*) AS totalLikes FROM Likes WHERE id_video = ?';
    return pool.query(sql, [id_video]);
  }
};

module.exports = Like;
