const pool = require('../database/db');

const Comment = {
  create: (id_user, id_video, content) => {
    const sql = 'INSERT INTO Comments (id_user, id_video, content) VALUES (?, ?, ?)';
    return pool.query(sql, [id_user, id_video, content]);
  },

  update: (id_comment, id_user, content) => {
    const sql = 'UPDATE Comments SET content = ? WHERE id_comment = ? AND id_user = ?';
    return pool.query(sql, [content, id_comment, id_user]);
  },

  delete: (id_comment, id_user) => {
    const sql = 'DELETE FROM Comments WHERE id_comment = ? AND id_user = ?';
    return pool.query(sql, [id_comment, id_user]);
  }
};

module.exports = Comment;
