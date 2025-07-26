const pool = require('../database/db');

const Comment = {
  create: (user_id, video_id, content) => {
    const sql = 'INSERT INTO Comments (user_id, video_id, content) VALUES (?, ?, ?)';
    return pool.query(sql, [user_id, video_id, content]);
  },

  update: (comment_id, user_id, content) => {
    const sql = 'UPDATE Comments SET content = ? WHERE id = ? AND user_id = ?';
    return pool.query(sql, [content, comment_id, user_id]);
  },

  delete: (comment_id, user_id) => {
    const sql = 'DELETE FROM Comments WHERE id = ? AND user_id = ?';
    return pool.query(sql, [comment_id, user_id]);
  },

  getByVideoId: (video_id) => {
    const sql = `
      SELECT c.*, u.username, u.image as user_image 
      FROM Comments c 
      JOIN Users u ON c.user_id = u.id 
      WHERE c.video_id = ? 
      ORDER BY c.created_at DESC
    `;
    return pool.query(sql, [video_id]);
  }
};

module.exports = Comment;
