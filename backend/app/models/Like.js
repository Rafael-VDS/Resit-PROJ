const db = require('../database/db');

const create = async (id_user, id_video) => {
  const query = 'INSERT INTO Likes (user_id, video_id) VALUES (?, ?)';
  return db.query(query, [id_user, id_video]);
};

const deleteLike = async (id_user, id_video) => {
  const query = 'DELETE FROM Likes WHERE user_id = ? AND video_id = ?';
  return db.query(query, [id_user, id_video]);
};

const countByVideo = async (id_video) => {
  const query = 'SELECT COUNT(*) AS totalLikes FROM Likes WHERE video_id = ?';
  return db.query(query, [id_video]);
};

const getUserLike = async (id_user, id_video) => {
  const query = 'SELECT * FROM Likes WHERE user_id = ? AND video_id = ?';
  return db.query(query, [id_user, id_video]);
};

module.exports = {
  create,
  delete: deleteLike,
  countByVideo,
  getUserLike
};
